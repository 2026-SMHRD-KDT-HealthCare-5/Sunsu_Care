// backend/src/controllers/suncareController.js
// 선케어(분석/콜백/히스토리/AI추천) 관련 컨트롤러

const path = require('path');
const { analyzeImage, getTaskStatus } = require('../services/fastapiService');
const { generateRecommendationReason, getCachedReason, setCachedReason } = require('../services/geminiService');
const { calculateCompatibility } = require('../utils/compatibilityScore');
const db = require('../db');

// 콜백 수신 시 file_idx 매핑용 메모리 캐시
// (운영 환경에선 Redis 등으로 옮기는 게 좋지만, 데모 단계에선 메모리로 충분)
const taskFileMap = new Map(); // task_id → file_idx

// ============================================================
// 1) POST /upload : 클라이언트 업로드 → tb_upload 저장 → FastAPI 위임
// ============================================================
const uploadHandler = async (req, res, next) => {
  try {
    if (!req.file || !req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ message: '이미지 파일만 업로드 가능합니다.' });
    }

    const userIdx = req.user?.user_idx;
    if (!userIdx) {
      return res.status(401).json({ message: '사용자 정보를 확인할 수 없습니다.' });
    }

    // multer가 multipart의 비파일 필드는 req.body에 넣어줌
    let userProfile = {};
    if (req.body?.user_profile) {
      try {
        userProfile = typeof req.body.user_profile === 'string'
          ? JSON.parse(req.body.user_profile)
          : req.body.user_profile;
      } catch (e) {
        console.warn('[Upload] user_profile JSON 파싱 실패, 빈 객체로 처리');
      }
    }

    // tb_upload INSERT → file_idx 획득
    const fileName = req.file.originalname || `scan_${Date.now()}.jpg`;
    const fileExt = path.extname(fileName).replace('.', '') || 'jpg';
    const fileSize = req.file.size;

    const [uploadResult] = await db.execute(
      `INSERT INTO tb_upload (user_idx, file_name, file_ext, file_size, uploaded_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [userIdx, fileName, fileExt, fileSize]
    );
    const fileIdx = uploadResult.insertId;
    console.log(`[Upload] user_idx=${userIdx}, file_idx=${fileIdx} 저장 완료`);

    // FastAPI 호출 (request_id에 file_idx 담아 보냄 → 콜백 시 추적용)
    const callbackUrl = `${process.env.EXTERNAL_BASE_URL || 'http://localhost:4000'}/api/suncare/callbacks/suncare`;
    const requestId = String(fileIdx);

    const result = await analyzeImage(req.file.buffer, {
      filename: fileName,
      contentType: req.file.mimetype,
      user_profile: userProfile,
      callback_url: callbackUrl,
      request_id: requestId
    });

    // task_id ↔ file_idx 매핑 저장 (콜백에서 사용)
    if (result.task_id) {
      taskFileMap.set(result.task_id, fileIdx);
    }

    return res.status(202).json({ ...result, file_idx: fileIdx });
  } catch (err) {
    console.error('[Upload Error]:', err);
    if (err.response) {
      console.error('  → FastAPI 응답:', err.response.status, err.response.data);
      return res.status(err.response.status).json({
        message: 'FastAPI 분석 요청 실패',
        detail: err.response.data
      });
    }
    next(err);
  }
};

// ============================================================
// 2) GET /tasks/:taskId : 클라이언트 폴링(분석 상태 조회)
// ============================================================
const getTaskStatusHandler = async (req, res) => {
  try {
    const { taskId } = req.params;
    console.log(`[백엔드] FastAPI 상태 조회 요청: ${taskId}`);
    const status = await getTaskStatus(taskId);
    res.json(status);
  } catch (error) {
    if (error.response) {
      console.error('FastAPI 응답 에러:', error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error('FastAPI 연결 에러:', error.message);
      res.status(500).json({ message: 'FastAPI 연결 실패' });
    }
  }
};

// ============================================================
// 3) POST /callbacks/suncare : FastAPI → 콜백 수신
//    tb_analysis_log + tb_analysis 둘 다 저장
// ============================================================
const callbackHandler = async (req, res) => {
  try {
    const { task_id, status, result, request_id } = req.body;
    const statusLower = String(status || '').toLowerCase();
    console.log(`[Callback] Task ${task_id} 수신 완료, 상태: ${status}`);

    if (statusLower === 'completed' && result) {
      // 3-1. tb_analysis_log (단순 로그)
      const resultString = JSON.stringify(result);
      await db.execute(
        'INSERT INTO tb_analysis_log (task_id, analysis_result) VALUES (?, ?)',
        [task_id, resultString]
      );
      console.log('[Callback] tb_analysis_log 저장 성공');

      // 3-2. tb_analysis (본격 분석 테이블) - file_idx 매핑이 있을 때만 저장
      let fileIdx = null;
      if (request_id && !isNaN(Number(request_id))) {
        fileIdx = Number(request_id);
      } else if (taskFileMap.has(task_id)) {
        fileIdx = taskFileMap.get(task_id);
      }

      if (fileIdx) {
        const ingredients = result?.ingredients || {};
        const detectedIngredients = ingredients.detected_ingredients || [];

        const prodName = result?.prod_name
                       || ingredients?.prod_name
                       || (detectedIngredients[0]?.ingre_name ? "" : '분석된 제품');

        // 🌟 중복 분석 체크: 같은 user의 기존 분석 중 검출 성분이 완전히 동일한 것이 있는지
        // 성분명을 정렬해서 fingerprint 생성 후 비교
        const newFingerprint = detectedIngredients
          .map(i => i.ingre_name)
          .sort()
          .join('|');

        let isDuplicate = false;
        if (newFingerprint) {
          try {
            const [existingRows] = await db.execute(
              `SELECT a.analysis_idx, a.analysis_result
                 FROM tb_analysis a
                 JOIN tb_upload u ON a.file_idx = u.file_idx
                WHERE u.user_idx = (SELECT user_idx FROM tb_upload WHERE file_idx = ?)`,
              [fileIdx]
            );

            for (const row of existingRows) {
              try {
                const parsed = typeof row.analysis_result === 'string'
                  ? JSON.parse(row.analysis_result)
                  : row.analysis_result;
                const existingDetected = parsed?.ingredients?.detected_ingredients || [];
                const existingFingerprint = existingDetected
                  .map(i => i.ingre_name)
                  .sort()
                  .join('|');
                if (existingFingerprint === newFingerprint) {
                  isDuplicate = true;
                  console.log(`[Callback] 🔁 중복 분석 발견 (기존 analysis_idx=${row.analysis_idx}) - 저장 스킵`);
                  break;
                }
              } catch (parseErr) {
                // 파싱 실패한 옛 데이터는 무시
              }
            }
          } catch (dupErr) {
            console.warn('[Callback] 중복 체크 쿼리 실패, 일단 저장 진행:', dupErr.message);
          }
        }

        if (isDuplicate) {
          taskFileMap.delete(task_id);
          return res.status(200).json({ success: true, duplicate: true });
        }

        // 사용자 프로필 조회 (점수 계산용)
        let userProfile = {};
        try {
          const [profileRows] = await db.execute(
            `SELECT p.skin_type, p.activity_env, p.prod_type, p.avoid_ingredient
               FROM tb_profile p
               JOIN tb_upload u ON p.user_id = u.user_idx
              WHERE u.file_idx = ?`,
            [fileIdx]
          );
          if (profileRows.length > 0) {
            userProfile = profileRows[0];
            console.log(`[Callback] 프로필 조회 성공: skin_type=${userProfile.skin_type}`);
          } else {
            console.warn(`[Callback] 프로필 없음 (file_idx=${fileIdx}) → 기본값으로 계산`);
          }
        } catch (profileErr) {
          console.error('[Callback] 프로필 조회 실패:', profileErr.message);
        }

        // 적합도 점수 계산
        const { score, status: calcStatus, breakdown } = calculateCompatibility(detectedIngredients, userProfile);
        console.log(`[Callback] 적합도 점수 계산: ${score}점 (${calcStatus})`, breakdown);

        const prodCode = result?.prod_code || `AUTO-${task_id.slice(0, 8)}`;

        await db.execute(
          `INSERT INTO tb_analysis
              (file_idx, model_name, prod_code, prod_name, analysis_result, suitability_score, analyzed_at)
           VALUES (?, ?, ?, ?, ?, ?, NOW())`,
          [fileIdx, 'YOLO+OCR', prodCode, prodName, resultString, score]
        );
        console.log(`[Callback] tb_analysis 저장 성공 (file_idx=${fileIdx}, score=${score})`);

        taskFileMap.delete(task_id);
      } else {
        console.warn(`[Callback] file_idx 매핑 없음 - tb_analysis 저장 스킵 (task_id=${task_id})`);
      }
    } else if (statusLower === 'failed') {
      console.error(`[Callback] Task ${task_id} 분석 실패`);
      taskFileMap.delete(task_id);
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[Callback Error]:', err);
    return res.status(500).json({ success: false, message: '서버 내부 오류' });
  }
};

// ============================================================
// 4) GET /results/:taskId : 최종 결과 조회 (단순 로그 기반)
// ============================================================
const getResultsHandler = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const [rows] = await db.execute(
      'SELECT analysis_result FROM tb_analysis_log WHERE task_id = ?',
      [taskId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: '아직 분석 결과가 준비되지 않았습니다.' });
    }

    const result = JSON.parse(rows[0].analysis_result);
    return res.json({ status: 'completed', result });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// 5) GET /analyses : 로그인 사용자의 분석 히스토리 (최신 5개)
//    옛 데이터 점수가 0이면 재계산 + DB 업데이트
// ============================================================
const getAnalysesHandler = async (req, res, next) => {
  try {
    const userIdx = req.user?.user_idx;
    if (!userIdx) {
      return res.status(401).json({ message: '사용자 정보를 확인할 수 없습니다.' });
    }

    const [rows] = await db.execute(
      `SELECT a.analysis_idx, a.prod_name, a.suitability_score, a.analyzed_at, a.analysis_result
         FROM tb_analysis a
         JOIN tb_upload u ON a.file_idx = u.file_idx
        WHERE u.user_idx = ?
        ORDER BY a.analyzed_at DESC
        LIMIT 5`,
      [userIdx]
    );

    // 프로필 미리 조회 (점수 재계산용)
    let userProfile = {};
    try {
      const [profileRows] = await db.execute(
        `SELECT skin_type, activity_env, prod_type, avoid_ingredient
           FROM tb_profile WHERE user_id = ?`,
        [userIdx]
      );
      if (profileRows.length > 0) userProfile = profileRows[0];
    } catch (e) {
      console.warn('[/analyses] 프로필 조회 실패, 기본값으로 진행');
    }

    const history = await Promise.all(rows.map(async (row) => {
      let keyIngredients = '';
      let warnIngredients = '';
      let detectedIngredients = [];
      let finalScore = row.suitability_score;
      let finalStatus;

      try {
        const parsed = typeof row.analysis_result === 'string'
          ? JSON.parse(row.analysis_result)
          : row.analysis_result;
        detectedIngredients = parsed?.ingredients?.detected_ingredients || [];

        keyIngredients = detectedIngredients
          .filter(i => i.skin_warning && (i.skin_warning.includes('도움') || i.skin_warning.includes('기능성')))
          .slice(0, 3)
          .map(i => i.ingre_name)
          .join(',');

        warnIngredients = detectedIngredients
          .filter(i => Number(i.ewg_grade) >= 3)
          .slice(0, 3)
          .map(i => i.ingre_name)
          .join(',');

        // 🌟 항상 재계산 (채점 공식이 바뀔 수 있으므로 일관성 유지)
        if (detectedIngredients.length > 0) {
          const calc = calculateCompatibility(detectedIngredients, userProfile);
          const newScore = calc.score;

          // DB 저장값과 다르면 업데이트 (실제 변화 있을 때만 쿼리)
          if (newScore !== finalScore) {
            try {
              await db.execute(
                'UPDATE tb_analysis SET suitability_score = ? WHERE analysis_idx = ?',
                [newScore, row.analysis_idx]
              );
              console.log(`[/analyses] 점수 재계산 반영: analysis_idx=${row.analysis_idx}, ${finalScore} → ${newScore}`);
            } catch (updateErr) {
              console.warn(`[/analyses] 점수 업데이트 실패: ${updateErr.message}`);
            }
          }

          finalScore = newScore;
          finalStatus = calc.status;
        }

        if (!finalStatus) {
          finalStatus = finalScore >= 90 ? '최적'
                      : finalScore >= 75 ? '적합'
                      : finalScore >= 50 ? '주의'
                      : '부적합';
        }
      } catch (e) {
        console.warn(`[/analyses] analysis_result 파싱 실패 (analysis_idx=${row.analysis_idx})`);
        finalStatus = finalScore >= 75 ? '적합' : '주의';
      }

      return {
        analysis_idx: row.analysis_idx,
        prod_name: row.prod_name,
        match_score: finalScore,
        match_status: finalStatus,
        joined_at: row.analyzed_at,
        key_ingredients: keyIngredients,
        warn_ingredients: warnIngredients
      };
    }));

    return res.json(history);
  } catch (err) {
    console.error('[/analyses Error]:', err);
    next(err);
  }
};

// ============================================================
// 6) POST /ai-reason : Gemini AI 추천 이유 생성
// ============================================================
const aiReasonHandler = async (req, res) => {
  try {
    const userIdx = req.user?.user_idx;
    if (!userIdx) {
      return res.status(401).json({ message: '사용자 정보를 확인할 수 없습니다.' });
    }

    const { analysisIdx, prodName, score, keyIng, warnIng } = req.body;

    // 🌟 캐시 키: analysisIdx 있으면 그것 사용, 없으면 (user_idx + 점수 + 성분 fingerprint)
    const cacheKey = analysisIdx
      ? `a:${analysisIdx}`
      : `u:${userIdx}:s:${score}:k:${(keyIng || []).sort().join('|')}:w:${(warnIng || []).sort().join('|')}`;

    // 1. 캐시 hit 시 즉시 반환 (Gemini 호출 안 함)
    const cached = getCachedReason(cacheKey);
    if (cached) {
      console.log(`[AI Reason] 💾 캐시 hit (key=${cacheKey.slice(0, 40)}...)`);
      return res.json({ reason: cached, cached: true });
    }

    console.log(`[AI Reason] user_idx=${userIdx} 신규 요청 → Gemini 호출`);

    // 사용자 프로필 DB에서 직접 조회
    let userProfile = {};
    try {
      const [profileRows] = await db.execute(
        `SELECT skin_type, activity_env, prod_type, avoid_ingredient
           FROM tb_profile WHERE user_id = ?`,
        [userIdx]
      );
      if (profileRows.length > 0) userProfile = profileRows[0];
    } catch (e) {
      console.warn('[AI Reason] 프로필 조회 실패, 미설정으로 진행');
    }

    const reason = await generateRecommendationReason({
      prodName: prodName || '분석 제품',
      score: Number(score) || 0,
      keyIng: Array.isArray(keyIng) ? keyIng : [],
      warnIng: Array.isArray(warnIng) ? warnIng : [],
      skinType: userProfile.skin_type || '미설정',
      activityEnv: userProfile.activity_env || '미설정',
      prodType: userProfile.prod_type || '미설정',
      avoidIngredient: userProfile.avoid_ingredient || '없음'
    });

    // 2. 캐시에 저장 (다음 요청은 캐시 hit)
    setCachedReason(cacheKey, reason);

    console.log(`[AI Reason] 생성 완료 (${reason.length}자) - 캐시 저장`);
    return res.json({ reason, cached: false });
  } catch (err) {
    const msg = err.message || 'AI 추천 이유 생성 실패';
    console.error('[/ai-reason Error]:', msg);

    // 🌟 429 (한도 초과)는 특별 처리: 친절한 메시지
    if (msg.includes('429') || msg.includes('quota')) {
      return res.status(429).json({
        message: 'AI 요청 한도 초과',
        reason: '🕐 AI가 잠시 쉬는 중이에요. 1분 후 다시 시도하시면 새 추천을 받을 수 있어요. 그동안 분석 결과와 성분 정보를 참고해주세요!',
        hint: msg,
        retryAfter: 60
      });
    }

    return res.status(500).json({
      message: msg,
      reason: '사용자 피부 타입과 분석된 성분을 종합하여 적합도를 평가했습니다.',
      hint: msg
    });
  }
};

// ============================================================
// 7) GET /recommendations : 사용자 프로필 기반 추천 제품 TOP 3
//    tb_product 전체에서 사용자 프로필과 매칭하여 점수 내림차순 상위 3개
// ============================================================
const getRecommendationsHandler = async (req, res) => {
  try {
    const userIdx = req.user?.user_idx;
    if (!userIdx) {
      return res.status(401).json({ message: '사용자 정보를 확인할 수 없습니다.' });
    }

    // 사용자 프로필 조회
    let userProfile = {};
    try {
      const [profileRows] = await db.execute(
        `SELECT skin_type, activity_env, prod_type, avoid_ingredient
           FROM tb_profile WHERE user_id = ?`,
        [userIdx]
      );
      if (profileRows.length > 0) userProfile = profileRows[0];
    } catch (e) {
      console.warn('[/recommendations] 프로필 조회 실패, 기본값으로 진행');
    }

    // 제품 + 성분 정보를 한 번에 JOIN 조회
    const [rows] = await db.execute(
      `SELECT
          p.prod_idx, p.prod_name, p.brand_name, p.spf_val, p.pa_val, p.uv_type, p.image_filename,
          i.ingre_name, i.ewg_grade, i.skin_warning
         FROM tb_product p
    LEFT JOIN tb_product_detail pd ON p.prod_idx = pd.prod_idx
    LEFT JOIN tb_ingredient i ON pd.ingre_idx = i.ingre_idx`
    );

    // prod_idx 별로 그룹화 (제품 메타 + 성분 배열)
    const productMap = new Map();
    for (const row of rows) {
      if (!productMap.has(row.prod_idx)) {
        productMap.set(row.prod_idx, {
          prod_idx: row.prod_idx,
          prod_name: row.prod_name,
          brand_name: row.brand_name,
          spf_val: row.spf_val,
          pa_val: row.pa_val,
          uv_type: row.uv_type,
          image_filename: row.image_filename,
          ingredients: []
        });
      }
      if (row.ingre_name) {
        productMap.get(row.prod_idx).ingredients.push({
          ingre_name: row.ingre_name,
          ewg_grade: row.ewg_grade,
          skin_warning: row.skin_warning
        });
      }
    }

    // 각 제품에 대해 적합도 점수 계산
    const scored = Array.from(productMap.values()).map(p => {
      const { score, status } = calculateCompatibility(p.ingredients, userProfile);
      return {
        prod_idx: p.prod_idx,
        prod_name: p.prod_name,
        brand_name: p.brand_name,
        spf_val: p.spf_val,
        pa_val: p.pa_val,
        uv_type: p.uv_type,
        image_filename: p.image_filename,
        score,
        status
      };
    });

    // 점수 내림차순 정렬 + 상위 3개
    scored.sort((a, b) => b.score - a.score);
    const top3 = scored.slice(0, 3);

    console.log(`[/recommendations] user_idx=${userIdx} → ${top3.length}개 추천 (총 제품 ${scored.length}개)`);
    return res.json(top3);
  } catch (err) {
    console.error('[/recommendations Error]:', err);
    return res.status(500).json({ message: '추천 제품 조회 실패', error: err.message });
  }
};

module.exports = {
  uploadHandler,
  getTaskStatusHandler,
  callbackHandler,
  getResultsHandler,
  getAnalysesHandler,
  aiReasonHandler,
  getRecommendationsHandler
};

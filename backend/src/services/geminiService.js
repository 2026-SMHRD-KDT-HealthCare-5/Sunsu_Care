// backend/src/services/geminiService.js
// Google Gemini API 연동 (무료 티어 사용)
// 참고: https://ai.google.dev/api/generate-content

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// gemini-2.0-flash-lite : 무료 티어 한도가 가장 넉넉 (분당 30회), 빠르고 한국어 OK
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash-lite';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// ============================================================
// 🌟 영구 캐시 (파일 기반)
// - 서버 재시작 후에도 캐시 유지 → Gemini 호출 최대 절약
// - 위치: backend/cache/ai_reason_cache.json
// ============================================================
const CACHE_FILE = path.join(__dirname, '..', '..', 'cache', 'ai_reason_cache.json');
const CACHE_MAX_SIZE = 500;
const SAVE_DEBOUNCE_MS = 2000;  // 2초간 추가 변경 없으면 디스크 쓰기

const aiReasonCache = new Map();
let saveTimer = null;

// 시작 시 캐시 파일 로드
(function loadCacheFromDisk() {
  try {
    if (!fs.existsSync(path.dirname(CACHE_FILE))) {
      fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
    }
    if (fs.existsSync(CACHE_FILE)) {
      const raw = fs.readFileSync(CACHE_FILE, 'utf-8');
      const obj = JSON.parse(raw);
      for (const [key, value] of Object.entries(obj)) {
        aiReasonCache.set(key, value);
      }
      console.log(`[Gemini Cache] 디스크에서 ${aiReasonCache.size}개 항목 로드 완료`);
    } else {
      console.log('[Gemini Cache] 캐시 파일 없음 - 빈 캐시로 시작');
    }
  } catch (e) {
    console.warn('[Gemini Cache] 로드 실패, 빈 캐시로 시작:', e.message);
  }
})();

// 디스크 저장 (debounced)
function scheduleSaveToDisk() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      const obj = Object.fromEntries(aiReasonCache);
      fs.writeFileSync(CACHE_FILE, JSON.stringify(obj, null, 2), 'utf-8');
      console.log(`[Gemini Cache] 💾 디스크 저장 완료 (${aiReasonCache.size}개 항목)`);
    } catch (e) {
      console.warn('[Gemini Cache] 디스크 저장 실패:', e.message);
    }
  }, SAVE_DEBOUNCE_MS);
}

function getCachedReason(key) {
  return aiReasonCache.get(key);
}

function setCachedReason(key, value) {
  // 단순 LRU cap (가장 오래된 것부터 삭제)
  if (aiReasonCache.size >= CACHE_MAX_SIZE) {
    const firstKey = aiReasonCache.keys().next().value;
    aiReasonCache.delete(firstKey);
  }
  aiReasonCache.set(key, value);
  scheduleSaveToDisk();
}

// 캐시 크기 조회 (모니터링용)
function getCacheStats() {
  return {
    size: aiReasonCache.size,
    maxSize: CACHE_MAX_SIZE,
    file: CACHE_FILE
  };
}

/**
 * 분석 결과 + 사용자 프로필을 바탕으로 추천 이유 생성
 * @param {object} payload
 * @param {string} payload.prodName - 제품명 (선택)
 * @param {number} payload.score - 적합도 점수
 * @param {string[]} payload.keyIng - 핵심 성분 배열
 * @param {string[]} payload.warnIng - 주의 성분 배열
 * @param {string} payload.skinType - 사용자 피부 타입
 * @param {string} payload.activityEnv - 활동 환경 (선택)
 * @param {string} payload.prodType - 선호 제형 (선택)
 * @param {string|string[]} payload.avoidIngredient - 기피 성분 (선택)
 * @returns {Promise<string>} 생성된 추천 이유 텍스트
 */
async function generateRecommendationReason(payload) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY가 설정되지 않았습니다. backend/.env에 추가해주세요.');
  }

  const {
    score,
    keyIng = [],
    warnIng = [],
    skinType = '미설정',
    activityEnv = '미설정',
    prodType = '미설정',
    avoidIngredient = '없음'
  } = payload;

  // 점수대 판정
  let scoreLevel;
  if (score >= 90) scoreLevel = '최적 (매우 잘 맞음)';
  else if (score >= 75) scoreLevel = '적합 (대체로 잘 맞음)';
  else if (score >= 50) scoreLevel = '주의 (일부 우려)';
  else scoreLevel = '부적합 (사용 비추천)';

  const avoidStr = Array.isArray(avoidIngredient) ? avoidIngredient.join(', ') : avoidIngredient;

  // ===== 개선된 프롬프트 =====
  const prompt = `당신은 10년 경력의 피부과 전문의이자 화장품 성분 분석 전문가입니다.
사용자의 피부 분석 리포트를 바탕으로, 친한 친구에게 설명하듯 솔직하고 구체적인 추천 의견을 작성하세요.

# 작성 규칙 (반드시 지킬 것)
1. 정확히 2~3문장. 한 문단. 줄바꿈 금지.
2. 전체 길이 200자 이내로 간결하게.
3. 마크다운 기호 절대 금지 (*, #, -, > 등)
4. 인사말, 자기소개 금지. 바로 본론부터 시작.
5. "사용자의 피부에 맞춰", "종합적으로 평가하여" 같은 진부한 표현 금지
6. 구체적 성분명을 언급하되, 너무 긴 화학명(15자 이상)은 "자외선 차단 성분" "보습 성분" 같이 효능 위주로 풀어쓸 것
7. 점수가 낮으면 솔직히 "비추천" 톤, 높으면 자신감 있게 "추천" 톤
8. 사용자의 피부 타입/활동환경/기피성분과 연결지어 설명할 것

# 좋은 예시 (점수 92, 건성, 야외활동)
"건성 피부에 깊은 보습을 주는 히알루론산과 글리세린이 핵심으로 들어있어 야외 활동 시 수분 손실을 잘 막아줄 거예요. 자외선 차단 기능성 성분도 잘 잡혀있어 데일리 선케어로 안심하고 쓰실 만한 조합이에요."

# 좋은 예시 (점수 65, 민감성, 옥시벤존 기피)
"기피하시는 자외선 차단 성분 계열이 포함되어 있어 민감성 피부에는 자극 위험이 있어요. 알란토인 같은 진정 성분이 일부 있긴 하지만, 한 번에 넓게 바르기보단 귀 뒤에 패치 테스트부터 해보시는 걸 권해요."

# 나쁜 예시 (이렇게 쓰지 말 것)
"사용자의 피부 타입과 분석된 성분을 종합적으로 고려할 때 본 제품은 적합한 것으로 판단됩니다." (← 너무 형식적이고 정보 없음)
"피부에 도움이 될 것입니다." (← 너무 짧고 구체성 없음)

# 분석 데이터
적합도: ${score}/100점 (${scoreLevel})
핵심 성분 (효능 좋은 것): ${keyIng.length > 0 ? keyIng.join(', ') : '뚜렷한 효능 성분 없음'}
주의 성분 (위험도 높은 것): ${warnIng.length > 0 ? warnIng.join(', ') : '없음'}
사용자 피부 타입: ${skinType}
활동 환경: ${activityEnv}
선호 제형: ${prodType}
사용자 기피 성분: ${avoidStr}

추천 의견 (위 규칙 엄수, 바로 본론부터):`;

  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.85,
          maxOutputTokens: 1500,  // 한국어 토큰 소비 큼 + 안전 마진
          topP: 0.95,
          topK: 40,
          candidateCount: 1,
          // 🌟 gemini-2.5-flash의 thinking 모드 OFF
          // (thinking이 켜져있으면 보이지 않는 내부 사고에 토큰을 다 쓰고 실제 출력이 잘림)
          thinkingConfig: {
            thinkingBudget: 0
          }
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      }
    );

    // 응답 파싱
    const candidate = response.data?.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;
    const finishReason = candidate?.finishReason;

    // 🌟 응답 잘림 감지
    if (finishReason === 'MAX_TOKENS') {
      console.warn('⚠️ [Gemini] MAX_TOKENS - 출력 토큰 한도 도달로 잘림. maxOutputTokens 증가 필요');
    } else if (finishReason === 'SAFETY') {
      console.warn('⚠️ [Gemini] SAFETY - 안전 필터에 걸림. prompt 수정 필요');
    } else if (finishReason && finishReason !== 'STOP') {
      console.warn(`⚠️ [Gemini] 비정상 종료: finishReason=${finishReason}`);
    }

    // 토큰 사용량 로깅 (디버깅용)
    const usage = response.data?.usageMetadata;
    if (usage) {
      console.log(`[Gemini] 토큰 사용: prompt=${usage.promptTokenCount}, response=${usage.candidatesTokenCount}, thinking=${usage.thoughtsTokenCount || 0}, total=${usage.totalTokenCount}`);
    }

    if (!text) {
      console.warn('[Gemini] 응답에 텍스트가 없습니다:', JSON.stringify(response.data));
      return '추천 이유를 생성하는 데 실패했습니다. 잠시 후 다시 시도해주세요.';
    }

    return text.trim();
  } catch (err) {
    // 더 자세한 에러 정보 출력
    const statusCode = err.response?.status;
    const errorBody = err.response?.data;
    const errorMessage = errorBody?.error?.message || err.message;

    console.error('═══ [Gemini API 호출 실패] ═══');
    console.error('  Status Code:', statusCode);
    console.error('  Error Message:', errorMessage);
    console.error('  Full Response:', JSON.stringify(errorBody, null, 2));
    console.error('  Used Model:', GEMINI_MODEL);
    console.error('  API Key Length:', GEMINI_API_KEY ? GEMINI_API_KEY.length : 'NOT SET');
    console.error('═══════════════════════════════');

    // 자주 발생하는 에러에 대한 힌트 제공
    let hint = '';
    if (statusCode === 400) hint = ' (요청 형식 문제. prompt 너무 길거나 형식 오류)';
    else if (statusCode === 403) hint = ' (API 키 권한 없음. 키 재확인 필요)';
    else if (statusCode === 404) {
      hint = ` (모델 "${GEMINI_MODEL}"을(를) 찾을 수 없음. .env의 GEMINI_MODEL을 'gemini-2.5-flash' 또는 'gemini-2.0-flash'로 설정. gemini-1.5는 폐기됨)`;
    }
    else if (statusCode === 429) hint = ' (분당 요청 한도 초과. 잠시 후 재시도)';
    else if (!statusCode) hint = ' (네트워크 또는 타임아웃 문제)';

    throw new Error(`Gemini 호출 실패 [${statusCode || 'NETWORK'}]: ${errorMessage}${hint}`);
  }
}

module.exports = {
  generateRecommendationReason,
  getCachedReason,
  setCachedReason,
  getCacheStats
};

// backend/src/services/geminiService.js
// Google Gemini API 연동 (무료 티어 사용)
// 참고: https://ai.google.dev/api/generate-content

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// ============================================================
// 🌟 자동 모델 우회 체인
//   - 1순위: .env 의 GEMINI_MODEL
//   - 2~N순위: 자동 폴백 후보 (429 시 즉시 다음 모델로 시도)
//   - .env 에 GEMINI_MODELS=a,b,c 쓰면 우선순위 직접 지정 가능
// ============================================================
const DEFAULT_MODEL_CANDIDATES = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash-lite',
];

function buildModelChain() {
  // 1) GEMINI_MODELS 환경변수로 명시한 경우 → 그대로 사용
  if (process.env.GEMINI_MODELS) {
    const list = process.env.GEMINI_MODELS.split(',').map(s => s.trim()).filter(Boolean);
    if (list.length > 0) return list;
  }
  // 2) GEMINI_MODEL(primary) + 기본 후보 합치기 (중복 제거)
  const primary = process.env.GEMINI_MODEL || DEFAULT_MODEL_CANDIDATES[0];
  const chain = [primary];
  for (const m of DEFAULT_MODEL_CANDIDATES) {
    if (!chain.includes(m)) chain.push(m);
  }
  return chain;
}

const MODEL_CHAIN = buildModelChain();
console.log(`[Gemini] 모델 우회 체인: ${MODEL_CHAIN.join(' → ')}`);

// 모델별 cooldown (429 받은 모델은 retryDelay 동안 skip)
const modelCooldownUntil = new Map();

// 429 응답의 RetryInfo 에서 retryDelay 추출 (예: "24s" → 24)
function extractRetryDelaySeconds(errorBody) {
  const details = errorBody?.error?.details;
  if (!Array.isArray(details)) return null;
  for (const d of details) {
    if (typeof d['@type'] === 'string' && d['@type'].includes('RetryInfo') && d.retryDelay) {
      const sec = parseFloat(String(d.retryDelay).replace('s', ''));
      if (!Number.isNaN(sec)) return Math.ceil(sec);
    }
  }
  return null;
}

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

  // 특정 모델 1회 호출
  const callGeminiWithModel = (model) => axios.post(
    `${GEMINI_API_BASE}/${model}:generateContent?key=${GEMINI_API_KEY}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.85,
        maxOutputTokens: 1500,
        topP: 0.95,
        topK: 40,
        candidateCount: 1,
        thinkingConfig: { thinkingBudget: 0 }
      }
    },
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000
    }
  );

  // 🌟 모델 체인 순회: 429 면 cooldown 등록 + 다음 모델 시도
  let response = null;
  let usedModel = null;
  let lastError = null;
  const triedSummary = [];

  for (const model of MODEL_CHAIN) {
    const cooldownEnd = modelCooldownUntil.get(model) || 0;
    if (Date.now() < cooldownEnd) {
      const remainSec = Math.ceil((cooldownEnd - Date.now()) / 1000);
      console.log(`[Gemini] ⏸ ${model} cooldown 중 (${remainSec}s 남음) → skip`);
      triedSummary.push(`${model}=cooldown(${remainSec}s)`);
      continue;
    }

    try {
      response = await callGeminiWithModel(model);
      usedModel = model;
      triedSummary.push(`${model}=OK`);
      console.log(`[Gemini] ✅ ${model} 호출 성공`);
      break;
    } catch (err) {
      lastError = err;
      const sc = err.response?.status;
      const body = err.response?.data;

      if (sc === 429) {
        // retryDelay 만큼 이 모델을 cooldown 등록 → 다음 모델 즉시 시도
        const retrySec = extractRetryDelaySeconds(body) || 60;
        modelCooldownUntil.set(model, Date.now() + retrySec * 1000);
        console.warn(`[Gemini] ⚠️ ${model} 429 한도 초과 → ${retrySec}s cooldown 등록, 다음 모델로 우회 시도`);
        triedSummary.push(`${model}=429(${retrySec}s)`);
        continue;
      }

      if (sc === 404) {
        // 폐기/오타 모델 → 그냥 다음 후보로
        console.warn(`[Gemini] ⚠️ ${model} 404 모델 없음 → 다음 모델로 우회 시도`);
        triedSummary.push(`${model}=404`);
        continue;
      }

      // 5xx / 네트워크 → 같은 모델 1초 후 1회만 재시도, 그래도 실패면 다음 모델
      const isTransient = !sc || (sc >= 500 && sc < 600);
      if (isTransient) {
        try {
          await new Promise(r => setTimeout(r, 1000));
          response = await callGeminiWithModel(model);
          usedModel = model;
          triedSummary.push(`${model}=OK(retry)`);
          console.log(`[Gemini] ✅ ${model} 재시도 성공`);
          break;
        } catch (err2) {
          lastError = err2;
          triedSummary.push(`${model}=transient`);
          continue;
        }
      }

      // 그 외(400/403 등 키/요청 오류) → 다른 모델도 마찬가지로 실패할 가능성 높음 → 즉시 throw
      triedSummary.push(`${model}=${sc}`);
      throw err;
    }
  }

  if (!response) {
    // 모든 모델 실패
    console.error(`[Gemini] ❌ 모든 모델 호출 실패. 시도: ${triedSummary.join(' / ')}`);
    const errorBody = lastError?.response?.data;
    const errorMessage = errorBody?.error?.message || lastError?.message || '알 수 없는 오류';
    throw new Error(`Gemini 호출 실패 [429-all-models]: 모든 후보 모델 한도 초과 (${triedSummary.join(', ')}). 마지막 메시지: ${errorMessage}`);
  }

  try {
    // 응답 파싱
    const candidate = response.data?.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;
    const finishReason = candidate?.finishReason;

    if (finishReason === 'MAX_TOKENS') {
      console.warn('⚠️ [Gemini] MAX_TOKENS - 출력 토큰 한도 도달로 잘림');
    } else if (finishReason === 'SAFETY') {
      console.warn('⚠️ [Gemini] SAFETY - 안전 필터에 걸림');
    } else if (finishReason && finishReason !== 'STOP') {
      console.warn(`⚠️ [Gemini] 비정상 종료: finishReason=${finishReason}`);
    }

    const usage = response.data?.usageMetadata;
    if (usage) {
      console.log(`[Gemini] 토큰 사용 (${usedModel}): prompt=${usage.promptTokenCount}, response=${usage.candidatesTokenCount}, total=${usage.totalTokenCount}`);
    }

    if (!text) {
      console.warn('[Gemini] 응답에 텍스트가 없습니다:', JSON.stringify(response.data));
      return '추천 이유를 생성하는 데 실패했습니다. 잠시 후 다시 시도해주세요.';
    }

    return text.trim();
  } catch (err) {
    const statusCode = err.response?.status;
    const errorBody = err.response?.data;
    const errorMessage = errorBody?.error?.message || err.message;
    console.error('═══ [Gemini 응답 파싱 실패] ═══');
    console.error('  Status Code:', statusCode);
    console.error('  Error Message:', errorMessage);
    console.error('  Used Model:', usedModel);
    console.error('═══════════════════════════════');
    throw new Error(`Gemini 응답 처리 실패 [${statusCode || 'PARSE'}]: ${errorMessage}`);
  }
}

module.exports = {
  generateRecommendationReason,
  getCachedReason,
  setCachedReason,
  getCacheStats
};

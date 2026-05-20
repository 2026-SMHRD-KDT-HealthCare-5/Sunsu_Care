const axios = require('axios');
const FormData = require('form-data');
const crypto = require('crypto');

// .env에서 환경 변수 불러오기 (이미 상단에 선언되어 있음)
const FASTAPI = process.env.FASTAPI_BASE_URL;
const INTERNAL_TOKEN = process.env.INTERNAL_TOKEN;

/**
 * 1. AI 분석 시작 요청 (로직 유지)
 */
async function startSuncareAnalyze(file, options = {}) {
  const form = new FormData();
  form.append('file', file.buffer, { 
    filename: options.filename || 'image.jpg', 
    contentType: options.contentType || 'image/jpeg' 
  });
  
  // 콜백 URL 구성
  if (options.callback_url) {
    form.append('callback_url', options.callback_url);
  }
  
  const requestId = options.request_id || crypto.randomUUID();
  form.append('request_id', requestId);

  const { data } = await axios.post(
    `${FASTAPI}/api/v1/suncare/analyze`,
    form,
    { 
      headers: { 
        ...form.getHeaders(), 
        'Authorization': `Bearer ${INTERNAL_TOKEN}` 
      }, 
      timeout: 15000 
    }
  );

  return { task_id: data.task_id, status: data.status };
}

/**
 * 2. 분석 결과 조회 (DB 삭제 후 API 직접 조회로 일원화)
 */
async function getTaskFromApi(taskId) {
  try {
    const { data } = await axios.get(
      `${FASTAPI}/api/v1/tasks/${taskId}`,
      { 
        headers: { 'Authorization': `Bearer ${INTERNAL_TOKEN}` }, 
        timeout: 10000 
      }
    );
    return data;
  } catch (error) {
    console.error("FastAPI 상태 조회 실패:", error.message);
    throw error;
  }
}

module.exports = {
  startSuncareAnalyze,
  getTaskStatus: getTaskFromApi // 이름 통일
};
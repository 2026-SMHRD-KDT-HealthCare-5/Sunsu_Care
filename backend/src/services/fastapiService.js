// backend/src/services/fastapiService.js
const axios = require('axios');
const FormData = require('form-data');
const crypto = require('crypto');

// .env에 설정된 URL을 사용하되, 없으면 기본값 사용
const FASTAPI = process.env.FASTAPI_BASE_URL || 'http://127.0.0.1:8000';
const INTERNAL_TOKEN = process.env.INTERNAL_TOKEN;

// 1. AI 분석 시작 요청
async function analyzeImage(fileBuffer, options = {}) {
  const form = new FormData();
  form.append('file', fileBuffer, { 
    filename: options.filename || 'image.jpg', 
    contentType: options.contentType || 'image/jpeg' 
  });
  
  if (options.user_profile) form.append('user_profile', JSON.stringify(options.user_profile));
  if (options.callback_url) form.append('callback_url', options.callback_url);
  
  const requestId = options.request_id || crypto.randomUUID();
  form.append('request_id', requestId);
  
  console.log("=== Node.js가 요청을 보낼 주소 확인 ===");
  console.log("FASTAPI_BASE_URL:", FASTAPI); 
  
  const url = `${FASTAPI}/api/v1/suncare/analyze`;
  console.log(`[FastAPI 요청] POST ${url}`);

  const { data } = await axios.post(url, form, { 
    headers: { ...form.getHeaders(), 'Authorization': `Bearer ${INTERNAL_TOKEN}` }, 
    timeout: 15000 
  });

  return { task_id: data.task_id, status: data.status };
}

// 2. 상태 조회 (중복 제거 & 에러 상세 출력)
async function getTaskStatus(taskId) {
  const url = `${FASTAPI}/api/v1/tasks/${taskId}`;
  console.log(`[FastAPI 요청] GET ${url}`);
  
  try {
    const { data } = await axios.get(url, {
      headers: { 'Authorization': `Bearer ${INTERNAL_TOKEN}` },
      timeout: 10000
    });
    return data;
  } catch (error) {
    // 상세 에러 로그 출력
    if (error.response) {
      console.error(`[FastAPI 에러] 상태코드: ${error.response.status}, 메시지: ${JSON.stringify(error.response.data)}`);
    } else {
      console.error(`[FastAPI 통신실패] 메시지: ${error.message}`);
    }
    throw error;
  }
}

module.exports = {
  analyzeImage,
  getTaskStatus
};
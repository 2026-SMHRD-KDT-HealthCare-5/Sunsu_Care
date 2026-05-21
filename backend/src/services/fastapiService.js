// backend/src/services/fastapiService.js

const axios = require('axios');
const FormData = require('form-data');
const crypto = require('crypto');

const FASTAPI = process.env.FASTAPI_BASE_URL;
const INTERNAL_TOKEN = process.env.INTERNAL_TOKEN;

 // 1. AI 분석 시작 요청 (이미지 + 유저 프로필 전송)
async function analyzeImage(fileBuffer, options = {}) { // 이름을 컨트롤러와 맞춤
  const form = new FormData();
  
  // 이미지 추가
  form.append('file', fileBuffer, { 
    filename: options.filename || 'image.jpg', 
    contentType: options.contentType || 'image/jpeg' 
  });
  
  // 유저 프로필 데이터를 JSON 문자열로 변환하여 추가
  if (options.user_profile) {
    form.append('user_profile', JSON.stringify(options.user_profile));
  }
  
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
  analyzeImage, // 컨트롤러 호출 이름에 맞게 변경
  getTaskStatus: getTaskFromApi
};
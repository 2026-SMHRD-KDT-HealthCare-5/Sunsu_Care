import axios from 'axios';
import FormData from 'form-data';
import crypto from 'crypto';
import db from '../db/index.js'; // DB 커넥션 풀 가져오기

const FASTAPI = process.env.FASTAPI_BASE_URL;
const INTERNAL_TOKEN = process.env.INTERNAL_TOKEN;

/**
 * 1. AI 분석 시작 요청 (FastAPI에게 작업을 던짐)
 */
export async function startSuncareAnalyze(file) {
  const form = new FormData();
  // Buffer 데이터를 전달할 때는 파일명과 컨텐츠 타입을 명시하는 것이 중요합니다.
  form.append('file', file.buffer, { 
    filename: file.originalname, 
    contentType: file.mimetype 
  });
  
  // FastAPI가 분석 완료 후 호출할 Express의 주소
  form.append('callback_url', `${process.env.EXTERNAL_BASE_URL}/api/callbacks/suncare`);
  
  const requestId = crypto.randomUUID();
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

  // FastAPI가 생성한 task_id와 함께 반환
  return { taskId: data.task_id, requestId, status: data.status };
}

/**
 * 2. 분석 결과 조회 (FastAPI를 거치지 않고 MySQL DB에서 직접 조회)
 * 💡 이 방식이 FastAPI 서버 부하를 줄이고 응답 속도가 더 빠릅니다.
 */
export async function getTaskStatusFromDb(taskId) {
  try {
    const query = `
      SELECT task_id, request_id, status, result, updated_at 
      FROM ocr_tasks 
      WHERE task_id = ?
    `;
    
    // index.js에서 만든 pool을 사용하여 쿼리 실행
    const [rows] = await db.query(query, [taskId]);

    if (rows.length === 0) {
      return null;
    }

    return {
      taskId: rows[0].task_id,
      requestId: rows[0].request_id,
      status: rows[0].status,
      result: rows[0].result, // JSON 컬럼은 자동으로 객체로 변환됨
      updatedAt: rows[0].updated_at
    };
  } catch (error) {
    console.error("DB 조회 중 오류 발생:", error);
    throw error;
  }
}

/**
 * 3. (선택사항) FastAPI에게 직접 상태 물어보기
 * DB 조회가 여의치 않거나 FastAPI의 실시간 상태가 필요할 때 사용합니다.
 */
export async function getTaskFromApi(taskId) {
  const { data } = await axios.get(
    `${FASTAPI}/api/v1/tasks/${taskId}`,
    { 
      headers: { 'Authorization': `Bearer ${INTERNAL_TOKEN}` }, 
      timeout: 10000 
    }
  );
  return data;
}
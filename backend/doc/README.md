# 서버 요청 흐름
클라이언트 요청 
↓
routes: (각 요청에 대한 API 설정) 
↓
controllers: [요청(req)/응답(res) 처리 및 services 호출] 
↓
services: (요청에 대한 실제 로직 처리) 
↓
 DB: (요청받은 데이터를 조회후 services로 반환) 
↓
server: (조회한 데이터를 바탕으로 로직 처리 후 결과 생성)
↓
controller: (JSON 형태로 응답 생성)
↓
클라이언트 응답

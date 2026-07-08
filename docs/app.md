# app.js 정리

주요 역할:
- 서버 설정
- 미들웨어 설정
- 라우터 연결
- CORS 설정
- 정적 파일 제공
- 전역 에러 처리 미들웨어 등록

---
## 1. npm(Node Package Manager)
Node.js에서 필요한 외부 패키지, 라이브러리, 프레임워크를 설치하고 관리해주는 도구

- express
- cors
- bcrypt
- jsonwebtoken
- mysql2

---
## 2. Express 프레임워크
Node.js를 사용해서 서버를 쉽게 만들 수 있게 도와주는 웹 프레임워크

기능:
- Routes 관리
- Middleware 등록
- 요청(req) / 응답(res) 처리
- API 서버 구성
- 에러 처리

---
## 3. URL 구조
URL은 클라이언트가 서버의 특정 자원에 접근하기 위한 주소

구성 요소:

```txt
Protocol
- http://, https://

Host
- localhost

Port
- :4000, :5173

Path
- /api/auth/login

QueryString
- ?type=user (?name=정현우&age=26)

Fragment
- #section
```

---
## 4. CORS와 SOP

### 4-1. SOP(Same-Origin Policy: 동일 출처 정책)
브라우저는 보안상 출처가 다른 요청/응답 접근을 기본적으로 제한

현재 프로젝트 주소:

```txt
frontend: http://localhost:5173
backend : http://localhost:4000
```

---
### 4-2. Origin 판단 기준
```txt
Protocol + Host + Port  -> http://localhost:5173
```

즉, 아래 두 주소는 포트 번호가 다르기 때문에 다른 Origin이다.

```txt
http://localhost:5173
http://localhost:4000
```

---
### 4-3. CORS(Cross-Origin Resource Sharing: 교차 출처 자원 공유 방식)
1. CORS는 다른 출처의 요청을 서버가 허용할 수 있게 하는 규칙
2. 브라우저는 SOP 때문에 다른 출처 요청을 기본적으로 제한하지만, 서버가 CORS 허용 응답 헤더를 보내면 브라우저가 응답 데이터를 사용할 수 있게 한다.

---
### 4-4. 현재 app.js의 CORS 설정

현재 `app.js`에서는 프론트 주소만 허용한다.

```js
app.use(cors({
  origin: "http://localhost:5173"
}));
```

의미:
```txt
http://localhost:5173에서 오는 요청만 허용한다. (모든 Origin을 허용하는 설정이 아님)
```

모든 Origin을 허용하는 경우
```js
app.use(cors());
```

---
### 4-5. CORS 요청/응답 흐름

```txt
1. frontend가 backend API로 요청을 보냄

2. 브라우저가 요청 헤더에 Origin을 붙여서 backend로 보냄
   Origin: http://localhost:5173

3. backend의 app.js에서 CORS 설정을 확인함
   app.use(cors({ origin: "http://localhost:5173" }))

4. 허용된 Origin이면 backend가 응답 헤더에 CORS 허용 값을 담아 응답함
   Access-Control-Allow-Origin: http://localhost:5173

5. 브라우저는 응답 헤더를 확인하고,
   허용된 Origin이면 frontend 코드에서 응답 데이터를 사용할 수 있게 함
```

---
### 4-6. CORS 정리

프론트엔드는 `http://localhost:5173`에서 실행되고, 백엔드는 `http://localhost:4000`에서 실행된다.

두 주소는 포트 번호가 다르기 때문에 브라우저의 SOP 기준에서는 서로 다른 Origin으로 판단된다.

브라우저는 API 요청을 보낼 때 요청 헤더에 `Origin: http://localhost:5173`을 담아 백엔드에 전달한다.

백엔드에서는 `app.use(cors({ origin: "http://localhost:5173" }))`를 적용했기 때문에 응답 헤더에 `Access-Control-Allow-Origin: http://localhost:5173`이 반환된다.

즉, 모든 Origin을 허용하는 것이 아니라 지정한 프론트 주소의 요청만 허용한다.

---
## 5. app 객체
Express 서버 설정을 저장하고, 미들웨어와 라우터를 연결하는 객체이다.

```js
const app = express();
```

역할:
```txt
- 서버 설정 저장
- 미들웨어 등록
- 라우터 연결
- 정적 파일 제공
- 전역 에러 처리
- 요청/응답 흐름 관리
```

---
## 6. app.use()
Express에 미들웨어나 라우터를 등록할 때 사용

### 6-1. 미들웨어 등록

```js
app.use(express.json());
```
### 6-2. 특정 경로에 라우터 연결

```js
app.use("/api/auth", authRoutes);
```

---
## 7. app.js 주요 미들웨어

### 7-1. cors()

```js
app.use(cors({
  origin: "http://localhost:5173"
}));
```

프론트엔드 주소에서 오는 요청을 백엔드가 허용하도록 설정한다.
현재 설정에서는 `http://localhost:5173`에서 오는 요청만 허용한다.

---
### 7-2. express.json()

```js
app.use(express.json());
```

JSON 형태로 들어온 요청 body를 `req.body`에서 읽을 수 있게 해줌

예시:

```json
{
  "email": "test@test.com",
  "password": "1234"
}
```

controller:
```js
const { email, password } = req.body;
```

---
## 8. 전역 에러 처리 미들웨어

전역 에러 처리 미들웨어는 라우터, controller, service에서 처리하지 못한 에러를 마지막에 한 번에 처리하는 역할을 한다.
```js
app.use((err, req, res, next) => {
  console.error("에러 발생:", err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "서버 내부 오류가 발생했습니다."
  });
});
```

---

### 8-1. 에러 처리 미들웨어의 특징

에러 처리 미들웨어는 매개변수가 4개이다.

```js
(err, req, res, next)
```

각 매개변수 의미:

```txt
err
- 이전 미들웨어, 라우터, controller, service에서 전달된 에러 객체

req
- 클라이언트 요청 객체

res
- 클라이언트 응답 객체

next
- 다음 미들웨어로 넘기는 함수
```

---
### 8-2. 주요 코드 설명

```js
console.error("에러 발생:", err.stack);
```
-> 터미널에 에러 메시지, 에러 발생 위치, 호출 흐름을 출력한다.

```js
res.status(err.status || 500)
```
-> `err.status`가 있으면 해당 상태 코드로 응답하고, 없으면 기본값으로 `500`을 사용한다.

```js
.json({
  success: false,
  message: err.message || "서버 내부 오류가 발생했습니다."
});
```
-> 클라이언트에게 JSON 형태로 에러 응답을 보낸다.

---

### 8-3. 에러 처리 흐름

```txt
service에서 에러 발생
↓
controller의 catch에서 next(err) 실행
↓
app.js의 전역 에러 처리 미들웨어로 이동
↓
에러 내용을 JSON 응답으로 클라이언트에게 전달
```

---

## 9. HTTP 상태 코드
서버가 클라이언트 요청에 대해 어떤 결과를 반환했는지 알려주는 코드

```txt
1xx
- 정보 응답

2xx
- 성공 응답

3xx
- 리다이렉션, 다른 주소로 이동 필요

4xx
- 클라이언트 오류

5xx
- 서버 오류
```

자주 사용하는 상태 코드:

```txt
200 OK
- 요청 성공

201 Created
- 생성 성공

400 Bad Request
- 잘못된 요청

401 Unauthorized
- 인증 필요 또는 인증 실패

403 Forbidden
- 권한 없음

404 Not Found
- 요청한 자원 없음

409 Conflict
- 중복 데이터 등 충돌 발생

500 Internal Server Error
- 서버 내부 오류
```

---

## 10. app.js 요청 흐름 요약
```txt
1. 클라이언트 요청
   ↓
2. app.js 전역 미들웨어 실행
   - cors
   - express.json
   - express.urlencoded
   - express.static
   ↓
3. 요청 URL에 맞는 라우터로 이동
   ↓
4. controller 실행
   ↓
5. service 실행
   ↓
6. DB 처리
   ↓
7. service 결과 반환
   ↓
8. controller가 응답 생성
   ↓
9. 클라이언트에게 JSON 응답
```

# 서버 요청 흐름
클라이언트 요청 
↓
app: (필요한 프레임워크 설정/요청 URL을 각각의 routes로 연결)
↓
routes: (각 요청에 대한 URL 연결) 
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
클라이언트 응답 데이터를 받아 화면에 표시


# HTTP Method
# 1.get요청(요청 URL에 데이터를 붙여서 전송)
Header:
GET/user?id=test&pw=1234

Body:
내용이 거의 없다

# 1-1. GET방식 로직 (params: URL 통해서 특정 데이터 하나만 가져오기)
프론트 요청: GET /user/1  
라우터: router.get("/user/:id", usercontroller.getuser) = (URL, 실행할 함수)
백엔드: const id =req.params.id

# 1-2. GET방식 로직 (query: URL 통해서 조건으로 여러 데이터 가져오기)
프론트 요청: GET/user?name=정현우&age=26
라우터: router.get("/user/:id", usercontroller.getuser) = (URL, 실행할 함수)
백엔드: const name =req.query.name, const age = req.query.age


# 2.post요청(HTTP body에 데이터를 담아서 전송)
Header:
POST/user

Body:
{id: "test", pw:1234}

# 2-1. POST 방식 로직
프론트 요청: POST/user (JSON 형태로 데이터 보냄)
라우터: router.post("/user/:id", usercontroller.getuser) = (URL, 실행할 함수)
백엔드: const name =req.body.name, const age = req.body.age

# 3. GitHub 순서
git add . 
git commit -m "커밋메세지" 
git push origin JHWbranch

git checkout main 
git pull origin main

git checkout JHWbranch 
git merge main

[1] conflict 안남 
git push origin JHWbranch

[2] conflict 남
conflict 해결
git add .
git commit -m "커밋메세지"
git push origin JHWbranch
github 사이트가서 compare & pull request 버튼 클릭

-------------------------------------------------------------------------
[app.js]
(서버설정 -> 미들웨어 설정, 라우터 연결, CORS설정, 에러 처리 미들웨어 등록)
# 1. npm(Node Package Manager)
Node.js에서 필요한 외부 패키지, 라이브러리, 프레임워크를 설치하고 관리해주는 도구

# 2. Express 프레임워크란?
Node.js를 사용해서 서버의 Routes,middleware, req/res 처리구조를 쉽게 만들게 해주는 틀을 제공하는 웹 프레임워크

# 3. URL
Protocal(scheme): http://, https://
Host: 사이트 도메인 (www.localhost) 
Port: 포트번호 (:3000)
Path: 사이트 내부경로 (/user)
QueryString: 요청의 key와 value값 (?name=정현우&age=26)
Fragment: 해시 태그

# 4. cors(Cross-Origin Resoures Sharing : 교차 출처 자원 공유 방식) 
# 4. SOP(Same-Origin Policy :동일 출처 정책)
4-1. SOP정책: 출처가 다르면 브라우저가 기본적으로 요청/응답 접근을 제한하는
보안 정책
[frontend 주소: http://localhost:5173]
[backend 주소: http://localhost:4000]
-> 서로 다른 주소라고 판단된다 (포트번호가 달라서)

4-2. 동일 출처 기준: Origin [Protocal + Host + Port]

4-3. cors정책: 다른 출처의 요청을 허용하기 위한 서버 응답 규칙
브라우저는 SOP 때문에 다른 출처 요청을 기본적으로 제한하지만, 서버가 CORS 허용 헤더를 보내면 브라우저가 요청을 허용한다

4-4. req/res 순서
1. front가 back api로 요청을 보냄 
2. 브라우저가 front 요청 헤더에 origin 붙여서 back으로 보냄 
(Origin: http://localhost:5173back) 
3. back 코드에 [app.use(cors())]가 존재 -> Access-Control-Allow-Origin: http://localhost:5173
(모든 Origin 허용: back이 특정 front 주소만 허용하도록 제한 하지 않고 CORS 기준으로 어떤 Origin에서 온 요청이든 허용한다)

4-5. 최종 정리 문장
프론트엔드는 http://localhost:5173에서 실행되고, 백엔드는 http://localhost:4000에서 실행된다. 두 주소는 포트 번호가 다르기 때문에 브라우저의 SOP 기준에서는 서로 다른 Origin으로 판단된다. 브라우저는 API 요청을 보낼 때 Origin 헤더에 프론트엔드 주소를 담아 백엔드에 전달한다. 백엔드에서는 app.use(cors({ origin: "http://localhost:5173" }))를 적용했기 때문에 Access-Control-Allow-Origin: http://localhost:5173 응답 헤더가 반환된다. 즉, 모든 Origin을 허용하는 것이 아니라 지정한 프론트 주소의 요청만 허용한다.

# 5. app 
# (서버 설정 저장, 미들웨어 등록, 라우터 연결, req/res 처리 관리하는 express 객체를 담는 변수)
app.use(미들웨어): 모든 req/res가 순서대로 미들웨어를 거치면서 처리된다
app.use('/경로',라우터): 특정 경로로 들어온 요청을 해당 라우터로 연결

# 6. 에러처리 미들웨어 (전역으로 에러를 처리하는 방식)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500)
});

err: 이전 미들웨어에서 발생한 에러를 전달받는 객체
req/res: 요청과 응답 관리 객체
next: 다음 미들웨어를 실행하는 함수
err.stack: 터미널에서 에러 메시지 + 에러 발생 위치 + 호출 흐름 
err.messsage: 에러 메세지만 출력
res.status(상태코드).json(응답메시지): 클라이언트 보내는 HTTP 응답 객체
err.status: 해당하는 HTTP 상태 코드로 응답하고 err.status가 없으면 500 서버 오류로 응답한다

# 7. HTTP 상태코드
1xx: 정보 응답
2xx: 성공 응답
3xx: 다른 주소로 이동 필요
4xx: 클라이언트 오류
5xx: 서버 오류 (어떤 상태 코드로 응답해야 할지 지정되지 않은 서버 내부 오류를 처리하기 위한 기본 값)
--------------------------------------------------------------------------------------

[Routes]
컴퓨터 네트워크와 네트워크 연결 및 기능별 경로 설정 역할
-------------------------------------------------------------------------------------

[controller]
req받기, 필요한 값 꺼내기, service 호출, res보내기, 에러 next(err)로 넘기기
# 1. callback -> async/await로 바꾼 이유

# 2. async/await
async: 어떤 함수가 비동기 작업을 다룰 수 있는 함수 표시 (항상 Promise 반환 => Promise {<Pending>} 이런 형태로 반환)
await: 비동기로 처리되는 부분 앞에 await 붙이기 (해당 작업이 끝날 때까지 기다린 후 결과 받음)

# 3. Promise 상태 3가지 
pending: 아직 작업 중
fulfilled: 작업 성공
rejected: 작업 실패
---------------------------------------------------------------------------------------

[service]
실제 비즈니스 로직 처리, DB 조회/저장, 비밀번호 암호화 비교, JWT 토큰 생성,회원가입 로직 처리, 로그인 로직 처리
# 1. cookie vs session vs tokens vs JWT (서버에게 우리가 누군지 알려주는 )
# 위와 같은 인증방식을 사용하는 이유
-> HTTP 특징
   1. 상태를 유지하지 않는 stateless 프로토콜 (각각의 요천이 서로 독립적이여서 이전 요청과 아무런 관련이 없다)
   2. 비연결성 (클라이언트가 서버에 요청을 하고나서 그에 걸맞는 응답을 보낸 후 서버와 클라이언트의 연결을 끊는 방식)
   즉, 서버에게 클라이언트가 누구인지를 기억하기 위해서 인증(Authentication)을 하기 위해

# 1-1. cookie (인증 정보를 담아 전달하는 수단)
- key-value 형식
- 이름,값,만료일,경로 정보롤 구성
- 클라이언트 브라우저에 설치되는 작은 기록 정보 파일을 말함

[실행흐름] 
1. 서버는 응답 헤더의 `Set-Cookie`를 통해 브라우저에 쿠키 저장을 요청한다.
2. 브라우저는 저장된 쿠키를 이후 요청 헤더의 `Cookie`에 자동으로 담아 서버에 보낸다.
3. 서버는 쿠키를 통해 사용자 식별이나 로그인 상태를 확인할 수 있다.

[단점]
요청 시 쿠키의 값을 그대로 보내기 때문에 보안에 취약

# 1-2. session (서버에 저장된 로그인 상태)
- key-value 형식
- 민감한 정보를 브라우저가 아닌 서버 측에 저장하고 관리
- 서버가 session Id를 쿠키(Set-Cookie)에 담아 보냄

[실행흐름]
1. 클라이언트가 서버에게 로그인 요청을 보냄
2. 서버가 로그인 정보를 확인하고 서버 메모리나 DB에 session id를 기준으로 사용자 정보를 저장함
3. 서버가 응답 헤더의 Set-Cookie에 session id를 담아 브라우저에게 보냄
4. 브라우저는 session id 쿠키를 저장함
5. 이후 브라우저가 서버에게 요청을 보내면 브라우저가 요청 헤더의 Cookie에 session id를 자동으로 담아 보냄
6. 서버는 Cookie에 있는 session id와 서버 메모리/DB에 저장된 session id를 비교하거나 조회해서 인증을 수행함

[단점]
서버에서 세션 저장소를 사용하르모 요청이 많아지면 서버 과부화 (DB에 session id를 조회하는 과정에서 많은 오버헤드 발생)

# 1-3. tokens
방법 1. 응답 body에 token을 담아 보냄 
방법 2. 쿠키(Set-Cookie)에 token을 담아 보냄

[실행흐름]
1. 사용자가 로그인 요청
2. 서버가 아이디/비밀번호 확인
3. 맞으면 서버가 토큰 발급
4. 클라이언트가 토큰 저장
5. 이후 API 요청마다 토큰을 같이 보냄
6. 서버는 토큰을 검증해서 사용자 확인


# 1-4. JWT (로그인 시 사용자의 인증 정보를 JSON형태로 암호화하여 클라이언트에게 발급하는 인증 토큰)
1. Header: 토큰의 타입과 사용된 서명 암호화 알고리즘
2. payload: 토큰 안에 담을 사용자 정보
3. Signature: 서버의 비밀키로 만든 서명

4. jwt.sign()
= JWT 토큰 생성 함수


# 2. MYSQL conn.query() 반환구조 ->  `mysql2`에서 `conn.query()`는 배열 형태로 결과를 반환.
conn.query
= SQL 실행 함수

await conn.query(...)
= SQL 실행 결과

const [rows] = await conn.query(...)
= 실행 결과 중 첫 번째 값 rows만 꺼내 저장

## 매개변수
sql
- 실행할 SQL문

values
- SQL문 안의 ? 자리에 순서대로 들어갈 값 배열

## 반환값
rows
- DB 실행 결과
- SQL문 종류에 따라 형태가 달라짐

fields
- 컬럼 정보, 부가 정보
- 보통 자주 사용하지 않음

## SQL문 종류에 따른 rows 형태

### SELECT
`SELECT`: 배열 반환 []

주요 속성:
rows.length       // 조회된 행 개수
rows[0]           // 첫 번째 조회 결과
rows[0].컬럼명   // 첫 번째 결과의 컬럼명의 값

### INSERT
`INSERT`: 추가 실행 결과 객체 반환 {}

주요 속성:
affectedRows
- 추가된 행 개수
- 보통 데이터 1개를 추가하면 1

insertId
- AUTO_INCREMENT로 새로 생성된 PK 값

### UPDATE
`UPDATE`: 수정 실행 결과 객체 반환 {}

주요 속성:
affectedRows
- 수정 대상이 된 행 개수
- 0이면 WHERE 조건에 맞는 데이터가 없음

changedRows
- 실제로 값이 변경된 행 개수
- 기존 값과 같은 값으로 수정하면 0일 수 있음

### DELETE
`DELETE`: 삭제 실행 결과 객체 반환 {}

주요 속성:
affectedRows
- 삭제된 행 개수
- 0이면 삭제할 대상이 없음

## 요약: 반환되는 결과 배열/객체의 속성에 접근해서 필요한 값을 꺼낸다
SELECT
- rows는 배열 []
- rows.length, rows[0], rows[0].컬럼명 사용

INSERT
- rows는 객체 {}
- rows.affectedRows, rows.insertId 사용

UPDATE
- rows는 객체 {}
- rows.affectedRows, rows.changedRows 사용

DELETE
- rows는 객체 {}
- rows.affectedRows 사용


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
3. back 코드에 [app.use(cors())]가 존재 -> Access-Control-Allow-Origin: * 
(모든 Origin 허용: back이 특정 front 주소만 허용하도록 제한 하지 않고 CORS 기준으로 어떤 Origin에서 온 요청이든 허용한다)

4-5. 최종 정리 문장
프론트엔드는 http://localhost:5173에서 실행되고, 백엔드는 http://localhost:4000에서 실행된다. 두 주소는 포트 번호가 다르기 때문에 브라우저의 SOP 기준에서는 서로 다른 Origin으로 판단된다. 브라우저는 API 요청을 보낼 때 Origin 헤더에 프론트엔드 주소를 담아 백엔드에 전달한다. 백엔드에서는 app.use(cors())를 적용했기 때문에 Access-Control-Allow-Origin: * 응답 헤더가 반환된다. 여기서 *는 모든 Origin을 허용한다는 의미이며, 특정 프론트 주소만 허용하도록 제한하지 않고 CORS 기준으로 모든 Origin의 요청을 허용한다는 뜻이다.

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

# 8. 에러처리를 전역으로 했으니 controller에서도 같은 형식으로 바꾸기

[Routes]
컴퓨터 네트워크와 네트워크 연결 및 기능별 경로 설정 역할

[controller]
req받기, 필요한 값 꺼내기, service 호출, res보내기, 에러 next(err)로 넘기기
# 1. callback -> async/await로 바꾼 이유

# 2. async/await
async: 어떤 함수가 비동기 작업을 다룰 수 있는 함수 표시 (항상 Promise 반환)
await: 비동기로 처리되는 부분 앞에 await 붙이기 (해당 작업이 끝날 때까지 기다린 후 결과 받음)


[service]
실제 비즈니스 로직 처리, DB 조회/저장, 비밀번호 암호화 비교, JWT 토큰 생성,회원가입 로직 처리, 로그인 로직 처리
# 1. JWT vs Session vs cookie 차이
# 1-1. Cookie
- key-value 형식
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


# 1. 
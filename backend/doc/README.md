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
클라이언트 응답


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
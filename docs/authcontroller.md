# authController.js 핵심 정리
클라이언트의 요청 -> 필요한 값을 꺼내기 -> service 호출 -> 결과 클라이언트에게 응답

## 1. req에서 필요한 값 꺼내기
controller는 클라이언트가 보낸 요청에서 필요한 값을 꺼낸다.

기본 형태:
```js
const { 필요한값1, 필요한값2 } = req.body;
```

의미:
```txt
req.body
- 클라이언트가 요청 body에 담아 보낸 데이터

필요한값1, 필요한값2
- 요청 처리에 필요한 값
```

로그인한 사용자 정보가 필요한 경우에는 `req.user`를 사용한다.

기본 형태:

```js
const user_idx = req.user?.user_idx;
```

의미:

```txt
req.user
- JWT 인증 미들웨어가 토큰을 검증한 뒤 넣어준 로그인 사용자 정보

req.user?.user_idx
- 로그인한 사용자의 고유 번호
```

---

## 2. 기본 입력값 검증하기

service를 호출하기 전에 필수값이 들어왔는지 확인한다.

기본 형태:

```js
if (!필수값1 || !필수값2) {
  return res.status(400).json({
    success: false,
    message: "필수값을 입력하세요",
  });
}
```

의미:

```txt
필수값이 없으면 service를 호출하지 않고,
400 상태 코드로 클라이언트에게 바로 응답한다.
```

`400 Bad Request`는 클라이언트가 필요한 값을 제대로 보내지 않았을 때 사용한다.

---

## 3. service 호출하기

controller는 실제 로직을 직접 처리하지 않고 service 함수를 호출한다.

기본 형태:

```js
const result = await service.함수명(필요한값1, 필요한값2);
```

의미:

```txt
service.함수명(...)
- 실제 처리를 담당하는 service 함수 호출

await
- service 처리가 끝날 때까지 기다림

result
- service가 반환한 처리 결과
```

controller와 service 역할 구분:

```txt
controller
- 요청값 꺼내기
- 입력값 검증
- service 호출
- 응답 보내기

service
- DB 처리
- 비밀번호 암호화
- 로그인 검증
- JWT 생성
- 실제 비즈니스 로직 처리
```

---

## 4. service 결과를 res로 응답하기

service에서 받은 결과를 클라이언트에게 응답한다.

기본 형태:

```js
return res.status(result.status).json(result);
```

의미:

```txt
result.status
- HTTP 상태 코드

result
- 클라이언트에게 보낼 JSON 응답 데이터
```

즉 controller는 service 결과를 HTTP 응답 형태로 바꿔서 클라이언트에게 보내는 역할을 한다.

---

## 5. 에러가 나면 next(error)로 전역 에러 처리에 넘기기

controller에서 처리 중 에러가 발생하면 `catch`에서 에러를 잡는다.

기본 형태:

```js
try {
  const result = await service.함수명(필요한값);
  return res.status(result.status).json(result);
} catch (err) {
  const error = new Error("처리 실패");
  error.status = 500;
  return next(error);
}
```

의미:

```txt
try
- 정상 처리 코드 실행

catch
- try 안에서 에러가 발생하면 실행

new Error("처리 실패")
- 에러 객체 생성

error.status = 500
- 서버 에러 상태 코드 설정

next(error)
- app.js의 전역 에러 처리 미들웨어로 에러 전달
```

전역 에러 처리 흐름:

```txt
service에서 에러 발생
↓
controller의 catch(err)에서 에러 받음
↓
next(error) 실행
↓
app.js의 전역 에러 처리 미들웨어로 이동
↓
클라이언트에게 에러 응답 전송
```

---

## 핵심 한 문장

controller는 클라이언트 요청에서 필요한 값을 꺼내 service에 넘기고, service 결과를 클라이언트에게 응답하는 역할을 한다.
````
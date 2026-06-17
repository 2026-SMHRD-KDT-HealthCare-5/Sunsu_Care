
// DB 연결 객체 호출
const conn = require("../db/index");

// 비밀번호 암호화 라이브러리
const bcrypt = require("bcrypt");

// JWT 토큰 라이브러리
const jwt = require("jsonwebtoken");

// 해시 처리 단계 지정 (고정된 형태를 다른 값으로 변환하는 과정)
const SALT_ROUNDS = 10;


// 1. 회원가입 처리 함수
// async: 함수 내부에서 await를 사용할 수 있게 해주는 키워드
const signup = async (email, password, nickname) => {
  try {
    console.log("현재 수정한 authService.js signup 실행됨");

    // 1-1. 비밀번호 암호화
    // password를 bcrypt로 해시처리 후 작업 끝날때까지 await로 기다린 후 완성된 hash password를 변수에 저장
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // 1-2. SQL문 작성
    const sql = `
      INSERT INTO tb_user
      (email, password_hash, nickname, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `;

    const [rows] = await conn.query(sql, [
      email,
      hashedPassword,
      nickname,
      "user",
    ]);

    console.log("회원가입 DB 저장 성공", rows);

    return {
      success: true,
      status: 201,
      message: "회원가입 성공",
      user: {
        user_idx: rows.insertId,
        email,
        nickname,
        role: "user",
      },
    };
  } catch (err) {
    console.log("회원가입 처리 에러:", err);

    if (err.code === "ER_DUP_ENTRY") {
      return {
        success: false,
        status: 409,
        message: "이미 사용 중인 이메일입니다.",
      };
    }
    //나를 호출한 곳으로 에러 던짐 (controller가 받음)
    throw err;
  }
};

// 2. 로그인 처리 함수
// async: 함수 내부에서 await를 사용할 수 있게 해주는 키워드
const login = async (email, password) => {
  try {
    // SQL문 작성
    const sql = `
      SELECT 
        user_idx,
        email,
        password_hash,
        nickname,
        role
      FROM tb_user
      WHERE email = ?
    `;

    // 수정한 이유:
    // db/index.js에서 mysql2/promise 방식으로 DB 연결을 만들었기 때문에
    // conn.query(sql, 값, callback) 방식이 아니라 await conn.query(sql, 값) 방식으로 실행해야 함
    // 기존 callback 방식으로 작성하면 DB 조회 에러가 callback의 err로 들어오지 않고
    // Promise reject로 발생해서 서버가 crash 될 수 있음
    const [rows] = await conn.query(sql, [email]);

    console.log("로그인 DB 조회 성공", rows);

    // 2-2. 이메일에 해당하는 사용자가 없는 경우
    if (rows.length === 0) {
      return {
        success: false,
        message: "이메일 또는 비밀번호가 올바르지 않습니다.",
      };
    }

    const user = rows[0];

    // 2-3. 입력한 비밀번호와 DB의 암호화된 비밀번호 비교
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return {
        success: false,
        message: "이메일 또는 비밀번호가 올바르지 않습니다.",
      };
    }

    // 2-4. JWT 토큰 생성 -> jwt.sign(토큰에 담을 데이터, 비밀키, 옵션)
    // 수정한 이유:
    // 로그인 성공 후 사용자의 인증 상태를 유지하기 위해 JWT 토큰을 생성함
    // 이후 프론트는 이 토큰을 저장하고, 인증이 필요한 API 요청 시 토큰을 함께 보낼 수 있음
    const token = jwt.sign(
      {
        user_idx: user.user_idx,
        email: user.email,
        nickname: user.nickname,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    // 2-5. 로그인 성공 결과를 controller로 전달
    // 추가 수정 이유:
    // callback 방식 대신 async/await 방식으로 controller에서 결과를 받을 수 있도록
    // callback(null, result)가 아니라 result 객체를 return함
    return {
      success: true,
      message: "로그인 성공",
      token,
      user: {
        user_idx: user.user_idx,
        email: user.email,
        nickname: user.nickname,
        role: user.role,
      },
    };
  } catch (err) {
    console.log("로그인 처리 에러:", err);

    // 수정한 이유:
    // DB 조회, 비밀번호 비교, JWT 토큰 생성 중 발생한 예외를
    // controller로 넘겨서 500 서버 에러로 응답하기 위함
    // callback 방식 제거에 따라 에러를 throw해서 controller의 catch에서 처리함
    throw err;
  }
};

// 3. 로그아웃 처리 함수
const logout = async () => {
  try {
    // JWT 방식에서는 서버에서 토큰을 직접 삭제하지 않음
    // 프론트에서 localStorage에 저장된 authToken을 삭제하면 로그아웃 처리
    // callback 방식 대신 async/await 방식으로 controller에서 결과를 받을 수 있도록 result 객체를 return함
    return {
      success: true,
      message: "로그아웃 성공",
    };
  } catch (err) {
    console.log("로그아웃 처리 에러:", err);
    throw err;
  }
};

// 4. 닉네임 변경 처리 함수
const updateNickname = async (user_idx, newNickname) => {
  try {
    if (!newNickname || newNickname.trim().length < 2) {
      return {
        success: false,
        status: 400,
        message: '닉네임은 2자 이상 입력해주세요.',
      };
    }

    const sql = `UPDATE tb_user SET nickname = ?, updated_at = NOW() WHERE user_idx = ? AND deleted_at IS NULL`;
    const [result] = await conn.query(sql, [newNickname.trim(), user_idx]);

    if (result.affectedRows === 0) {
      return {
        success: false,
        status: 404,
        message: '사용자를 찾을 수 없습니다.',
      };
    }

    return {
      success: true,
      status: 200,
      message: '닉네임이 변경되었습니다.',
      nickname: newNickname.trim(),
    };
  } catch (err) {
    console.log('닉네임 변경 에러:', err);
    throw err;
  }
};

// 5. 비밀번호 변경 처리 함수
const updatePassword = async (user_idx, currentPassword, newPassword) => {
  try {
    if (!currentPassword || !newPassword) {
      return { success: false, status: 400, message: '현재 비밀번호와 새 비밀번호를 모두 입력해주세요.' };
    }
    if (newPassword.length < 6) {
      return { success: false, status: 400, message: '새 비밀번호는 6자 이상이어야 합니다.' };
    }

    // 현재 비밀번호 확인
    const [rows] = await conn.query(
      'SELECT password_hash FROM tb_user WHERE user_idx = ? AND deleted_at IS NULL',
      [user_idx]
    );
    if (rows.length === 0) {
      return { success: false, status: 404, message: '사용자를 찾을 수 없습니다.' };
    }

    const isMatch = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!isMatch) {
      return { success: false, status: 401, message: '현재 비밀번호가 일치하지 않습니다.' };
    }

    // 새 비밀번호 해시 후 저장
    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await conn.query(
      'UPDATE tb_user SET password_hash = ?, updated_at = NOW() WHERE user_idx = ?',
      [hashed, user_idx]
    );

    return { success: true, status: 200, message: '비밀번호가 변경되었습니다.' };
  } catch (err) {
    console.log('비밀번호 변경 에러:', err);
    throw err;
  }
};

// 6. 회원 탈퇴 (소프트 삭제 - deleted_at 표시)
const deleteAccount = async (user_idx) => {
  try {
    const sql = `UPDATE tb_user SET deleted_at = NOW(), updated_at = NOW() WHERE user_idx = ? AND deleted_at IS NULL`;
    const [result] = await conn.query(sql, [user_idx]);

    if (result.affectedRows === 0) {
      return { success: false, status: 404, message: '이미 탈퇴된 계정이거나 사용자를 찾을 수 없습니다.' };
    }

    return { success: true, status: 200, message: '회원 탈퇴가 완료되었습니다.' };
  } catch (err) {
    console.log('회원 탈퇴 에러:', err);
    throw err;
  }
};

module.exports = {
  signup,
  login,
  logout,
  updateNickname,
  updatePassword,
  deleteAccount,
};

//jwt.sign(토큰에 담을 데이터, 비밀키, 옵션): 토큰생성
//jwt.verify(): 토큰검증

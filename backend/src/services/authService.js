// 비밀번호 안전하게 저장하기 위한 해시 라이브러리
const bcrypt = require("bcrypt");

// JWT 토큰 라이브러리
const jwt = require("jsonwebtoken");

const authRepository = require("../repositories/authRepository");

// 해시 처리 단계 지정 (고정된 형태를 다른 값으로 변환하는 과정)
const SALT_ROUNDS = 10;

// 1. 회원가입 처리 함수
// controller에서 signup(...)형태로 호출하면서 넘겨준 값을 받음
const signup = async (email, password, nickname) => {
  try {
    // 1-1. 비밀번호 암호화
    // password를 bcrypt로 해시처리 후 작업 끝날때까지 await로 기다린 후 완성된 hash password를 변수에 저장
    // bcrypt.hash(원본 비번, salt_rounds)
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // 1-2. DB 저장은 repository 계층에 위임
    const result = await authRepository.createUser({
      email,
      passwordHash: hashedPassword,
      nickname,
      role: "user",
    });

    console.log("회원가입 성공", result); // INSERT 실행 결과 객체

    // 1-3. controller에게 돌려줄 회원가입 결과
    return {
      success: true,
      status: 201,
      message: "회원가입 성공",
      user: {
        user_idx: result.insertId,
        email,
        nickname,
      },
    };
  } catch (err) {
    // 1-4. try에서 에러발생 처리 부분
    console.log("회원가입 처리 에러:", err);

    // MYSQL 중복 입력 에러
    if (err.code === "ER_DUP_ENTRY") {
      return {
        success: false,
        status: 409,
        message: "이미 사용 중인 이메일입니다.",
      };
    }

    // 나를 호출한 곳으로 에러 던짐 (controller가 받음)
    throw err;
  }
};

// 2. 로그인 처리 함수
const login = async (email, password) => {
  try {
    // 2-1. 이메일 기준 사용자 조회
    const user = await authRepository.findByEmail(email);
    console.log("로그인 조회 결과", user);

    // 2-2. 이메일에 해당하는 사용자가 없는 경우
    if (!user) {
      return {
        success: false,
        message: "이메일 또는 비밀번호가 올바르지 않습니다.",
      };
    }

    // 2-3. 입력한 비밀번호와 DB의 암호화된 비밀번호 비교
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return {
        success: false,
        message: "이메일 또는 비밀번호가 올바르지 않습니다.",
      };
    }

    // 2-4. JWT 토큰 생성 함수
    const token = jwt.sign(
      {
        // 토큰 안에 담을 데이터 (Header)
        user_idx: user.user_idx,
        email: user.email,
        nickname: user.nickname,
        role: user.role,
      },
      process.env.JWT_SECRET, // 서명에 사용할 비밀키
      {
        expiresIn: "1h", // 토큰 만료 시간
      },
    );

    // 2-5. controller에게 돌려줄 로그인 결과
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
        message: "닉네임은 2자 이상 입력해주세요.",
      };
    }

    const result = await authRepository.updateNickname(
      user_idx,
      newNickname.trim(),
    );

    if (result.affectedRows === 0) {
      return {
        success: false,
        status: 404,
        message: "사용자를 찾을 수 없습니다.",
      };
    }

    return {
      success: true,
      status: 200,
      message: "닉네임이 변경되었습니다.",
      nickname: newNickname.trim(),
    };
  } catch (err) {
    console.log("닉네임 변경 에러:", err);
    throw err;
  }
};

// 5. 비밀번호 변경 처리 함수
const updatePassword = async (user_idx, currentPassword, newPassword) => {
  try {
    if (!currentPassword || !newPassword) {
      return {
        success: false,
        status: 400,
        message: "현재 비밀번호와 새 비밀번호를 모두 입력해주세요.",
      };
    }

    if (newPassword.length < 6) {
      return {
        success: false,
        status: 400,
        message: "새 비밀번호는 6자 이상이어야 합니다.",
      };
    }

    // 현재 비밀번호 확인
    const passwordRow = await authRepository.findPasswordHashByUserIdx(user_idx);

    if (!passwordRow) {
      return {
        success: false,
        status: 404,
        message: "사용자를 찾을 수 없습니다.",
      };
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      passwordRow.password_hash,
    );

    if (!isMatch) {
      return {
        success: false,
        status: 401,
        message: "현재 비밀번호가 일치하지 않습니다.",
      };
    }

    // 새 비밀번호 해시 후 저장
    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await authRepository.updatePassword(user_idx, hashed);

    return {
      success: true,
      status: 200,
      message: "비밀번호가 변경되었습니다.",
    };
  } catch (err) {
    console.log("비밀번호 변경 에러:", err);
    throw err;
  }
};

// 6. 회원 탈퇴 (소프트 삭제 - deleted_at 표시)
const deleteAccount = async (user_idx) => {
  try {
    const result = await authRepository.softDeleteByUserIdx(user_idx);

    if (result.affectedRows === 0) {
      return {
        success: false,
        status: 404,
        message: "이미 탈퇴된 계정이거나 사용자를 찾을 수 없습니다.",
      };
    }

    return {
      success: true,
      status: 200,
      message: "회원 탈퇴가 완료되었습니다.",
    };
  } catch (err) {
    console.log("회원 탈퇴 에러:", err);
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

// jwt.sign(토큰에 담을 데이터, 비밀키, 옵션): 토큰생성
// jwt.verify(): 토큰검증

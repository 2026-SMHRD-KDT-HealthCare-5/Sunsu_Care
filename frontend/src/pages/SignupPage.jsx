// src/pages/SignupPage.jsx
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import { signup } from "../api/authApi";
import {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateNickname,
} from "../utils/validation";
import "./Auth.css";

function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirm: "",
    nickname: "",
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const update = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    const newErrors = {
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      confirm: validatePasswordMatch(form.password, form.confirm),
      nickname: validateNickname(form.nickname),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setSubmitting(true);
    try {
      await signup({
        email: form.email,
        password: form.password,
        nickname: form.nickname,
      });
      setShowSuccess(true);
    } catch (err) {
      console.log("회원가입 요청 에러:", err);
      console.log("서버 응답:", err.response?.data);
      console.log("상태 코드:", err.response?.status);
      setSubmitError("회원가입에 실패했어요. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAfterSuccess = () => {
    setShowSuccess(false);
    navigate(`/login?redirect=${encodeURIComponent(redirect)}`);
  };

  return (
    <div className="page auth">
      <div className="auth__header">
        <h1 className="auth__title">회원가입</h1>
        <p className="auth__subtitle">간단하게 가입하고 시작하세요</p>
      </div>

      <form className="auth__form" onSubmit={handleSubmit}>
        <Input
          label="이메일"
          type="email"
          value={form.email}
          onChange={update("email")}
          placeholder="example@suncare.com"
          error={errors.email}
        />
        <Input
          label="비밀번호"
          type="password"
          value={form.password}
          onChange={update("password")}
          placeholder="6자 이상"
          error={errors.password}
        />
        <Input
          label="비밀번호 확인"
          type="password"
          value={form.confirm}
          onChange={update("confirm")}
          placeholder="비밀번호 재입력"
          error={errors.confirm}
        />
        <Input
          label="닉네임"
          value={form.nickname}
          onChange={update("nickname")}
          placeholder="닉네임을 입력하세요"
          error={errors.nickname}
        />

        {submitError && <p className="auth__error">{submitError}</p>}

        <Button size="lg" type="submit" disabled={submitting}>
          {submitting ? "가입 중..." : "가입하기"}
        </Button>
      </form>

      <p className="auth__link">
        이미 회원이신가요?
        <Link to={`/login?redirect=${encodeURIComponent(redirect)}`}>로그인</Link>
      </p>

      <Modal
        isOpen={showSuccess}
        onClose={handleAfterSuccess}
        title="가입 완료 🎉"
      >
        SunCare에 오신 걸 환영합니다.
        <br />
        로그인 화면으로 이동합니다.
      </Modal>
    </div>
  );
}

export default SignupPage;

import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../auth/AuthContext";

export default function LoginPage() {
  const [sp] = useSearchParams();
  const next = sp.get("next") || "/";
  const nav = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const handleLogin = async () => {
    try {
      await login({ email, name });
      nav(next, { replace: true });
    } catch (e) {
      alert(e.message || "로그인 실패");
    }
  };

  const handleGuest = async () => {
    await login({ email: "guest@example.com", name: "게스트" });
    nav(next, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow">
        <Link to="/" className="block mb-4 text-center">
          <img src="/mainLogo.png" alt="logo" className="h-10 mx-auto" />
        </Link>

        <h2 className="text-xl font-semibold text-center mb-4">로그인</h2>

        <label className="text-sm text-gray-600">이메일</label>
        <input
          className="w-full border rounded-lg p-2 mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />

        <label className="text-sm text-gray-600">닉네임</label>
        <input
          className="w-full border rounded-lg p-2 mb-6"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="홍길동"
        />

        <button
          onClick={handleLogin}
          className="w-full rounded-lg bg-rose-400 hover:bg-rose-500 text-white py-2"
        >
          로그인
        </button>

        <button
          onClick={handleGuest}
          className="w-full rounded-lg border py-2 mt-2"
        >
          게스트로 바로 시작
        </button>

        <p className="text-xs text-gray-500 mt-3 text-center">
          * 데모용 로컬 로그인입니다. (브라우저 localStorage 사용)
        </p>
      </div>
    </div>
  );
}

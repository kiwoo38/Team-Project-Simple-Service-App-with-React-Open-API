// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import TasteLinkPage from "./TasteLinkPage";
import PostCreatePage from "./components1/PostCreatePage";
import { seedPosts } from "./components1/SeedPosts";
import PostDetailPage from "./components1/PostDetailPage";
import PostEditPage from "./components1/PostEditPage";
import MapPage from "./components2/KakaoMap";

import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import LoginPage from "./components2/LoginPage";

// ✅ 앱 처음 켜질 때 한 번만 시드 실행 (원하면 주석처리 가능)
seedPosts();

console.log("ENV KEY =", process.env.REACT_APP_KAKAO_APPKEY);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 로그인 페이지만 공개 */}
          <Route path="/login" element={<LoginPage />} />

          {/* 📖 열람은 공개 */}
          <Route path="/" element={<TasteLinkPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/post/:id" element={<PostDetailPage />} />

          {/* ✍️ 행동(작성/수정)만 보호 */}
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <PostCreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/post/:id/edit"
            element={
              <ProtectedRoute>
                <PostEditPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

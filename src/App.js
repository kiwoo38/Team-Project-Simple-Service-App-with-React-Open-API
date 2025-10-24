import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TasteLinkPage from "./TasteLinkPage";
import PostCreatePage from "./components1/PostCreatePage";
import { seedPosts } from "./components1/SeedPosts";
import PostDetailPage from "./components1/PostDetailPage";
import PostEditPage from "./components1/PostEditPage";
import MapPage from "./components2/KakaoMap";




// ✅ 앱 처음 켜질 때 한 번만 시드 실행 (원하면 주석처리 가능)
seedPosts();

console.log("ENV KEY =", process.env.REACT_APP_KAKAO_APPKEY);

function App() {
  return (
    <Router>
      <Routes>
        {/* 메인 페이지 */}
        <Route path="/" element={<TasteLinkPage />} />

        {/* 모집글 등록 페이지 */}
        <Route path="/create" element={<PostCreatePage />} />
        <Route path="/post/:id" element={<PostDetailPage />} />
        <Route path="/post/:id/edit" element={<PostEditPage />} /> 
        <Route path="/map" element={<MapPage />} />
      </Routes>
    </Router>
  );
}

export default App;

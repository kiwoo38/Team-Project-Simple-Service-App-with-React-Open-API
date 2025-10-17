import { Routes, Route } from "react-router-dom";
import TasteLinkPage from "./TasteLinkPage";
import PlaceFinderPage from "./pages/PlaceFinderPage"; // 새로 만들 파일

export default function App() {
  return (
    <Routes>
      {/* 메인 페이지 */}
      <Route path="/" element={<TasteLinkPage />} />

      {/* 지도/검색 페이지 */}
      <Route path="/places" element={<PlaceFinderPage />} />
    </Routes>
  );
}

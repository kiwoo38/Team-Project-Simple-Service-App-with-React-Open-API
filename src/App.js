import React from 'react';
import TasteLinkPage from './TasteLinkPage'; // ⚠️ 여기 슬래시는 앞에 점 꼭 붙이기! (‘./’)
console.log("ENV KEY =", process.env.REACT_APP_KAKAO_APPKEY);

function App() {
  return (
    <div>
      <TasteLinkPage />
    </div>
  );
}

export default App;

import { useEffect, useState } from "react";

export default function useKakaoLoader() {
  const [ready, setReady] = useState(false);
  const appKey = process.env.REACT_APP_KAKAO_APPKEY;

  useEffect(() => {
    if (!appKey) {
      console.error("[Kakao] 앱키 없음 (.env의 REACT_APP_KAKAO_APPKEY 확인)");
      return;
    }

    if (window.kakao?.maps) { setReady(true); return; }

    const exist = document.getElementById("kakao-sdk");
    if (exist) {
      exist.onload = () => window.kakao?.maps?.load?.(() => setReady(true));
      return;
    }

    const s = document.createElement("script");
    s.id = "kakao-sdk";
    s.async = true;
    s.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services,clusterer`;
    s.onload = () => {
      if (window.kakao?.maps) {
        window.kakao.maps.load(() => setReady(true));
      } else {
        console.error("[Kakao] onload 되었지만 kakao.maps 없음");
      }
    };
    s.onerror = (e) => console.error("[Kakao] SDK 스크립트 로드 실패", e);
    document.head.appendChild(s);
  }, [appKey]);

  return ready;
}

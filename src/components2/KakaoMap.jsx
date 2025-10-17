import { useEffect, useRef } from "react";

export default function KakaoMap({ center, places }) {
  const mapRef = useRef(null);
  const mapObjRef = useRef(null);
  const markersRef = useRef([]);

  // 지도 생성/센터 이동
  useEffect(() => {
    if (!window.kakao?.maps) return;
    const { maps } = window.kakao;
    if (!mapObjRef.current) {
      mapObjRef.current = new maps.Map(mapRef.current, {
        center: new maps.LatLng(center.lat, center.lng),
        level: 5,
      });
    } else {
      mapObjRef.current.setCenter(new maps.LatLng(center.lat, center.lng));
    }
  }, [center]);

  // 검색 결과 → 마커/바운즈
  useEffect(() => {
    const { maps } = window.kakao || {};
    if (!maps || !mapObjRef.current) return;

    // 이전 마커 제거
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    if (!places?.length) return;

    const bounds = new maps.LatLngBounds();
    places.forEach(p => {
      const pos = new maps.LatLng(p.y, p.x); // Kakao: y=lat, x=lng
      const marker = new maps.Marker({ position: pos });
      marker.setMap(mapObjRef.current);
      markersRef.current.push(marker);
      bounds.extend(pos);

      const iw = new maps.InfoWindow({
        content: `<div style="padding:8px 10px;">${p.place_name}<br/><small>${p.road_address_name || p.address_name}</small></div>`,
      });
      maps.event.addListener(marker, "click", () => iw.open(mapObjRef.current, marker));
    });

    mapObjRef.current.setBounds(bounds);
  }, [places]);

  return <div ref={mapRef} className="w-full h-[360px] rounded-xl border" />;
}

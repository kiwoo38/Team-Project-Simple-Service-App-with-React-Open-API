import { useEffect, useRef } from "react";

/**
 * props:
 * - center: {lat, lng}
 * - places: kakao places 결과 배열
 * - selectedId: 선택된 place_id (선택)
 * - onMarkerClick: (place) => void (선택)
 */
export default function KakaoMap({ center, places = [], selectedId, onMarkerClick }) {
  const mapRef = useRef(null);
  const mapObjRef = useRef(null);

  // 마커/오버레이/리스너 관리
  const markersRef = useRef([]);   // { id, marker, place, clickHandler }
  const overlaysRef = useRef([]);  // kakao.maps.CustomOverlay[]

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

  // 마커/오버레이 렌더링 + 이벤트 바인딩
  useEffect(() => {
    const { maps } = window.kakao || {};
    if (!maps || !mapObjRef.current) return;

    // 1) 이전 마커, 오버레이, 리스너 정리
    markersRef.current.forEach(({ marker, clickHandler }) => {
      try {
        if (clickHandler) maps.event.removeListener(marker, "click", clickHandler);
      } catch (_) {}
      marker.setMap(null);
    });
    markersRef.current = [];

    overlaysRef.current.forEach((o) => {
      try { o.setMap(null); } catch (_) {}
    });
    overlaysRef.current = [];

    if (!places.length) return;

    // 2) 새 마커/오버레이 생성
    const bounds = new maps.LatLngBounds();

    places.forEach((p, idx) => {
      const pos = new maps.LatLng(p.y, p.x);

      const marker = new maps.Marker({
        position: pos,
        zIndex: p.id === selectedId ? 999 : 1,
      });
      marker.setMap(mapObjRef.current);

      // 간단한 넘버 오버레이
      const label = new maps.CustomOverlay({
        position: pos,
        yAnchor: 1.7,
        zIndex: p.id === selectedId ? 1000 : 2,
        content: `<div style="background:#111;color:#fff;padding:2px 6px;border-radius:9999px;font-size:11px">${idx + 1}</div>`,
      });
      label.setMap(mapObjRef.current);

      // 클릭 이벤트 (핸들러 보관 → cleanup 시 removeListener)
      const clickHandler = () => {
        if (onMarkerClick) onMarkerClick(p);
      };
      maps.event.addListener(marker, "click", clickHandler);

      markersRef.current.push({ id: p.id, marker, place: p, clickHandler });
      overlaysRef.current.push(label);
      bounds.extend(pos);

      // 선택된 ID면 살짝 센터링
      if (p.id === selectedId) {
        setTimeout(() => mapObjRef.current?.panTo(pos), 50);
      }
    });

    // 3) 지도 영역 맞추기
    mapObjRef.current.setBounds(bounds);

    // 4) 이 이펙트가 재실행될 때마다 위에서 모두 정리함
  }, [places, selectedId, onMarkerClick]);

  return (
    <div ref={mapRef} className="w-full h-[420px] rounded-xl" />
  );
}

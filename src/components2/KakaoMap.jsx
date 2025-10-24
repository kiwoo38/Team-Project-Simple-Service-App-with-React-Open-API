import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import useKakaoLoader from "../hooks/useKakaoLoader";

export default function MapPage() {
  const navigate = useNavigate();
  const ready = useKakaoLoader(process.env.REACT_APP_KAKAO_APPKEY);
  const mapEl = useRef(null);
  const [map, setMap] = useState(null);
  const [info, setInfo] = useState(null); // ✅ 인포윈도우 재사용
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [current, setCurrent] = useState(null); // ✅ 선택된 장소(상세 패널용)

  // 지도 초기화
  useEffect(() => {
    if (!ready || !mapEl.current || map) return;
    const { kakao } = window;
    const center = new kakao.maps.LatLng(37.5665, 126.9780); // 서울 시청
    const m = new kakao.maps.Map(mapEl.current, { center, level: 4 });
    setMap(m);
    setInfo(new kakao.maps.InfoWindow({ zIndex: 2 }));
  }, [ready, map]);

  // 키워드 검색
  const search = () => {
    if (!map || !keyword.trim()) return;
    const { kakao } = window;
    const ps = new kakao.maps.services.Places();

    ps.keywordSearch(keyword.trim(), (data, status) => {
      if (status !== kakao.maps.services.Status.OK) {
        setResults([]);
        map.__markers?.forEach((mk) => mk.setMap(null));
        map.__markers = [];
        info?.close();
        setCurrent(null);
        return;
      }

      // 기존 마커 제거
      map.__markers?.forEach((mk) => mk.setMap(null));
      const markers = [];
      const bounds = new kakao.maps.LatLngBounds();

      data.forEach((p) => {
        const pos = new kakao.maps.LatLng(p.y, p.x);
        bounds.extend(pos);

        const mk = new kakao.maps.Marker({ position: pos, map });

        // ✅ 마커 클릭 → 인포윈도우 + 상세 패널 열기
        kakao.maps.event.addListener(mk, "click", () => {
          openPlace(p, mk);
        });

        markers.push(mk);
      });

      map.__markers = markers;
      map.setBounds(bounds);
      setResults(data);
      setCurrent(null); // 새 검색 시 상세 패널 초기화
      info?.close();
    });
  };

  // 공통: 리스트/마커 클릭 시 호출
  const openPlace = (p, markerLike) => {
    if (!map) return;
    const { kakao } = window;

    // 지도 이동
    const pos = new kakao.maps.LatLng(p.y, p.x);
    map.panTo(pos);

    // 마커 핸들: 리스트 클릭이면 좌표로 마커를 찾아 붙임
    let mk = markerLike;
    if (!mk) {
      mk = (map.__markers || []).find(
        (m) =>
          Math.abs(m.getPosition().getLat() - p.y) < 1e-6 &&
          Math.abs(m.getPosition().getLng() - p.x) < 1e-6
      );
    }

    // 인포윈도우 표시 (가게명/주소 + 모집글 작성 버튼)
    if (info && mk) {
      const placeName = (p.place_name || "이름없음").replace(/"/g, "&quot;");
      const addr = (p.road_address_name || p.address_name || "").replace(/"/g, "&quot;");
      const q = new URLSearchParams({
        name: placeName,
        addr,
        lat: String(p.y),
        lng: String(p.x),
      }).toString();
      const content = `
        <div style="padding:8px 10px; max-width:240px;">
          <div style="font-weight:700; margin-bottom:4px;">${placeName}</div>
          <div style="font-size:12px; color:#666; margin-bottom:8px;">${addr}</div>
          <button id="go-create"
            style="display:inline-block; padding:6px 10px; border-radius:6px; background:#111; color:#fff; border:none; cursor:pointer;">
            이 장소로 모집글 작성
          </button>
        </div>`;
      info.setContent(content);
      info.open(map, mk);

      // ✅ 버튼 클릭 시 React Router로 이동
      setTimeout(() => {
        const btn = document.getElementById("go-create");
        if (btn) {
          btn.onclick = (e) => {
            e.preventDefault();
            navigate(`/create?${q}`);
          };
        }
      }, 0);
    }

    // ✅ 하단 상세 패널에 뿌릴 현재 선택 장소 저장
    setCurrent(p);
  };

  // 리스트에서 클릭
  const focus = (p) => openPlace(p, null);

  return (
    <div
      style={{
        height: "100vh",
        display: "grid",
        gridTemplateRows: "auto auto 1fr auto auto", // 헤더, 검색바, 지도, 결과, 상세
      }}
    >
      {/* ✅ 공통 홈바 */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/mainLogo.png"
              alt="Taste Link 로고"
              className="w-auto h-10 object-contain"
            />
            <span className="text-2xl sm:text-3xl font-semibold group-hover:text-rose-400 transition-colors">
              Taste Link <span className="text-gray-500">“취향을 잇다”</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/")}
              className="text-sm px-3 py-1 border rounded-full hover:bg-gray-100 transition"
            >
              모집글 목록
            </button>
            <Link
              to="/map"
              className="text-sm px-3 py-1 border rounded-full hover:bg-gray-100 transition"
            >
              지도 보기
            </Link>
            <button
              onClick={() => navigate("/create")}
              className="text-sm px-3 py-1 border rounded-full bg-rose-300 hover:bg-rose-400 text-white transition"
            >
              모집글 등록
            </button>
            <button className="ml-2 rounded-full border p-2">
              <User className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* 🔎 상단 검색바 */}
      <div style={{ padding: 12, display: "flex", gap: 8, borderBottom: "1px solid #eee" }}>
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="장소/음식 키워드 검색"
          style={{
            flex: 1,
            padding: "10px 12px",
            border: "1px solid #ddd",
            borderRadius: 8,
          }}
          onKeyDown={(e) => e.key === "Enter" && search()}
        />
        <button
          onClick={search}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            background: "black",
            color: "#fff",
          }}
        >
          검색
        </button>
      </div>

      {/* 🗺️ 지도 */}
      <div ref={mapEl} style={{ width: "100%", height: "100%" }} />

      {/* 📜 검색 결과 리스트 */}
      <div style={{ maxHeight: 200, overflow: "auto", borderTop: "1px solid #eee" }}>
        {results.length === 0 && (
          <div style={{ padding: 10, color: "#777" }}>
            검색 결과가 여기에 표시됩니다.
          </div>
        )}
        {results.map((p) => (
          <div
            key={p.id}
            onClick={() => focus(p)}
            style={{
              padding: 10,
              borderBottom: "1px solid #f5f5f5",
              cursor: "pointer",
            }}
          >
            <div style={{ fontWeight: 600 }}>{p.place_name}</div>
            <div style={{ fontSize: 12, color: "#666" }}>
              {p.road_address_name || p.address_name}
            </div>
            <div style={{ fontSize: 12, color: "#888" }}>{p.category_name}</div>
          </div>
        ))}
      </div>

      {/* ✅ 하단 상세 패널 (선택 시 표시) */}
      {current && (
        <div
          style={{
            borderTop: "1px solid #eee",
            padding: 12,
            background: "#fff",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ minWidth: 240 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>
                {current.place_name}
              </div>
              <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                {current.road_address_name || current.address_name}
              </div>
              {current.phone && (
                <div style={{ fontSize: 12, color: "#444", marginTop: 6 }}>
                  전화:{" "}
                  <a
                    href={`tel:${current.phone}`}
                    style={{ textDecoration: "underline" }}
                  >
                    {current.phone}
                  </a>
                </div>
              )}
              {current.category_name && (
                <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
                  {current.category_name}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {/* 카카오 장소 페이지로 이동 */}
              {current.place_url && (
                <a
                  href={current.place_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                  }}
                >
                  카카오 상세보기
                </a>
              )}

              {/* 글 작성으로 바로 연결 (쿼리스트링 전달) */}
              <button
                onClick={() => {
                  const qs = new URLSearchParams({
                    name: current.place_name || "",
                    addr:
                      current.road_address_name ||
                      current.address_name ||
                      "",
                    lat: String(current.y || ""),
                    lng: String(current.x || ""),
                  }).toString();
                  navigate(`/create?${qs}`);
                }}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: "#111",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                이 장소로 모집글 작성
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

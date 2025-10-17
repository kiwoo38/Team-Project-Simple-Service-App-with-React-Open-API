import { Search, MapPin } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import useKakaoLoader from "../hooks/useKakaoLoader";
import KakaoMap from "../components2/KakaoMap"; // 경로 주의

export default function PlaceFinderPage() {
  const appKey = process.env.REACT_APP_KAKAO_APPKEY;
  const kakaoReady = useKakaoLoader(appKey);

  const [keyword, setKeyword] = useState("");
  const [center, setCenter] = useState({ lat: 37.5665, lng: 126.9780 });
  const [results, setResults] = useState([]);
  const [radius, setRadius] = useState(3000);
  const [nationwide, setNationwide] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Geocoder 준비
  const geocoderRef = useRef(null);
  useEffect(() => {
    if (kakaoReady && window.kakao?.maps?.services && !geocoderRef.current) {
      geocoderRef.current = new window.kakao.maps.services.Geocoder();
    }
  }, [kakaoReady]);

  // 현위치
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setCenter({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {}
    );
  }, []);

  // 검색
  const onSearch = useCallback((e) => {
    e?.preventDefault?.();
    if (!kakaoReady || !window.kakao?.maps?.services) return;

    const { kakao } = window;
    const ps = new kakao.maps.services.Places();
    const q = (keyword || "맛집").trim();

    const opts = nationwide
      ? {}
      : { location: new kakao.maps.LatLng(center.lat, center.lng), radius };

    ps.keywordSearch(
      q,
      (data, status) => {
        if (status === kakao.maps.services.Status.OK) {
          setResults(data);
          setSelectedId(data[0]?.id ?? null);
        } else {
          setResults([]);
          setSelectedId(null);
        }
      },
      opts
    );
  }, [kakaoReady, keyword, nationwide, center, radius]);

  // 지역 이동 (지오코딩)
  const [where, setWhere] = useState("");
  const moveToWhere = useCallback(() => {
    if (!geocoderRef.current || !where.trim()) return;
    geocoderRef.current.addressSearch(where.trim(), (res, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const { x, y } = res[0];
        setCenter({ lat: parseFloat(y), lng: parseFloat(x) });
        onSearch(); // 이동 후 바로 재검색
      } else {
        alert("지역을 찾을 수 없어요. 예) 부산 해운대, 대전 은행동");
      }
    });
  }, [where, onSearch]);

  // 목록 표시용 가공
  const pretty = useMemo(() => results.map((r, i) => ({
    id: r.id,
    idx: i + 1,
    name: r.place_name,
    addr: r.road_address_name || r.address_name,
    url: r.place_url,
    phone: r.phone,
    dist: r.distance ? Number(r.distance) : null, // m
    cat: r.category_group_name || r.category_name,
    x: r.x, y: r.y,
  })), [results]);

  // 마커 클릭 콜백: useCallback으로 고정 (자식 useEffect 의존성 안정화)
  const handleMarkerClick = useCallback((p) => {
    setSelectedId(p.id);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Top */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center gap-3">
          <h1 className="text-2xl font-semibold">맛집 찾기</h1>

          {/* 검색 */}
          <form onSubmit={onSearch} className="ml-auto hidden md:flex items-center gap-2 flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full rounded-full border border-gray-300 pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                placeholder="예: 부산 해운대 스시, 대전 고기, 카페"
              />
            </div>
            <button type="submit" className="rounded-full border px-4 py-2 text-sm hover:bg-gray-50">
              검색
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 지도 카드 */}
        <section className="lg:col-span-2">
          <div className="rounded-xl border shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center gap-3">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">지도</span>
              <div className="ml-auto flex items-center gap-2">
                <input
                  value={where}
                  onChange={(e) => setWhere(e.target.value)}
                  placeholder="지역 이동 (예: 부산 해운대)"
                  className="rounded-full border px-3 py-1.5 text-sm"
                />
                <button onClick={moveToWhere} className="rounded-full border px-3 py-1.5 text-sm hover:bg-gray-50">
                  이동
                </button>

                <select
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="rounded-full border px-2 py-1.5 text-sm"
                  title="검색 반경"
                >
                  <option value={1000}>1km</option>
                  <option value={3000}>3km</option>
                  <option value={5000}>5km</option>
                  <option value={10000}>10km</option>
                </select>

                <label className="text-xs flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={nationwide}
                    onChange={(e)=>setNationwide(e.target.checked)}
                  />
                  전국 검색
                </label>
              </div>
            </div>

            <div className="p-3">
              {kakaoReady
                ? (
                  <KakaoMap
                    center={center}
                    places={results}
                    selectedId={selectedId}
                    onMarkerClick={handleMarkerClick}
                  />
                ) : (
                  <div className="h-[420px] grid place-items-center text-sm text-gray-500">
                    지도를 불러오는 중…
                  </div>
                )
              }
            </div>
          </div>
        </section>

        {/* 결과 리스트 카드 */}
        <aside className="lg:col-span-1">
          <div className="rounded-xl border shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <span className="text-sm text-gray-700">검색 결과</span>
              <span className="text-xs text-gray-500">{pretty.length}곳</span>
            </div>

            <ul className="divide-y">
              {pretty.length === 0 && (
                <li className="px-4 py-6 text-sm text-gray-500">
                  검색어를 입력하고 검색을 눌러보세요.
                </li>
              )}
              {pretty.map((p) => (
                <li
                  key={p.id}
                  onMouseEnter={() => setSelectedId(p.id)}
                  onClick={() => window.open(p.url, "_blank")}
                  className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${selectedId === p.id ? "bg-rose-50" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">{p.idx}. {p.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{p.addr}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {p.cat}{p.phone ? ` · ${p.phone}` : ""}
                        {p.dist != null ? ` · ${formatDistance(p.dist)}` : ""}
                      </div>
                    </div>
                    <div className="text-[10px] px-2 py-1 rounded-full bg-orange-100 text-orange-700 font-bold h-fit">OPEN</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function formatDistance(m) {
  if (m >= 1000) return `${(m/1000).toFixed(1)}km`;
  return `${m}m`;
}

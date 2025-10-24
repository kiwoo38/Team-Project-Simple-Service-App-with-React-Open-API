import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import AutoBanner from "./components1/AutoBanner";

const API_URL = "https://68f1a345b36f9750dee9d045.mockapi.io/api/v1/posts";

export default function TasteLinkPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ 로딩 상태 추가
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;
  const navigate = useNavigate();
  const location = useLocation(); // ✅ 현재 경로 감지용
  const { isAuthed, user, logout } = useAuth(); // ✅ 추가: 인증 상태

  // ✅ 데이터 불러오기 (경로가 바뀔 때마다 다시 실행)
  useEffect(() => {
    setLoading(true);
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setPosts(sorted);
        setLoading(false);
      })
      .catch((err) => {
        console.error("데이터 불러오기 실패:", err);
        setLoading(false);
      });
  }, [location.pathname]); // ✅ pathname이 바뀌면 다시 fetch

  // ✅ 페이지 계산
  const indexOfLast = currentPage * postsPerPage;
  const indexOfFirst = indexOfLast - postsPerPage;
  const currentPosts = posts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(posts.length / postsPerPage);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* 상단바 */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/mainLogo.png" alt="Taste Link 로고" className="w-auto h-10 object-contain" />
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

            {/* ✅ 로그인/로그아웃 토글 */}
            {isAuthed ? (
              <div className="flex items-center gap-2 pl-2">
                <span className="inline-flex items-center gap-1 text-sm text-gray-700">
                  <User className="h-4 w-4" />
                  {user?.name || user?.email}
                </span>
                <button
                  onClick={logout}
                  className="text-sm px-3 py-1 border rounded-full hover:bg-gray-100 transition"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="text-sm px-3 py-1 border rounded-full hover:bg-gray-100 transition"
              >
                로그인
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 🔸 메인 중앙 배너 */}
      <AutoBanner />

      {/* 카드 리스트 */}
      <main className="mx-auto max-w-6xl px-4 mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <p className="col-span-full text-center text-gray-500">
            불러오는 중...
          </p>
        ) : currentPosts.length > 0 ? (
          currentPosts.map((p) => (
            <Card
              key={p.id}
              id={p.id}
              title={p.title}
              writer={p.writer}
              members={p.members}
              likes={p.likes}
              img={p.image}
              paymentMethod={p.paymentMethod}
              attendees={p.attendees}                                 // ✅ 추가: 참석 배열
              capacity={p.capacity ?? p.maxMembers ?? p.membersLimit}  // ✅ 추가: 정원 후보 키들
            />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">
            등록된 모집글이 없습니다.
          </p>
        )}
      </main>

      {/* 페이지 버튼 */}
      <div className="flex justify-center items-center gap-2 mt-10 mb-10">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-4 py-2 rounded-full border ${currentPage === i + 1
              ? "bg-rose-400 text-white"
              : "bg-white text-gray-600 hover:bg-gray-100"
              } transition`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

// ✅ 카드 컴포넌트
function Card({
  id,
  title,
  writer,
  members,
  likes,
  img,
  paymentMethod,
  attendees,   // ✅ 추가
  capacity,    // ✅ 추가
}) {
  const navigate = useNavigate();

  // 이미지
  const imageSrc =
    typeof img === "string" && img.startsWith("http")
      ? img
      : "https://picsum.photos/seed/default/600/400";

  // 숫자 파싱 (예: "8명" → 8)
  const parsePositiveInt = (raw) => {
    if (raw === undefined || raw === null) return undefined;
    const digits = String(raw).replace(/[^\d]/g, "");
    if (!digits) return undefined;
    const n = parseInt(digits, 10);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  };

  // 참석 인원 계산 (attendees 우선, 없으면 members를 참석 수로 사용)
  const attArr = Array.isArray(attendees) ? attendees : [];
  const currentAttendeeCount =
    attArr.length > 0 ? attArr.length : Number(members || 0);

  // ⚠️ 정원 추론: capacity 우선, 없으면 members를 정원으로 간주(단, 참석 수보다 크거나 같을 때만)
  let parsedCapacity = parsePositiveInt(capacity);
  if (parsedCapacity == null) {
    const membersAsCap = parsePositiveInt(members);
    if (membersAsCap && membersAsCap >= currentAttendeeCount) {
      parsedCapacity = membersAsCap;
    }
  }

  // 꽉 찼는지
  const isFull = parsedCapacity ? currentAttendeeCount >= parsedCapacity : false;

  return (
    <article
      onClick={() => navigate(`/post/${id}`)}
      className="relative cursor-pointer rounded-xl border overflow-hidden hover:shadow-md transition-shadow bg-white"
    >
      {/* 이미지 */}
      <div className="w-full aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={imageSrc}
          alt={title}
          loading="lazy"
          className="w-full h-auto block object-cover"
          onError={(e) => {
            if (!e.currentTarget.src.includes("default")) {
              e.currentTarget.src = "https://picsum.photos/seed/default/600/400";
            }
          }}
        />
      </div>

      {/* 결제 방식 배지 */}
      {paymentMethod && (
        <div className="p-4 pb-0">
          <div className="inline-block bg-white border px-3 py-1 rounded-full text-[11px] font-semibold text-gray-700 shadow-sm">
            💳 {paymentMethod}
          </div>
        </div>
      )}

      {/* 본문 */}
      <div className="p-4 pt-2">
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">작성자: {writer}</p>

        {/* ✅ 모집 인원 + 참석 인원 함께 표시 */}
        {parsedCapacity ? (
          <p className="text-sm text-gray-700 mt-1">
            📌 모집 인원: <b>{parsedCapacity}명</b> · 👥 참석 인원: <b>{currentAttendeeCount}명</b>
          </p>
        ) : (
          <p className="text-sm text-gray-700 mt-1">
            👥 참석 인원: <b>{currentAttendeeCount}명</b>
          </p>
        )}

        <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
          <span>❤️ {likes}</span>
        </div>
      </div>

      {/* ✅ 정원 꽉 찼을 때 '마감' 뱃지 */}
      {isFull && (
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500 text-white shadow">
            마감
          </span>
        </div>
      )}
    </article>
  );
}

import { useEffect, useState, useRef } from "react";
import { User } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import AutoBanner from "./components1/AutoBanner";

const POSTS_API = "https://68f1a345b36f9750dee9d045.mockapi.io/api/v1/posts";

export default function TasteLinkPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthed, user, logout } = useAuth();
  const uid = isAuthed ? (user?.email || user?.id || null) : null;

  // ✅ 프로필 팝오버 상태
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

  // ✅ 외부 클릭 시 자동 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ posts 불러오기
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const postRes = await fetch(POSTS_API);
        const postData = await postRes.json();

        // 최신순 정렬
        const sorted = postData.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setPosts(sorted);
      } catch (err) {
        console.error("데이터 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [location.pathname]);

  // ✅ 페이지 계산
  const indexOfLast = currentPage * postsPerPage;
  const indexOfFirst = indexOfLast - postsPerPage;
  const totalPages = Math.ceil(posts.length / postsPerPage);

  // ❤️ 좋아요 토글 기능
  const toInt = (v) => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : 0;
  };

  const handleLike = async (id) => {
    const target = posts.find((p) => String(p.id) === String(id));
    if (!target) return;

    const prevLikes = toInt(target.likes);
    const likedBy = Array.isArray(target.likedBy) ? target.likedBy : [];
    const hasLiked = uid ? likedBy.includes(uid) : false;

    const newLikes = hasLiked ? Math.max(prevLikes - 1, 0) : prevLikes + 1;
    const nextLikedBy = hasLiked
      ? likedBy.filter((u) => u !== uid)
      : [...likedBy, uid];

    // ✅ UI 즉시 반영
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, likes: newLikes, likedBy: nextLikedBy } : p
      )
    );

    try {
      // ✅ 서버 반영
      const res = await fetch(`${POSTS_API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...target, likes: newLikes, likedBy: nextLikedBy }),
      });
      if (!res.ok) throw new Error("PUT 실패");
      const saved = await res.json();
      setPosts((prev) => prev.map((p) => (p.id === id ? saved : p)));
    } catch (err) {
      console.error("좋아요 반영 실패:", err);
      // 실패 시 롤백
      setPosts((prev) => prev.map((p) => (p.id === id ? target : p)));
    }
  };

  // ✅ 렌더링
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* 상단바 */}
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

            {isAuthed ? (
              <div className="relative flex items-center gap-2 pl-2" ref={profileRef}>
                {/* 👤 프로필 버튼 */}
                <button
                  onClick={() => setShowProfile((prev) => !prev)}
                  className="inline-flex items-center gap-1 text-sm text-gray-700 border px-3 py-1 rounded-full hover:bg-gray-50 transition"
                >
                  <User className="h-4 w-4" />
                  {user?.name || user?.email}
                </button>

                {/* 🚀 팝오버 박스 */}
                {showProfile && (
                  <div className="absolute top-12 right-0 w-56 bg-white border rounded-2xl shadow-lg p-4 text-sm text-gray-700 z-50 animate-fade-in">
                    <p className="font-semibold text-gray-800 mb-1">
                      {user.name || "이름 없음"}
                    </p>
                    <p className="text-xs text-gray-500 mb-3">{user.email}</p>
                    <button
                      onClick={logout}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 rounded-md text-xs"
                    >
                      로그아웃
                    </button>
                  </div>
                )}
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

      {/* 배너 */}
      <AutoBanner />

      {/* 카드 리스트 */}
      <main className="mx-auto max-w-6xl px-4 mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <p className="col-span-full text-center text-gray-500">
            불러오는 중...
          </p>
        ) : posts.length > 0 ? (
          posts.slice(indexOfFirst, indexOfLast).map((p) => (
            <Card key={p.id} {...p} uid={uid} onLike={handleLike} />
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
            className={`px-4 py-2 rounded-full border ${
              currentPage === i + 1
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
  image,
  paymentMethod,
  attendees,
  capacity,
  likedBy,
  uid,
  onLike,
}) {
  const navigate = useNavigate();
  const attArr = Array.isArray(attendees) ? attendees : [];
  const currentAttendeeCount = attArr.length || 0;
  const imageSrc =
    typeof image === "string" && image.startsWith("http")
      ? image
      : "https://picsum.photos/seed/default/600/400";
  const isFull = capacity ? currentAttendeeCount >= capacity : false;

  const already = uid && Array.isArray(likedBy) && likedBy.includes(uid);

  return (
    <article
      onClick={() => navigate(`/post/${id}`)}
      className="relative cursor-pointer rounded-xl border overflow-hidden hover:shadow-md transition bg-white"
    >
      <div className="w-full aspect-[4/3] overflow-hidden bg-gray-100">
        <img src={imageSrc} alt={title} className="w-full h-auto object-cover" />
      </div>

      {paymentMethod && (
        <div className="p-4 pb-0">
          <div className="inline-block bg-white border px-3 py-1 rounded-full text-[11px] font-semibold text-gray-700 shadow-sm">
            💳 {paymentMethod}
          </div>
        </div>
      )}

      <div className="p-4 pt-2">
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">작성자: {writer}</p>
        <p className="text-sm text-gray-700 mt-1">
          👥 참석 <b>{currentAttendeeCount}명</b> / 모집{" "}
          <b>{capacity ?? 10}명</b>
        </p>

        <div className="flex items-center justify-between mt-2 text-sm text-gray-700">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLike?.(id);
            }}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border hover:bg-gray-50 active:scale-[0.98] transition ${
              already ? "bg-rose-50 border-rose-300 text-rose-600" : ""
            }`}
          >
            ❤️ {already ? "좋아요" : "좋아요"}
          </button>
          <span>❤️ {likes ?? 0}</span>
        </div>
      </div>

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

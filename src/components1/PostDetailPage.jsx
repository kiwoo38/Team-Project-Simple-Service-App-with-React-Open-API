import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Pencil,
  Trash2,
  CalendarDays,
  User,
  Heart,
  Clock,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";

const API_URL = "https://68f1a345b36f9750dee9d045.mockapi.io/api/v1/posts";
const USERS_API = "https://68f1a345b36f9750dee9d045.mockapi.io/api/v1/users";

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [post, setPost] = useState(null);
  const [users, setUsers] = useState([]);
  const [showUpdated, setShowUpdated] = useState(false);
  const { isAuthed, user } = useAuth();

  const [busy, setBusy] = useState(false);
  const [showAttendees, setShowAttendees] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);

  useEffect(() => {
    if (location.state?.updated) {
      setShowUpdated(true);
      const timer = setTimeout(() => setShowUpdated(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [postRes, userRes] = await Promise.all([
          fetch(`${API_URL}/${id}`),
          fetch(USERS_API),
        ]);
        const postData = await postRes.json();
        const userData = await userRes.json();
        setPost(postData);
        setUsers(userData);
      } catch (err) {
        console.error("상세 불러오기 실패:", err);
      }
    }
    fetchData();
  }, [id, location.state?.updated]);

  const formatDateTime = (isoString) => {
    if (!isoString) return "미정";
    return new Date(isoString).toLocaleString("ko-KR", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = async () => {
    if (!window.confirm("정말 삭제할까?")) return;
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      alert("삭제 완료!");
      navigate("/");
    } catch (error) {
      console.error("삭제 실패:", error);
    }
  };

  const handleEdit = () => navigate(`/post/${id}/edit`);

  const parsePositiveInt = (raw) => {
    if (raw === undefined || raw === null) return undefined;
    const s = String(raw).trim();
    const digits = s.replace(/[^\d]/g, "");
    if (!digits) return undefined;
    const n = parseInt(digits, 10);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  };

  const attendees = Array.isArray(post?.attendees) ? post.attendees : [];
  const capacity =
    parsePositiveInt(post?.capacity) ??
    parsePositiveInt(post?.maxMembers) ??
    parsePositiveInt(post?.members) ??
    parsePositiveInt(post?.membersLimit);

  const currentAttendeeCount = attendees.length;
  const isFull = capacity ? currentAttendeeCount >= capacity : false;
  const userIdentifier = user?.name || user?.email;
  const joined = isAuthed && !!userIdentifier && attendees.includes(userIdentifier);

  // ✅ 참석 (+1)
  async function handleJoin() {
    if (!isAuthed) {
      const next = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?next=${next}`);
      return;
    }
    if (!userIdentifier) {
      alert("로그인 정보가 없습니다.");
      return;
    }
    if (busy) return;
    setBusy(true);

    try {
      const fresh = await fetch(`${API_URL}/${id}`).then((r) => r.json());
      const freshAtt = Array.isArray(fresh.attendees) ? fresh.attendees : [];
      const freshCap =
        parsePositiveInt(fresh.capacity) ??
        parsePositiveInt(fresh.maxMembers) ??
        parsePositiveInt(fresh.members) ??
        parsePositiveInt(fresh.membersLimit);

      if (freshAtt.includes(userIdentifier)) {
        alert("이미 참가하셨습니다.");
        return;
      }
      if (freshCap && freshAtt.length >= freshCap) {
        alert("정원이 모두 찼습니다.");
        return;
      }

      // ✅ 이름이 있으면 이름으로, 없으면 이메일로 저장
      const displayName = user?.name ? user.name : user.email;

      const nextAttendees = [...freshAtt, displayName];
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fresh, attendees: nextAttendees }),
      });
      const updated = await res.json();

      setPost((prev) => ({
        ...updated,
        attendees: nextAttendees,
      }));

      alert("참석 완료!");
    } catch (e) {
      console.error("참석 처리 실패:", e);
      alert("참석 처리 중 오류가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  }

  // ✅ 참석 취소
  async function handleCancel() {
    if (!isAuthed) {
      const next = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?next=${next}`);
      return;
    }
    if (!userIdentifier) {
      alert("로그인 정보가 없습니다.");
      return;
    }
    if (busy) return;
    setBusy(true);

    try {
      const fresh = await fetch(`${API_URL}/${id}`).then((r) => r.json());
      const freshAtt = Array.isArray(fresh.attendees) ? fresh.attendees : [];
      if (!freshAtt.includes(userIdentifier) && !freshAtt.includes(user?.name)) {
        alert("현재 참여 중이 아닙니다.");
        return;
      }

      const nextAttendees = freshAtt.filter(
        (em) => em !== userIdentifier && em !== user?.name
      );
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fresh, attendees: nextAttendees }),
      });
      const updated = await res.json();

      setPost((prev) => ({
        ...updated,
        attendees: nextAttendees,
      }));

      alert("참석 취소되었습니다.");
    } catch (e) {
      console.error("참석 취소 실패:", e);
      alert("참석 취소 중 오류 발생.");
    } finally {
      setBusy(false);
    }
  }

  if (!post) return <p className="text-center mt-20 text-gray-500">로딩 중...</p>;

  const { title, writer, likes, image, paymentMethod, eventDate, endAt, createdAt } =
    post;
  const imageSrc =
    typeof image === "string" && image.startsWith("http")
      ? image
      : "https://picsum.photos/seed/default/800/600";

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rose-50 py-12 px-4 relative">
      {showUpdated && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-green-100 border border-green-300 text-green-800 px-5 py-2 rounded-full shadow-sm flex items-center gap-2 z-50 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span>수정이 완료되었습니다!</span>
        </div>
      )}

      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-200 flex flex-col md:flex-row">
        <div className="md:w-1/2 w-full bg-gray-100">
          <img src={imageSrc} alt={title} className="h-full w-full object-cover" />
        </div>

        <div className="md:w-1/2 w-full p-8 flex flex-col justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
              <User className="w-4 h-4" />
              <span>{writer}</span>
              <span className="mx-2">•</span>
              <span>{formatDateTime(createdAt)}</span>
            </div>

            <div className="mt-6 space-y-3 text-gray-700">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-rose-400 mt-[2px]" />
                <span>이벤트 시간: {formatDateTime(eventDate)}</span>
              </div>
              <div className="flex items-start gap-2">
                <CalendarDays className="w-4 h-4 text-rose-400 mt-[2px]" />
                <span>모집 마감: {formatDateTime(endAt)}</span>
              </div>
            </div>

            <div className="mt-6 space-y-2 text-gray-700">
              <div>💳 결제 방식: {paymentMethod || "없음"}</div>

              <div className="flex items-center gap-2">
                👥 참석 인원: {currentAttendeeCount}명
                {capacity ? ` / 모집 인원: ${capacity}명` : ""}
                <button
                  onClick={() => setShowAttendees(true)}
                  className="text-sm text-rose-500 underline hover:text-rose-600 ml-2"
                >
                  (인원 확인하기)
                </button>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Heart className="w-5 h-5 text-rose-400" />
                <span>{likes} Likes</span>
              </div>
            </div>
          </div>

          <div className="flex justify-start gap-3 mt-8 flex-wrap">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1 text-sm border border-gray-300 rounded-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition whitespace-nowrap"
            >
              ← 목록으로
            </button>
            <button
              onClick={handleEdit}
              className="flex items-center gap-1 bg-rose-300 hover:bg-rose-400 text-white px-5 py-2 rounded-full transition whitespace-nowrap"
            >
              <Pencil className="w-4 h-4" /> 수정
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-full transition whitespace-nowrap"
            >
              <Trash2 className="w-4 h-4" /> 삭제
            </button>
            <button
              onClick={handleJoin}
              disabled={joined || isFull || busy}
              className={`flex items-center gap-1 px-5 py-2 rounded-full transition text-white whitespace-nowrap ${
                joined || isFull || busy
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black hover:bg-gray-800"
              }`}
            >
              {busy
                ? "처리 중..."
                : joined
                ? "이미 참가함"
                : isFull
                ? "정원 마감"
                : "참석하기"}
            </button>
            <button
              onClick={handleCancel}
              disabled={!joined || busy}
              className={`flex items-center gap-1 px-5 py-2 rounded-full transition whitespace-nowrap ${
                joined && !busy
                  ? "border border-gray-300 hover:bg-gray-100 text-gray-800"
                  : "border border-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {busy ? "처리 중..." : "참석 취소"}
            </button>
          </div>
        </div>
      </div>

      {/* ✅ 후기 섹션 다시 추가 */}
      <ReviewSection post={post} setPost={setPost} id={id} user={user} />

      {/* ✅ 참석자 모달 */}
      {showAttendees && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-[640px] relative flex">
            <div className="w-1/2 pr-4 border-r overflow-y-auto max-h-72">
              <h3 className="text-lg font-semibold mb-3">참석자 목록</h3>
              <ul className="space-y-2">
                {attendees.map((a, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 cursor-pointer hover:underline"
                    onClick={() => setSelectedProfile(a)}
                  >
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      {users.find((u) => u.email === a)?.name || a}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-1/2 pl-4">
              <h3 className="text-lg font-semibold mb-3">상세 정보</h3>
              {selectedProfile ? (
                (() => {
                  const found =
                    users.find((u) => u.name === selectedProfile) ||
                    users.find((u) => u.email === selectedProfile);
                  if (!found)
                    return <p className="text-sm text-gray-500">정보가 없습니다.</p>;
                  return (
                    <div className="space-y-2 text-sm text-gray-700">
                      <p>이름: {found.name}</p>
                      <p>이메일: {found.email}</p>
                      <p>추천수: {found.reputation}</p>
                      <p>신고수: {found.reports}</p>
                    </div>
                  );
                })()
              ) : (
                <p className="text-sm text-gray-500">
                  왼쪽에서 참석자를 선택하세요.
                </p>
              )}
            </div>

            <button
              onClick={() => setShowAttendees(false)}
              className="absolute top-2 right-3 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ✅ 후기 작성 섹션 (원본 그대로)
function ReviewSection({ post, setPost, id, user }) {
  const isAuthed = !!user;
  return (
    <div className="max-w-5xl mx-auto mt-10 bg-white shadow rounded-2xl p-6 border border-gray-200">
      <h2 className="text-xl font-semibold mb-3 text-gray-800">후기</h2>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {post.reviews?.length > 0 ? (
          post.reviews.map((r, i) => (
            <div key={i} className="bg-gray-50 p-3 rounded-lg relative">
              <div className="flex justify-between">
                <p className="font-bold text-gray-800">{r.writer}</p>
                <p className="text-xs text-gray-400">
                  {r.createdAt
                    ? new Date(r.createdAt).toLocaleString("ko-KR")
                    : ""}
                </p>
              </div>
              <p className="text-gray-600 text-sm mt-1">{r.text}</p>
              {(user?.name === r.writer || user?.email === r.writer) && (
                <button
                  className="absolute top-2 right-3 text-xs text-gray-400 hover:text-rose-500"
                  onClick={async () => {
                    if (!window.confirm("이 후기를 삭제할까요?")) return;
                    const nextReviews = post.reviews.filter(
                      (_, idx) => idx !== i
                    );
                    const res = await fetch(`${API_URL}/${id}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ ...post, reviews: nextReviews }),
                    });
                    const updated = await res.json();
                    setPost(updated);
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm">아직 후기가 없습니다.</p>
        )}
      </div>

      {isAuthed && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const text = e.target.review.value.trim();
            if (!text) return;
            const newReview = {
              writer: user.name || user.email,
              text,
              createdAt: new Date().toISOString(),
            };
            const nextReviews = [...(post.reviews || []), newReview];
            const res = await fetch(`${API_URL}/${id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...post, reviews: nextReviews }),
            });
            const updated = await res.json();
            setPost(updated);
            e.target.reset();
          }}
          className="mt-4 flex gap-2"
        >
          <input
            type="text"
            name="review"
            placeholder="후기를 입력하세요..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-rose-300"
          />
          <button
            type="submit"
            className="bg-rose-400 hover:bg-rose-500 text-white rounded-lg px-4 py-2 text-sm"
          >
            등록
          </button>
        </form>
      )}
    </div>
  );
}

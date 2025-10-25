import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Pencil, Trash2, CalendarDays, User, Heart, Clock, CheckCircle } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

const API_URL = "https://68f1a345b36f9750dee9d045.mockapi.io/api/v1/posts";

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [post, setPost] = useState(null);
  const [showUpdated, setShowUpdated] = useState(false);
  const { isAuthed, user } = useAuth();

  // 중복 클릭 방지
  const [busy, setBusy] = useState(false);

  // 수정 완료 알림
  useEffect(() => {
    if (location.state?.updated) {
      setShowUpdated(true);
      const timer = setTimeout(() => setShowUpdated(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // 상세 불러오기
  useEffect(() => {
    fetch(`${API_URL}/${id}`)
      .then((res) => res.json())
      .then((data) => setPost(data))
      .catch((err) => console.error("상세 불러오기 실패:", err));
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

  // ---- 유틸: 숫자 파싱 (예: "8명" → 8) ----
  const parsePositiveInt = (raw) => {
    if (raw === undefined || raw === null) return undefined;
    const s = String(raw).trim();
    if (!s) return undefined;
    const digits = s.replace(/[^\d]/g, "");
    if (!digits) return undefined;
    const n = parseInt(digits, 10);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  };

  // ---- 파생값: 참석/정원/상태 ----
  const attendees = Array.isArray(post?.attendees) ? post.attendees : [];
  // ⚠️ 정원은 '모집 인원'으로 고정. capacity, maxMembers, members, membersLimit 중 있는 걸 "정원"으로 간주
  const capacity =
    parsePositiveInt(post?.capacity) ??
    parsePositiveInt(post?.maxMembers) ??
    parsePositiveInt(post?.members) ?? // 기존에 members를 정원으로 써왔으면 여기서 읽음
    parsePositiveInt(post?.membersLimit);

  const currentAttendeeCount = attendees.length; // 현재 참석 인원은 attendees 길이로만
  const isFull = capacity ? currentAttendeeCount >= capacity : false;

  const joined = isAuthed && !!user?.email && attendees.includes(user.email);

  // ---- 참석(+1): attendees에만 추가(정원 초과 금지) ----
  async function handleJoin() {
    if (!isAuthed) {
      const next = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?next=${next}`);
      return;
    }
    if (!user?.email) {
      alert("로그인 정보에 이메일이 없습니다.");
      return;
    }
    if (busy) return;
    setBusy(true);

    try {
      // 최신 데이터로 재확인
      const fresh = await fetch(`${API_URL}/${id}`).then((r) => r.json());
      const freshAtt = Array.isArray(fresh.attendees) ? fresh.attendees : [];
      const freshCap =
        parsePositiveInt(fresh.capacity) ??
        parsePositiveInt(fresh.maxMembers) ??
        parsePositiveInt(fresh.members) ??
        parsePositiveInt(fresh.membersLimit);

      if (freshAtt.includes(user.email)) {
        setPost(fresh);
        alert("이미 참가하셨습니다.");
        return;
      }
      if (freshCap && freshAtt.length >= freshCap) {
        setPost(fresh);
        alert("정원이 모두 찼습니다.");
        return;
      }

      const nextAttendees = [...freshAtt, user.email];

      // 🔑 정원(모집 인원)은 절대 변경하지 않고 attendees만 업데이트
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fresh, attendees: nextAttendees }),
      });
      const updated = await res.json();
      setPost(updated);
    } catch (e) {
      console.error("참석 처리 실패:", e);
      alert("참석 처리 중 오류가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  }

  // ---- 참석 취소(−1): 내 이메일만 제거 ----
  async function handleCancel() {
    if (!isAuthed) {
      const next = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?next=${next}`);
      return;
    }
    if (!user?.email) {
      alert("로그인 정보에 이메일이 없습니다.");
      return;
    }
    if (busy) return;
    setBusy(true);

    try {
      // 최신 데이터로 재확인
      const fresh = await fetch(`${API_URL}/${id}`).then((r) => r.json());
      const freshAtt = Array.isArray(fresh.attendees) ? fresh.attendees : [];

      if (!freshAtt.includes(user.email)) {
        setPost(fresh);
        alert("현재 참여 중이 아닙니다.");
        return;
      }

      const nextAttendees = freshAtt.filter((em) => em !== user.email);

      // 🔑 모집 인원(정원)은 그대로, attendees만 업데이트
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fresh, attendees: nextAttendees }),
      });
      const updated = await res.json();
      setPost(updated);
    } catch (e) {
      console.error("참석 취소 실패:", e);
      alert("참석 취소 처리 중 오류가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  }

  if (!post) return <p className="text-center mt-20 text-gray-500">로딩 중...</p>;

  const {
    title,
    writer,
    likes,
    image,
    paymentMethod,
    eventDate,
    endAt,
    createdAt,
  } = post;

  const imageSrc =
    typeof image === "string" && image.startsWith("http")
      ? image
      : "https://picsum.photos/seed/default/800/600";

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rose-50 py-12 px-4 relative">
      {/* 수정 완료 알림 */}
      {showUpdated && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-green-100 border border-green-300 text-green-800 px-5 py-2 rounded-full shadow-sm flex items-center gap-2 z-50 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span>수정이 완료되었습니다!</span>
        </div>
      )}

      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-200 flex flex-col md:flex-row">
        {/* 왼쪽 이미지 */}
        <div className="md:w-1/2 w-full bg-gray-100">
          <img src={imageSrc} alt={title} className="h-full w-full object-cover" />
        </div>

        {/* 오른쪽 내용 */}
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
              <div className="flex items-start gap-2 break-keep">
                <Clock className="w-4 h-4 text-rose-400 mt-[2px]" />
                <span>이벤트 시간: {formatDateTime(eventDate)}</span>
              </div>
              <div className="flex items-start gap-2 break-keep">
                <CalendarDays className="w-4 h-4 text-rose-400 mt-[2px]" />
                <span>모집 마감: {formatDateTime(endAt)}</span>
              </div>
            </div>

            <div className="mt-6 space-y-2 text-gray-700">
              <div>💳 결제 방식: {paymentMethod || "없음"}</div>

              {/* ✅ 참석 인원 / 모집 인원 표기 */}
              <div>
                👥 참석 인원: {currentAttendeeCount}명{capacity ? ` / 모집 인원: ${capacity}명` : ""}
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Heart className="w-5 h-5 text-rose-400" />
                <span>{likes} Likes</span>
              </div>
            </div>
          </div>

          {/* 하단 버튼 영역 */}
          <div className="flex justify-start gap-3 mt-8">
            {/* 목록으로 */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1 text-sm border border-gray-300 rounded-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
            >
              ← 목록으로
            </button>

            {/* 수정 */}
            <button
              onClick={handleEdit}
              className="flex items-center gap-1 bg-rose-300 hover:bg-rose-400 text-white px-5 py-2 rounded-full transition"
            >
              <Pencil className="w-4 h-4" />
              수정
            </button>

            {/* 삭제 */}
            <button
              onClick={handleDelete}
              className="flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-full transition"
            >
              <Trash2 className="w-4 h-4" />
              삭제
            </button>

            {/* 참석하기(+1) */}
            <button
              onClick={handleJoin}
              disabled={joined || isFull || busy}
              className={`flex items-center gap-1 px-5 py-2 rounded-full transition text-white
                ${joined || isFull || busy ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800"}`}
              title={
                busy ? "처리 중..."
                : joined ? "이미 참가함"
                : isFull ? "정원 마감" : ""
              }
            >
              {busy ? "처리 중..." : joined ? "이미 참가함" : isFull ? "정원 마감" : "참석하기 (+1)"}
            </button>

            {/* 참석 취소(−1) */}
            <button
              onClick={handleCancel}
              disabled={!joined || busy}
              className={`flex items-center gap-1 px-5 py-2 rounded-full transition
                ${joined && !busy ? "border border-gray-300 hover:bg-gray-100 text-gray-800"
                                   : "border border-gray-200 text-gray-400 cursor-not-allowed"}`}
              title={!joined ? "현재 참여 중이 아닙니다" : busy ? "처리 중..." : ""}
            >
              {busy ? "처리 중..." : "참석 취소 (−1)"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState } from "react";

const API_URL = "https://68f1a345b36f9750dee9d045.mockapi.io/api/v1/posts";

export default function PostCreatePage() {
  const [form, setForm] = useState({
    writer: "",
    title: "",
    members: "",
    likes: 0,          // ✅ 기본 0
    createdAt: "",
    eventDate: "",     // ✅ 추가
    endAt: "",         // ✅ 추가
    paymentMethod: "",
    image: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // ✅ 숫자 필드 정규화
    if (name === "members" || name === "likes") {
      const num = value === "" ? "" : Math.max(0, Number(value));
      setForm({ ...form, [name]: num });
      return;
    }

    // ✅ 이미지 입력 정리
    if (name === "image") {
      let clean = value.trim();
      clean = clean.replace(/^"+|"+$/g, "");
      if (clean && !clean.startsWith("http")) clean = "https://" + clean;
      setForm({ ...form, [name]: clean });
      return;
    }

    // ✅ 날짜/기타 공통
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ 날짜/로직 검증
    const today0 = new Date();
    today0.setHours(0, 0, 0, 0);
    if (form.eventDate) {
      const ev = new Date(form.eventDate);
      if (ev < today0) return alert("모임 날짜(eventDate)는 오늘 이후여야 해.");
    }
    if (form.endAt && form.eventDate) {
      const end = new Date(form.endAt);
      const ev  = new Date(form.eventDate);
      if (end > ev) return alert("모집 마감일(endAt)은 모임 날짜(eventDate) 이전/동일이어야 해.");
    }

    const safeForm = {
      ...form,
      // 숫자 보정
      members: form.members === "" ? 1 : Number(form.members),
      likes: form.likes === "" ? 0 : Number(form.likes),
      // 빈 이미지 기본값
      image: form.image || "https://picsum.photos/seed/default/600/400",
      // 날짜 ISO로 저장 (mockapi date 필드 호환)
      createdAt: new Date().toISOString(),
      eventDate: form.eventDate ? new Date(form.eventDate).toISOString() : null,
      endAt: form.endAt ? new Date(form.endAt).toISOString() : null,
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(safeForm),
      });

      if (res.ok) {
        alert("모집글이 성공적으로 등록되었습니다!");
        window.location.href = "/";
      } else {
        alert("등록 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("등록 실패:", error);
      alert("서버 연결에 실패했습니다.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-12 p-6 border rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">✍️ 모집글 등록</h2>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <input
          type="text"
          name="writer"
          placeholder="작성자"
          value={form.writer}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        <input
          type="text"
          name="title"
          placeholder="제목"
          value={form.title}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        <input
          type="number"
          name="members"
          placeholder="모집 인원 (숫자)"
          value={form.members}
          onChange={handleChange}
          className="border p-2 rounded"
          min="1"
          required
        />

        {/* ✅ 모집 마감일 */}
        <label className="text-sm font-medium">모집 마감일 (endAt)</label>
        <input
          type="date"
          name="endAt"
          value={form.endAt}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        {/* ✅ 모임 날짜 */}
        <label className="text-sm font-medium">모임 날짜 (eventDate)</label>
        <input
          type="date"
          name="eventDate"
          value={form.eventDate}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <select
          name="paymentMethod"
          value={form.paymentMethod}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        >
          <option value="">결제 방식 선택</option>
          <option value="n분의1">n분의1</option>
          <option value="각자결제">각자결제</option>
          <option value="선결제">선결제</option>
        </select>

        {/* ✅ 이미지 주소 입력 + 미리보기 */}
        <input
          type="text"
          name="image"
          placeholder="이미지 주소 (예: https://cdn.pixabay.com/...jpg)"
          value={form.image}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        {form.image && (
          <img
            src={form.image}
            alt="미리보기"
            className="w-full max-h-60 object-cover rounded border"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        )}

        <button
          type="submit"
          className="mt-4 bg-rose-400 hover:bg-rose-500 text-white py-2 rounded transition"
        >
          등록하기
        </button>
      </form>
    </div>
  );
}

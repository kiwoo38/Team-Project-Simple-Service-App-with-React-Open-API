import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_URL = "https://68f1a345b36f9750dee9d045.mockapi.io/api/v1/posts";

export default function PostEditPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        writer: "",
        title: "",
        members: "",
        likes: "",
        eventDate: "",
        endAt: "",
        paymentMethod: "",
        image: "",
    });
    const [loading, setLoading] = useState(true);

    // ✅ 기존 게시글 불러오기
    useEffect(() => {
        fetch(`${API_URL}/${id}`)
            .then((res) => res.json())
            .then((data) => {
                setForm({
                    writer: data.writer || "",
                    title: data.title || "",
                    members: data.members || "",
                    likes: data.likes || "",
                    eventDate: data.eventDate || "",
                    endAt: data.endAt || "",
                    paymentMethod: data.paymentMethod || "",
                    image: data.image || "",
                });
                setLoading(false);
            })
            .catch((err) => console.error("게시글 불러오기 실패:", err));
    }, [id]);

    // ✅ 입력값 변경 처리
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // ✅ 수정 저장 (PUT)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            // ✅ 수정 완료 후 상세 페이지로 이동 + 상태 전달
            navigate(`/post/${id}`, { state: { updated: true } });
        } catch (error) {
            console.error("수정 실패:", error);
        }
    };


    if (loading)
        return <p className="text-center mt-20 text-gray-500">로딩 중...</p>;

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-rose-50 py-12 px-4">
            <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl border border-gray-200 p-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                    ✏️ 모집글 수정
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 제목 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            제목
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-300 outline-none"
                            required
                        />
                    </div>

                    {/* 작성자 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            작성자
                        </label>
                        <input
                            type="text"
                            name="writer"
                            value={form.writer}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-300 outline-none"
                            required
                        />
                    </div>

                    {/* 모집 인원 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            모집 인원
                        </label>
                        <input
                            type="number"
                            name="members"
                            value={form.members}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-300 outline-none"
                            required
                        />
                    </div>

                    {/* 이벤트 시간 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            이벤트 시간
                        </label>
                        <input
                            type="datetime-local"
                            name="eventDate"
                            value={form.eventDate}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-300 outline-none"
                        />
                    </div>

                    {/* 모집 마감 시간 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            모집 마감 시간
                        </label>
                        <input
                            type="datetime-local"
                            name="endAt"
                            value={form.endAt}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-300 outline-none"
                        />
                    </div>

                    {/* 결제 방식 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            결제 방식
                        </label>
                        <select
                            name="paymentMethod"
                            value={form.paymentMethod}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-300 outline-none"
                        >
                            <option value="">선택해주세요</option>
                            <option value="현금">현금</option>
                            <option value="계좌이체">계좌이체</option>
                            <option value="카드결제">카드결제</option>
                            <option value="기타">기타</option>
                        </select>
                    </div>

                    {/* 이미지 URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            이미지 URL
                        </label>
                        <input
                            type="text"
                            name="image"
                            value={form.image}
                            onChange={handleChange}
                            placeholder="https://example.com/image.jpg"
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-300 outline-none"
                        />
                    </div>

                    {/* 좋아요 수 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            좋아요 수
                        </label>
                        <input
                            type="number"
                            name="likes"
                            value={form.likes}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-300 outline-none"
                        />
                    </div>

                    {/* 저장 버튼 */}
                    <div className="flex justify-end gap-3 mt-8">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-5 py-2 rounded-full border text-gray-600 hover:bg-gray-100 transition"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 rounded-full bg-rose-300 hover:bg-rose-400 text-white transition"
                        >
                            저장하기
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

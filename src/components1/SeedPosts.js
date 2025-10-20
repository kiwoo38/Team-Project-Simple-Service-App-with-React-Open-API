// src/components1/SeedPosts.js

const API_URL = "https://68f1a345b36f9750dee9d045.mockapi.io/api/v1/posts";

// ✅ 하람이 직접 정의한 초기 데이터
const initialPosts = [
  {
    writer: "하람",
    title: "강남 스시 같이 드실 분",
    members: 3,
    likes: 5,
    createdAt: new Date().toISOString(),
    eventDate: new Date().toISOString(),
    endAt: new Date().toISOString(),
    paymentMethod: "n분의1",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1400&auto=format&fit=crop",
  },
  {
    writer: "하람",
    title: "홍대 고기파티",
    members: 5,
    likes: 8,
    createdAt: new Date().toISOString(),
    eventDate: new Date().toISOString(),
    endAt: new Date().toISOString(),
    paymentMethod: "각자결제",
    image: "https://images.unsplash.com/photo-1604908176997-431a1a5b9a5a?q=80&w=1400&auto=format&fit=crop",
  },
  {
    writer: "하람",
    title: "신촌 찌개모임",
    members: 4,
    likes: 2,
    createdAt: new Date().toISOString(),
    eventDate: new Date().toISOString(),
    endAt: new Date().toISOString(),
    paymentMethod: "선결제",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1400&auto=format&fit=crop",
  },
];

export async function seedPosts() {
  try {
    const res = await fetch(API_URL);
    const existing = await res.json();

    // 이미 데이터 있으면 안 만들기
    if (existing.length > 0) return;

    // 없으면 초기 데이터 등록
    for (const post of initialPosts) {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(post),
      });
    }
  } catch (err) {
    console.error("Seed error:", err);
  }
}

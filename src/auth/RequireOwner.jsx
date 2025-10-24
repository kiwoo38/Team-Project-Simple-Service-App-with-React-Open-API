import { Navigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const API_URL = "https://68f1a345b36f9750dee9d045.mockapi.io/api/v1/posts";

export default function RequireOwner({ children }) {
  const { user } = useAuth();
  const { id } = useParams();
  const [ok, setOk] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/${id}`);
        const post = await res.json();
        // 작성자 식별: writerEmail 필드를 쓰는 걸 권장(없다면 writer와 user.name 매칭)
        setOk(post.writerEmail ? post.writerEmail === user?.email : post.writer === user?.name);
      } catch {
        setOk(false);
      }
    })();
  }, [id, user]);

  if (ok === null) return null; // 로딩 중
  if (!ok) return <Navigate to={`/post/${id}`} replace />;
  return children;
}

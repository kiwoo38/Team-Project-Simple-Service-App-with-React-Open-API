import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("tl_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthed(true);
    }
  }, []);

  // ✅ 로그인
  const login = (userData) => {
    localStorage.setItem("tl_user", JSON.stringify(userData));
    setUser(userData);
    setIsAuthed(true);
  };

  // ✅ 로그아웃
  const logout = () => {
    localStorage.removeItem("tl_user");
    setUser(null);
    setIsAuthed(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthed, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

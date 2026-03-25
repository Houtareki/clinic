import { useState } from "react";
import AuthContext from "./AuthContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const role = localStorage.getItem("userRole");
    const fullName = localStorage.getItem("fullName");
    const accountId = localStorage.getItem("accountId");

    if (role) return { role, fullName, accountId };

    return null;
  });

  function login(data) {
    localStorage.setItem("userRole", data.role);
    localStorage.setItem("fullName", data.fullName);
    localStorage.setItem("accountId", data.accountId);
    setUser(data);
  }

  function logout() {
    localStorage.clear();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

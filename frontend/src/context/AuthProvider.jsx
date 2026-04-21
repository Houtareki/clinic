import { useState } from "react";
import AuthContext from "./AuthContext";

const USER_STORAGE_KEY = "user";

function setStoredValue(key, value) {
  if (value === undefined || value === null || value === "") {
    localStorage.removeItem(key);
    return;
  }

  localStorage.setItem(key, String(value));
}

function persistUser(user) {
  if (!user) {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem("userRole");
    localStorage.removeItem("fullName");
    localStorage.removeItem("accountId");
    localStorage.removeItem("avatarUrl");
    return null;
  }

  const nextUser = {
    ...user,
    accountId: user.accountId ?? user.id ?? "",
    avatarUrl: user.avatarUrl ?? "",
  };

  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
  setStoredValue("userRole", nextUser.role);
  setStoredValue("fullName", nextUser.fullName);
  setStoredValue("accountId", nextUser.accountId);
  setStoredValue("avatarUrl", nextUser.avatarUrl);

  return nextUser;
}

function readStoredUser() {
  try {
    const rawUser = localStorage.getItem(USER_STORAGE_KEY);
    if (rawUser) {
      const parsedUser = JSON.parse(rawUser);
      if (parsedUser?.role) {
        return {
          ...parsedUser,
          accountId: parsedUser.accountId ?? parsedUser.id ?? "",
          avatarUrl: parsedUser.avatarUrl ?? "",
        };
      }
    }
  } catch {
    //
  }

  const role = localStorage.getItem("userRole");
  const fullName = localStorage.getItem("fullName");
  const accountId = localStorage.getItem("accountId");
  const avatarUrl = localStorage.getItem("avatarUrl");

  if (!role) {
    return null;
  }

  return {
    role,
    fullName,
    accountId,
    avatarUrl: avatarUrl || "",
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  function login(data) {
    const nextUser = persistUser(data);
    setUser(nextUser);
  }

  function updateUser(patch) {
    setUser((currentUser) => {
      const nextUser = persistUser({
        ...(currentUser || {}),
        ...(patch || {}),
      });

      return nextUser;
    });
  }

  function logout() {
    persistUser(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); 

  
  useEffect(() => {
    const storedUser = localStorage.getItem("sfa_user");
    const storedToken = localStorage.getItem("sfa_token");
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  
  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem("sfa_user", JSON.stringify(userData));
    localStorage.setItem("sfa_token", authToken);
  };

  
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("sfa_user");
    localStorage.removeItem("sfa_token");
  };

  
  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem("sfa_user", JSON.stringify(newUser));
  };

  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        updateUser,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
};

export default AuthContext;

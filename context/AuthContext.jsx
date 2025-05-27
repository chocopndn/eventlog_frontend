import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import socketService from "../services/socketService";
import globalSocketHandler from "../services/globalSocketHandler";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    type: "error",
    cancelTitle: "CLOSE",
  });

  const showSessionExpiredModal = () => {
    setModalConfig({
      title: "Session Expired",
      message: "Please log in again.",
      type: "warning",
      cancelTitle: "CLOSE",
    });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setTimeout(() => {
      router.replace("/");
    }, 100);
  };

  const logout = async () => {
    try {
      globalSocketHandler.cleanup();
      socketService.disconnect();
      setUser(null);
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userData");
      router.replace("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const login = async (userData, token) => {
    try {
      await AsyncStorage.setItem("userToken", token);
      await AsyncStorage.setItem("userData", JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  useEffect(() => {
    if (user && (user.role_id === 3 || user.role_id === 4 || user.block_id)) {
      globalSocketHandler.initialize(user);
    } else if (user) {
      globalSocketHandler.cleanup();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      socketService.connect();

      socketService.socket?.on("user-disabled", (data) => {
        const currentUserId =
          user.id_number || user.id || user.userId || user.user_id;
        const disabledUserId =
          data.userId || data.id_number || data.id || data.user_id;

        if (
          currentUserId &&
          currentUserId.toString() === disabledUserId.toString()
        ) {
          logout();
          showSessionExpiredModal();
        }
      });
    } else {
      socketService.disconnect();
    }
  }, [user]);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const userData = await AsyncStorage.getItem("userData");

        if (token && userData) {
          const parsedUserData = JSON.parse(userData);
          setUser(parsedUserData);
        }
      } catch (error) {
        console.error("Token check error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkToken();
  }, []);

  useEffect(() => {
    return () => {
      globalSocketHandler.cleanup();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        setUser,
        modalVisible,
        modalConfig,
        closeModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

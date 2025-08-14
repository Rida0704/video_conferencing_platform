import axios from "axios";
import httpStatus from "http-status";
import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import server from "../environment";

// Create context
export const AuthContext = createContext(null);

// Axios instance
const client = axios.create({
  baseURL: `${server.prod}/api/v1/users`,
  headers: {
    "Content-Type": "application/json"
  }
});

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const router = useNavigate();

  // Register user
  const handleRegister = async (name, username, password) => {
    try {
      const request = await client.post("/register", { name, username, password });

      if (request?.status === httpStatus.CREATED) {
        return request.data?.message || "Registration successful!";
      }
      throw new Error(request?.data?.message || "Registration failed.");
    } catch (err) {
      throw new Error(err.response?.data?.message || "Server error during registration.");
    }
  };

  // Login user
  const handleLogin = async (username, password) => {
    try {
      const request = await client.post("/login", { username, password });

      if (request?.status === httpStatus.OK) {
        localStorage.setItem("token", request.data?.token);
        setUserData(request.data?.user || {}); // store user data
        router("/home");
      } else {
        throw new Error(request?.data?.message || "Login failed.");
      }
    } catch (err) {
      throw new Error(err.response?.data?.message || "Server error during login.");
    }
  };

  // Get user history
  const getHistoryOfUser = async () => {
    try {
      const request = await client.get("/get_all_activity", {
        params: { token: localStorage.getItem("token") }
      });
      return request.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to fetch history.");
    }
  };

  // Add meeting to history
  const addToUserHistory = async (meetingCode) => {
    try {
      const request = await client.post("/add_to_activity", {
        token: localStorage.getItem("token"),
        meeting_code: meetingCode
      });
      return request.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to add to history.");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userData,
        setUserData,
        addToUserHistory,
        getHistoryOfUser,
        handleRegister,
        handleLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

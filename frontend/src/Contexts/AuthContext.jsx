import axios from "axios";
import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import server from "../environment.js";

export const AuthContext = createContext({});

// Frontend API client that talks to the backend auth endpoints.
const client = axios.create({
  // baseURL: "http://localhost:8000/user",
  baseURL: `${server.prod}/user`,
});

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const router = useNavigate();

  // Login flow: send username and password, save token, then redirect to home.
  const handleLogin = async (username, password) => {
    try {
      const request = await client.post("/login", {
        username,
        password,
      });

      if (request.status === 200) {
        localStorage.setItem("token", request.data.token);
        setUserData({ username });
        router("/home");
        return request.data;
      }
    } catch (err) {
      throw err;
    }

    return null;
  };

  // Registration flow: create the user and send a readable success message back.
  const handleRegister = async (name, username, password) => {
    try {
      const request = await client.post("/register", {
        name,
        username,
        password,
      });

      if (request.status === 200 || request.status === 201) {
        return request.data.message || request.data;
      }
    } catch (error) {
      throw error;
    }

    return "Registration failed";
  };

  const data = {
    handleLogin,
    handleRegister,
    userData,
    setUserData,
  };

  return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};

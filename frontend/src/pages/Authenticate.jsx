import React, { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  CssBaseline,
  TextField,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import { AuthContext } from "../Contexts/AuthContext";
import "./Auth.css";

const authImage =
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80";

function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary" align="center">
      © Your Website {new Date().getFullYear()}
    </Typography>
  );
}

export default function SignInSide() {
  const [formState, setFormState] = useState(0);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const { handleRegister, handleLogin } = React.useContext(AuthContext);

  const switchMode = (nextMode) => {
    setFormState(nextMode);
    setError("");
    setMessage("");
    setOpen(false);
  };

  const handleAuth = async () => {
    if (formState === 0) {
      try {
        await handleLogin(username, password);
        setError("");
      } catch (err) {
        const serverMessage = err?.response?.data;
        setError(typeof serverMessage === "string" ? serverMessage : "Login failed");
      }
      return;
    }

    if (formState === 1) {
      try {
        const result = await handleRegister(name, username, password);
        setUsername("");
        setMessage(result);
        setOpen(true);
        setError("");
        setFormState(0);
        setPassword("");
      } catch (err) {
        const serverMessage = err?.response?.data;
        setError(typeof serverMessage === "string" ? serverMessage : err?.message || "Server Error");
      }
    }
  };

  return (
    <>
      <CssBaseline />
      <div className="authPage">
        <div className="authCard">
          <div className="formPanel">
            <Box
              sx={{
                mx: 4,
                my: 6,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Avatar sx={{ m: 1, bgcolor: "#1976d2" }}>
                <LockOutlinedIcon />
              </Avatar>

              <div className="toggleRow">
                <button
                  type="button"
                  className={formState === 0 ? "toggleButton active" : "toggleButton"}
                  onClick={() => switchMode(0)}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className={formState === 1 ? "toggleButton active" : "toggleButton"}
                  onClick={() => switchMode(1)}
                >
                  Sign Up
                </button>
              </div>

              <p className="authError">{error}</p>

              <Box component="form" noValidate sx={{ mt: 1, width: "100%" }}>
                {formState === 1 && (
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="fullName"
                    label="Full Name"
                    name="fullName"
                    value={name}
                    autoFocus
                    onChange={(e) => setName(e.target.value)}
                  />
                )}

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  value={username}
                  autoFocus={formState === 0}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  value={password}
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                  id="password"
                />

                <Button
                  type="button"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2, py: 1.4, borderRadius: 2, fontWeight: 700 }}
                  onClick={handleAuth}
                >
                  {formState === 0 ? "Login" : "Register"}
                </Button>

                <div className="bottomLinks">
                  <span>Forgot password?</span>
                  <span>{formState === 0 ? "New here? Sign up" : "Already have an account? Sign in"}</span>
                </div>

                <Box sx={{ mt: 5 }}>
                  <Copyright />
                </Box>
              </Box>
            </Box>
          </div>

          <div className="imagePanel" style={{ backgroundImage: `url(${authImage})` }}>
            <div className="imageOverlay">
              <div className="brandBadge">V</div>
              <p className="eyebrow">Welcome aboard</p>
              <h2>Build better conversations.</h2>
              <p>
                Meet, collaborate, and keep your team aligned with real-time communication built for speed.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Snackbar open={open} autoHideDuration={6000} onClose={() => setOpen(false)}>
        <Alert onClose={() => setOpen(false)} severity="success" sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>
    </>
  );
}

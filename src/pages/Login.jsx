import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Avatar,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const email = formData.email.trim().toLowerCase();
    const password = formData.password.trim();

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const user = users.find(
      (u) =>
        u.email.toLowerCase() === email &&
        u.password === password
    );

    if (!user) {
      return setError("Invalid email or password");
    }

    // ✅ Store logged in user
    localStorage.setItem("currentUser", JSON.stringify(user));

    // ✅ Redirect properly
    if (user.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/student");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1E3A8A, #3B82F6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="sm">
        <Card elevation={10}>
          <CardContent sx={{ p: 5 }}>
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Avatar
                sx={{
                  bgcolor: "primary.main",
                  width: 60,
                  height: 60,
                  margin: "0 auto",
                  mb: 2,
                }}
              >
                <SchoolIcon />
              </Avatar>
              <Typography variant="h4">Edu Feedback Login</Typography>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                onChange={handleChange}
                margin="normal"
                required
              />

              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                onChange={handleChange}
                margin="normal"
                required
              />

              <Button type="submit" fullWidth variant="contained" sx={{ mt: 3 }}>
                Login
              </Button>
            </form>

            <Typography sx={{ mt: 2 }}>
              Don't have an account? <Link to="/register">Register</Link>
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;
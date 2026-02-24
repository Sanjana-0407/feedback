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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Avatar,
  IconButton,
  InputAdornment,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "",
    adminKey: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).*$/;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const email = formData.email.trim().toLowerCase();

    if (!passwordRegex.test(formData.password)) {
      return setError(
        "Password must include uppercase, lowercase, number & special character"
      );
    }

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    if (!formData.role) {
      return setError("Please select a role");
    }

    if (formData.role === "admin" && formData.adminKey !== "ADMIN123") {
      return setError("Invalid Admin Secret Key");
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const userExists = users.find(
      (u) => u.email.toLowerCase() === email
    );

    if (userExists) {
      return setError("User already exists with this email");
    }

    const newUser = {
      fullName: formData.fullName,
      email: email,
      password: formData.password,
      role: formData.role,
    };

    users.push(newUser);

    localStorage.setItem("users", JSON.stringify(users));

    navigate("/login");
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
              <Typography variant="h4" fontWeight="bold">
                EduFeedback
              </Typography>
              <Typography color="text.secondary">
                Create your account
              </Typography>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            <form onSubmit={handleSubmit} autoComplete="off">
              <TextField
                fullWidth
                label="Full Name"
                name="fullName"
                onChange={handleChange}
                margin="normal"
                required
              />

              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                onChange={handleChange}
                margin="normal"
                required
              />

              <FormControl fullWidth margin="normal">
                <InputLabel>Select Role</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  label="Select Role"
                >
                  <MenuItem value="">
                    <em>Select Role</em>
                  </MenuItem>
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>

              {formData.role === "admin" && (
                <TextField
                  fullWidth
                  label="Admin Key"
                  name="adminKey"
                  onChange={handleChange}
                  margin="normal"
                  required
                />
              )}

              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                onChange={handleChange}
                margin="normal"
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                onChange={handleChange}
                margin="normal"
                required
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3 }}
              >
                Register
              </Button>
            </form>

            <Typography sx={{ mt: 2 }}>
              Already have an account? <Link to="/login">Login</Link>
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Register;
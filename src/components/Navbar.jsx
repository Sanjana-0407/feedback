import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  return (
    <AppBar position="static" color="default">
      <Toolbar>
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, cursor: "pointer", fontWeight: "bold" }}
          onClick={() => navigate("/")}
        >
          Edu Feedback
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button onClick={() => navigate("/")}>Home</Button>

          <Button variant="contained" color="error" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
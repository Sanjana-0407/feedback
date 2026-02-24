import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  Button,
  Chip,
  Grid,
  Paper,
  Avatar,
  AvatarGroup,
  IconButton,
  Tooltip,
  Divider,
  LinearProgress,
  Rating,
  Badge,
  Stack,
  Container,
  Menu,
  MenuItem,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Drawer,
  List as NotificationList,
  ListItemButton,
  ListItemAvatar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";

import {
  Feedback,
  People,
  Star,
  TrendingUp,
  TrendingDown,
  MoreVert,
  Add,
  Delete,
  Visibility,
  Edit,
  NotificationsActive,
  ArrowUpward,
  ArrowDownward,
  Assignment,
  CloudDownload,
  ChevronRight,
  Quiz,
  RadioButtonChecked,
  TextFields,
  Close,
  CheckCircle,
  NewReleases,
} from "@mui/icons-material";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("forms");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);
  const [timeRange, setTimeRange] = useState("week");
  const [notifications, setNotifications] = useState(0);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewForm, setViewForm] = useState(null);

  // Load data only once on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Separate effect for real-time feedback checking only
  useEffect(() => {
    const interval = setInterval(() => {
      checkForNewFeedbacks();
    }, 10000);

    return () => clearInterval(interval);
  }, [feedbacks, forms]);

  const loadData = () => {
    // Load users from localStorage
    const savedUsers = JSON.parse(localStorage.getItem("users") || "[]");
    
    // Load forms from localStorage - ONLY saved forms, no defaults
    const savedForms = JSON.parse(localStorage.getItem("forms") || "[]");
    
    // Load feedbacks from localStorage - ONLY saved feedbacks, no defaults
    const savedFeedbacks = JSON.parse(localStorage.getItem("feedbacks") || "[]");

    // Set users - if empty, use empty array
    setUsers(savedUsers);

    // Set forms - ONLY from localStorage
    setForms(savedForms);

    // Set feedbacks - ONLY from localStorage
    setFeedbacks(savedFeedbacks);

    updateNotifications(savedFeedbacks);
  };

  // FIXED: Remove the forms.length check so notifications show whenever there are new feedbacks
  const updateNotifications = (feedbackData) => {
    // Get feedbacks from last hour
    const oneHourAgo = new Date(Date.now() - 3600000);
    const recent = feedbackData.filter(f => new Date(f.date) > oneHourAgo);
    setNotifications(recent.length);
    
    // Create notification items with form details
    const notificationItems = recent.map(f => {
      const form = forms.find(form => form.id === f.formId) || { title: "Unknown Form", course: "Unknown" };
      return {
        id: f.id || Date.now() + Math.random(),
        formId: f.formId,
        formTitle: form.title,
        course: form.course,
        rating: f.rating,
        comment: f.comment,
        time: new Date(f.date).toLocaleTimeString(),
        read: false,
      };
    });
    setRecentNotifications(notificationItems);
  };

  const checkForNewFeedbacks = () => {
    const currentFeedbacks = JSON.parse(localStorage.getItem("feedbacks") || "[]");
    
    if (currentFeedbacks.length > feedbacks.length) {
      setFeedbacks(currentFeedbacks);
      
      const updatedForms = forms.map(form => {
        const formResponses = currentFeedbacks.filter(f => f.formId === form.id).length;
        const formFeedbacks = currentFeedbacks.filter(f => f.formId === form.id);
        const avgRating = formFeedbacks.length > 0
          ? (formFeedbacks.reduce((sum, f) => sum + f.rating, 0) / formFeedbacks.length).toFixed(1)
          : 0;
        
        return { 
          ...form, 
          responses: formResponses,
          avgRating: parseFloat(avgRating) 
        };
      });
      
      setForms(updatedForms);
      localStorage.setItem("forms", JSON.stringify(updatedForms));
      
      // Update notifications with the new feedbacks
      updateNotifications(currentFeedbacks);
    }
  };

  const handleNotificationClick = () => {
    setNotificationDrawerOpen(true);
    // Mark all as read when clicked
    setRecentNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setNotifications(0);
    
    // Also store in localStorage that notifications have been read
    localStorage.setItem("lastNotificationRead", Date.now().toString());
  };

  const handleNotificationItemClick = (formId) => {
    const form = forms.find(f => f.id === formId);
    if (form) {
      setViewForm(form);
      setViewDialogOpen(true);
    }
    setNotificationDrawerOpen(false);
  };

  // Calculate real-time statistics
  const totalForms = forms.length;
  const totalFeedbacks = feedbacks.length;
  const totalUsers = users.filter(u => u.role === 'student').length;
  const formsWithResponses = forms.filter((f) => f.responses > 0).length;
  
  const avgRating = feedbacks.length > 0
    ? (feedbacks.reduce((acc, f) => acc + (f.rating || 0), 0) / feedbacks.length).toFixed(1)
    : "0";

  const responseRate = totalForms > 0 
    ? ((totalFeedbacks / (totalForms * 10)) * 100).toFixed(1) 
    : "0";

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const newUsersThisWeek = users.filter(u => new Date(u.registered) > oneWeekAgo).length;

  // Instructor data
  const instructorStats = {};
  forms.forEach((form) => {
    const formFeedbacks = feedbacks.filter(f => f.formId === form.id);
    if (!instructorStats[form.instructor]) {
      instructorStats[form.instructor] = {
        total: 0,
        sum: 0,
        responses: 0
      };
    }
    instructorStats[form.instructor].responses += formFeedbacks.length;
    formFeedbacks.forEach(f => {
      instructorStats[form.instructor].sum += f.rating || 0;
      instructorStats[form.instructor].total += 1;
    });
  });

  const instructorData = Object.keys(instructorStats).map((name) => ({
    name: name.split(" ")[0],
    fullName: name,
    avg: instructorStats[name].total > 0 
      ? (instructorStats[name].sum / instructorStats[name].total).toFixed(1)
      : "0",
    responses: instructorStats[name].responses,
  }));

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: feedbacks.filter((f) => Math.floor(f.rating) === rating).length,
  }));

  const getTrendData = () => {
    const days = timeRange === "week" ? 7 : timeRange === "month" ? 30 : 90;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const count = feedbacks.filter(f => {
        const feedbackDate = new Date(f.date);
        return feedbackDate.toDateString() === date.toDateString();
      }).length;
      data.push({ date: dateStr, count });
    }
    return data;
  };

  const trendData = getTrendData();

  const courseData = forms.map((form) => {
    const formFeedbacks = feedbacks.filter(f => f.formId === form.id);
    const avgRating = formFeedbacks.length > 0
      ? (formFeedbacks.reduce((sum, f) => sum + f.rating, 0) / formFeedbacks.length).toFixed(1)
      : "0";
    
    // Determine status based on responses
    const hasResponses = formFeedbacks.length > 0;
    
    return {
      name: form.course,
      code: form.course.substring(0, 3).toUpperCase(),
      total: formFeedbacks.length,
      avg: parseFloat(avgRating),
      instructors: [form.instructor],
      trend: formFeedbacks.length > 0 ? Math.floor(Math.random() * 20) - 5 : 0,
      hasResponses: hasResponses,
      status: hasResponses ? "active" : "pending",
    };
  });

  const topInstructor = instructorData.length > 0 
    ? instructorData.reduce((max, inst) => parseFloat(inst.avg) > parseFloat(max.avg) ? inst : max, instructorData[0])
    : null;
  
  const lowInstructor = instructorData.length > 0
    ? instructorData.reduce((min, inst) => parseFloat(inst.avg) < parseFloat(min.avg) ? inst : min, instructorData[0])
    : null;

  const COLORS = ["#667eea", "#764ba2", "#f093fb", "#f5576c", "#4facfe"];

  const handleMenuOpen = (event, form) => {
    setAnchorEl(event.currentTarget);
    setSelectedForm(form);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedForm(null);
  };

  const handleDeleteForm = (formId) => {
    const updated = forms.filter((f) => f.id !== formId);
    localStorage.setItem("forms", JSON.stringify(updated));
    setForms(updated);
    handleMenuClose();
  };

  const handleViewForm = (form) => {
    setViewForm(form);
    setViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setViewForm(null);
  };

  const handleDownloadReport = () => {
    // Create report data
    const reportData = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalForms,
        totalFeedbacks,
        totalUsers,
        formsWithResponses,
        avgRating,
        responseRate,
      },
      forms: forms.map(form => ({
        id: form.id,
        title: form.title,
        course: form.course,
        instructor: form.instructor,
        responses: form.responses,
        avgRating: form.avgRating,
        questions: form.questions?.length || 0,
      })),
      recentFeedbacks: feedbacks.slice(-10).map(f => ({
        ...f,
        date: new Date(f.date).toLocaleDateString(),
      })),
    };

    // Convert to JSON and download
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `feedback-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getQuestionIcon = (type) => {
    switch(type) {
      case 'rating':
        return <Star sx={{ color: '#f5b342' }} />;
      case 'text':
        return <TextFields sx={{ color: '#667eea' }} />;
      default:
        return <Quiz sx={{ color: '#764ba2' }} />;
    }
  };

  return (
    <Box sx={{ 
      minHeight: "100vh", 
      bgcolor: "#0B1E33", // Navy blue background
    }}>
      {/* Navbar with fixed positioning - CHANGED BACKGROUND COLOR TO BLUE */}
      <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1300, bgcolor: "#1E3A8A" }}>
        <Navbar />
      </Box>
      
      {/* Spacer for fixed navbar */}
      <Box sx={{ height: '64px' }} />

      {/* Fixed Admin Dashboard Header */}
      <Paper
        sx={{
          position: 'fixed',
          top: '64px',
          left: 0,
          right: 0,
          zIndex: 1200,
          p: 3,
          background: "#0A1A2F", // Darker navy
          color: "white",
          borderRadius: 0,
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Admin Dashboard
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Manage feedback forms and analyze student responses
              </Typography>
            </Box>
            <Badge badgeContent={notifications} color="error">
              <IconButton 
                sx={{ color: "white" }}
                onClick={handleNotificationClick}
              >
                <NotificationsActive />
              </IconButton>
            </Badge>
          </Box>

          {/* Tabs */}
          <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
            <Button
              variant={activeTab === "forms" ? "contained" : "text"}
              onClick={() => setActiveTab("forms")}
              sx={{
                color: activeTab === "forms" ? "white" : "rgba(255,255,255,0.8)",
                bgcolor: activeTab === "forms" ? "rgba(255,255,255,0.2)" : "transparent",
              }}
            >
              📄 Feedback Forms
            </Button>
            <Button
              variant="text"
              onClick={() => navigate("/create-feedback")}
              sx={{ color: "rgba(255,255,255,0.8)" }}
            >
              ➕ Create Form
            </Button>
            <Button
              variant={activeTab === "analytics" ? "contained" : "text"}
              onClick={() => setActiveTab("analytics")}
              sx={{
                color: activeTab === "analytics" ? "white" : "rgba(255,255,255,0.8)",
                bgcolor: activeTab === "analytics" ? "rgba(255,255,255,0.2)" : "transparent",
              }}
            >
              📊 Analytics
            </Button>
          </Box>
        </Container>
      </Paper>

      {/* Spacer for fixed admin header */}
      <Box sx={{ height: '160px' }} />

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, bgcolor: "#9fc9e1" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Forms
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: "#0B1E33" }}>
                    {totalForms}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "#163948" }}>
                  <Assignment />
                </Avatar>
              </Box>
              <LinearProgress
                variant="determinate"
                value={totalForms > 0 ? (formsWithResponses / totalForms) * 100 : 0}
                sx={{ mt: 2, height: 6, borderRadius: 3 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                {formsWithResponses} forms with responses
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, bgcolor: "#739fbc" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Feedbacks
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: "#0B1E33" }}>
                    {totalFeedbacks}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "#f093fb" }}>
                  <Feedback />
                </Avatar>
              </Box>
              <Typography variant="caption" color="success.main" sx={{ mt: 1, display: "block" }}>
                <ArrowUpward sx={{ fontSize: 16, verticalAlign: "middle" }} /> Response Rate: {responseRate}%
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, bgcolor: "#7694b5" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Average Rating
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: "#0B1E33" }}>
                    {avgRating}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "#4facfe" }}>
                  <Star />
                </Avatar>
              </Box>
              <Rating value={parseFloat(avgRating)} precision={0.5} readOnly size="small" sx={{ mt: 1 }} />
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, bgcolor: "#7c9dbe" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Students
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: "#0B1E33" }}>
                    {totalUsers}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "#43e97b" }}>
                  <People />
                </Avatar>
              </Box>
              <Typography variant="caption" color="success.main" sx={{ mt: 1, display: "block" }}>
                <ArrowUpward sx={{ fontSize: 16, verticalAlign: "middle" }} /> +{newUsersThisWeek} new this week
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Forms Tab */}
        {activeTab === "forms" && (
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
              <Typography variant="h5" fontWeight="bold" sx={{ color: "#62a2af" }}>
                Feedback Forms
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate("/create-feedback")}
                  sx={{ background: "#0A1A2F", color: "white" }}
                >
                  Create Form
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CloudDownload />}
                  onClick={handleDownloadReport}
                  sx={{ 
                    borderColor: "#0d0303",
                    color: "#FFFFFF",
                    '&:hover': {
                      borderColor: "#FFFFFF",
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    }
                  }}
                >
                  Download Report
                </Button>
              </Box>
            </Box>

            {forms.length === 0 ? (
              <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, bgcolor: "#8aa1d6" }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Feedback Forms Yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Create your first feedback form to get started
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate("/create-feedback")}
                  sx={{ background: "#0A1A2F", color: "white" }}
                >
                  Create Form
                </Button>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {forms.map((form) => {
                  // Check if form has responses - this determines the status
                  const hasResponses = form.responses > 0;
                  
                  return (
                    <Grid item xs={12} md={6} lg={4} key={form.id}>
                      <Card sx={{ 
                        p: 3, 
                        borderRadius: 3,
                        bgcolor: "#296f9d",
                        border: hasResponses ? '2px solid #191815' : '2px solid #ff9800',
                        position: 'relative',
                        overflow: 'visible',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                        },
                      }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                          <Box>
                            <Typography variant="h6" fontWeight="bold" sx={{ color: "#0B1E33" }}>
                              {form.title}
                            </Typography>
                            
                            {/* Status Chip - Shows active only if responses > 0 */}
                            {hasResponses ? (
                              <Chip
                                label="active"
                                color="success"
                                size="small"
                                sx={{ mt: 1 }}
                              />
                            ) : (
                              <Chip
                                label="pending"
                                color="warning"
                                size="small"
                                sx={{ mt: 1 }}
                              />
                            )}
                          </Box>
                          <IconButton onClick={(e) => handleMenuOpen(e, form)}>
                            <MoreVert />
                          </IconButton>
                        </Box>

                        <Typography color="text.secondary" sx={{ mb: 2 }}>
                          {form.description}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, color: "#0B1E33" }}>
                            <Box component="span" sx={{ minWidth: 24 }}>📚</Box> {form.course}
                          </Typography>
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, color: "#0B1E33" }}>
                            <Box component="span" sx={{ minWidth: 24 }}>👨‍🏫</Box> {form.instructor}
                          </Typography>
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: "#0B1E33" }}>
                            <Box component="span" sx={{ minWidth: 24 }}>📅</Box> {form.date}
                          </Typography>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Box>
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                color: hasResponses ? "#000000" : "#9e9e9e"
                              }}
                            >
                              {form.responses}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#080b10" }}>
                              {hasResponses ? "Responses Received" : "No Responses Yet"}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Tooltip title="View">
                              <IconButton size="small" onClick={() => handleViewForm(form)}>
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <IconButton 
                                size="small" 
                                onClick={() => {
                                  localStorage.setItem("editingForm", JSON.stringify(form));
                                  navigate("/create-feedback", { 
                                    state: { 
                                      editing: true, 
                                      formData: form,
                                      formId: form.id 
                                    } 
                                  });
                                }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <Box>
            {/* Insights Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3, background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", color: "white" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
                      <TrendingUp />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Top Performer
                      </Typography>
                      <Typography variant="h6">{topInstructor?.fullName || "N/A"}</Typography>
                      <Rating value={parseFloat(topInstructor?.avg) || 0} readOnly size="small" sx={{ color: "white" }} />
                    </Box>
                  </Box>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3, background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", color: "white" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
                      <TrendingDown />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Needs Improvement
                      </Typography>
                      <Typography variant="h6">{lowInstructor?.fullName || "N/A"}</Typography>
                      <Rating value={parseFloat(lowInstructor?.avg) || 0} readOnly size="small" sx={{ color: "white" }} />
                    </Box>
                  </Box>
                </Card>
              </Grid>
            </Grid>

            {/* Charts */}
            <Grid container spacing={3}>
              {/* Bar Chart */}
              <Grid item xs={12} lg={6}>
                <Card sx={{ p: 3, bgcolor: "#7baebb" }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: "#0B1E33" }} gutterBottom>
                    Instructor Performance
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Average ratings by instructor (based on {totalFeedbacks} feedbacks)
                  </Typography>
                  <Box sx={{ width: "100%", height: 300 }}>
                    <ResponsiveContainer>
                      <BarChart data={instructorData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 5]} />
                        <RechartsTooltip />
                        <Bar dataKey="avg" fill="#199251" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Card>
              </Grid>

              {/* Pie Chart */}
              <Grid item xs={12} lg={6}>
                <Card sx={{ p: 3, bgcolor: "#a24545" }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: "#0B1E33" }} gutterBottom>
                    Rating Distribution
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Breakdown of {totalFeedbacks} ratings
                  </Typography>
                  <Box sx={{ width: "100%", height: 300 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={ratingDistribution.filter(r => r.count > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="count"
                          label={({ rating, percent }) => `${rating}★ (${(percent * 100).toFixed(0)}%)`}
                        >
                          {ratingDistribution.filter(r => r.count > 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Card>
              </Grid>

              {/* Trend Chart */}
              <Grid item xs={12}>
                <Card sx={{ p: 3, bgcolor: "#dd9e9e" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" sx={{ color: "#0B1E33" }}>
                        Response Trend
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Daily feedback submissions (last {timeRange})
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      {["week", "month", "quarter"].map((range) => (
                        <Button
                          key={range}
                          size="small"
                          variant={timeRange === range ? "contained" : "outlined"}
                          onClick={() => setTimeRange(range)}
                          sx={{
                            color: timeRange === range ? 'white' : "#0B1E33",
                            borderColor: "#0B1E33",
                            bgcolor: timeRange === range ? "#0B1E33" : 'transparent',
                          }}
                        >
                          {range}
                        </Button>
                      ))}
                    </Box>
                  </Box>
                  <Box sx={{ width: "100%", height: 350 }}>
                    <ResponsiveContainer>
                      <AreaChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <RechartsTooltip />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke="#667eea"
                          fill="#667eea"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </Card>
              </Grid>

              {/* Course Performance Table */}
              <Grid item xs={12}>
                <Card sx={{ p: 3, bgcolor: "#15916e" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" sx={{ color: "#0B1E33" }}>
                        Course Performance
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Detailed analytics by course
                      </Typography>
                    </Box>
                    <Button 
                      variant="outlined" 
                      startIcon={<CloudDownload />}
                      onClick={handleDownloadReport}
                      sx={{ borderColor: "#0B1E33", color: "#0B1E33" }}
                    >
                      Export
                    </Button>
                  </Box>

                  <Box sx={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: "#f5f5f5" }}>
                          <th style={{ padding: "12px", textAlign: "left", color: "#0B1E33" }}>Course</th>
                          <th style={{ padding: "12px", textAlign: "left", color: "#0B1E33" }}>Instructors</th>
                          <th style={{ padding: "12px", textAlign: "right", color: "#0B1E33" }}>Responses</th>
                          <th style={{ padding: "12px", textAlign: "right", color: "#0B1E33" }}>Avg Rating</th>
                          <th style={{ padding: "12px", textAlign: "right", color: "#0B1E33" }}>Performance</th>
                          <th style={{ padding: "12px", textAlign: "center", color: "#0B1E33" }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courseData.map((course, index) => (
                          <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
                            <td style={{ padding: "12px" }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                <Avatar sx={{ bgcolor: "#667eea", width: 32, height: 32 }}>
                                  {course.code.charAt(0)}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight="bold" sx={{ color: "#0B1E33" }}>
                                    {course.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {course.code}
                                  </Typography>
                                </Box>
                              </Box>
                            </td>
                            <td style={{ padding: "12px" }}>
                              <AvatarGroup max={3}>
                                {course.instructors.map((inst, i) => (
                                  <Avatar key={i} sx={{ width: 24, height: 24 }}>
                                    {inst.charAt(0)}
                                  </Avatar>
                                ))}
                              </AvatarGroup>
                            </td>
                            <td style={{ padding: "12px", textAlign: "right", color: "#0B1E33" }}>{course.total}</td>
                            <td style={{ padding: "12px", textAlign: "right" }}>
                              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1 }}>
                                <Typography sx={{ color: "#0B1E33" }}>{course.avg.toFixed(1)}</Typography>
                                <Star sx={{ fontSize: 16, color: "#f5b342" }} />
                              </Box>
                            </td>
                            <td style={{ padding: "12px", textAlign: "right" }}>
                              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={(course.avg / 5) * 100}
                                  sx={{ width: 80, height: 6, borderRadius: 3 }}
                                />
                                <Typography variant="caption" sx={{ color: "#0B1E33" }}>
                                  {((course.avg / 5) * 100).toFixed(0)}%
                                </Typography>
                              </Box>
                            </td>
                            <td style={{ padding: "12px", textAlign: "center" }}>
                              {course.hasResponses ? (
                                <Chip
                                  label="Active"
                                  size="small"
                                  color="success"
                                  icon={<CheckCircle sx={{ fontSize: 14 }} />}
                                  sx={{ height: 24 }}
                                />
                              ) : (
                                <Chip
                                  label="Pending"
                                  size="small"
                                  variant="outlined"
                                  color="warning"
                                  sx={{ height: 24 }}
                                />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </Container>

      {/* Notification Drawer */}
      <Drawer
        anchor="right"
        open={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 350,
            p: 2,
            borderTopLeftRadius: 16,
            borderBottomLeftRadius: 16,
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ color: "#0B1E33" }}>
            Recent Notifications
          </Typography>
          <IconButton onClick={() => setNotificationDrawerOpen(false)}>
            <Close />
          </IconButton>
        </Box>
        <Divider />
        
        {recentNotifications.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">No new notifications</Typography>
          </Box>
        ) : (
          <NotificationList>
            {recentNotifications.map((notification) => (
              <ListItemButton
                key={notification.id}
                onClick={() => handleNotificationItemClick(notification.formId)}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  bgcolor: notification.read ? 'transparent' : '#e8f0fe',
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: notification.read ? '#ccc' : '#667eea' }}>
                    <NewReleases />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" sx={{ color: "#0B1E33" }}>
                      {notification.formTitle}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="caption" display="block">
                        Rating: {notification.rating} ⭐
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {notification.time}
                      </Typography>
                    </>
                  }
                />
              </ListItemButton>
            ))}
          </NotificationList>
        )}
      </Drawer>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{
          position: "fixed",
          bottom: 32,
          right: 32,
          background: "#3e689e",
          zIndex: 1300,
          '&:hover': {
            background: "#1A2F45",
          },
        }}
        onClick={() => navigate("/create-feedback")}
      >
        <Add />
      </Fab>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <MenuItem onClick={() => { handleViewForm(selectedForm); handleMenuClose(); }}>
          <Visibility fontSize="small" sx={{ mr: 1 }} /> View
        </MenuItem>
        <MenuItem onClick={() => { 
          if (selectedForm) {
            localStorage.setItem("editingForm", JSON.stringify(selectedForm));
            navigate("/create-feedback", { 
              state: { 
                editing: true, 
                formData: selectedForm,
                formId: selectedForm.id 
              } 
            });
          }
          handleMenuClose(); 
        }}>
          <Edit fontSize="small" sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleDeleteForm(selectedForm?.id)} sx={{ color: "error.main" }}>
          <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* View Form Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={handleCloseViewDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2,
          }
        }}
      >
        {viewForm && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight="bold" sx={{ color: "#4d8bd3" }}>
                  {viewForm.title}
                </Typography>
                {viewForm.responses > 0 ? (
                  <Chip
                    label="active"
                    color="success"
                    size="small"
                  />
                ) : (
                  <Chip
                    label="pending"
                    color="warning"
                    size="small"
                  />
                )}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                {viewForm.description}
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Course: <strong style={{ color: "#0B1E33" }}>{viewForm.course}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Instructor: <strong style={{ color: "#0B1E33" }}>{viewForm.instructor}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Created: <strong style={{ color: "#0B1E33" }}>{new Date(viewForm.date).toLocaleDateString()}</strong>
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom sx={{ mt: 2, color: "#0B1E33" }}>
                Questions ({viewForm.questions?.length || 0})
              </Typography>
              
              <List>
                {viewForm.questions?.map((question, index) => (
                  <ListItem key={question.id} sx={{ px: 0 }}>
                    <ListItemIcon>
                      {getQuestionIcon(question.type)}
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Typography variant="body1" sx={{ color: "#0B1E33" }}>
                          {index + 1}. {question.text}
                        </Typography>
                      }
                      secondary={`Type: ${question.type.charAt(0).toUpperCase() + question.type.slice(1)}`}
                    />
                  </ListItem>
                ))}
              </List>

              <Box sx={{ mt: 3, display: 'flex', gap: 4 }}>
                <Box>
                  <Typography variant="h6" sx={{ color: "#667eea" }}>
                    {viewForm.responses}
                  </Typography>
                  <Typography variant="caption">Total Responses</Typography>
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ color: "#667eea" }}>
                    {viewForm.avgRating}
                  </Typography>
                  <Typography variant="caption">Average Rating</Typography>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseViewDialog} variant="outlined">
                Close
              </Button>
              <Button 
                variant="contained" 
                onClick={() => {
                  handleCloseViewDialog();
                }}
                sx={{ background: "#0A1A2F", color: "white" }}
              >
                View Responses
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
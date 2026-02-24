import React, { useState } from "react";
import {
  Box,
  Card,
  Typography,
  TextField,
  Grid,
  Button,
  Divider,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const CreateForm = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    course: "",
    instructor: "",
    description: "",
    questions: [],
  });

  // ➕ Add Question
  const addQuestion = (type) => {
    const newQuestion = {
      id: Date.now(),
      type,
      question: "",
    };

    setForm({
      ...form,
      questions: [...form.questions, newQuestion],
    });
  };

  // ✅ CREATE FORM
  const handleSubmit = () => {
    if (!form.title || !form.course || !form.instructor) {
      alert("Please fill all required fields");
      return;
    }

    const existingForms = JSON.parse(localStorage.getItem("forms") || "[]");

    const newForm = {
      ...form,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      responses: [],
      isActive: true,
    };

    localStorage.setItem("forms", JSON.stringify([newForm, ...existingForms]));

    // ✅ FIXED ROUTE
    navigate("/admin");
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <Card
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 900,
          borderRadius: 4,
          boxShadow: 3,
        }}
      >
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
          Create Feedback Form
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Form Title *"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Course Name *"
              value={form.course}
              onChange={(e) =>
                setForm({ ...form, course: e.target.value })
              }
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Instructor Name *"
              value={form.instructor}
              onChange={(e) =>
                setForm({ ...form, instructor: e.target.value })
              }
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* QUESTIONS */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h6">Questions</Typography>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Chip label="+ Rating" onClick={() => addQuestion("rating")} />
            <Chip label="+ MCQ" onClick={() => addQuestion("mcq")} />
            <Chip label="+ Text" onClick={() => addQuestion("text")} />
          </Box>
        </Box>

        <Box sx={{ border: "2px dashed #ddd", p: 3, borderRadius: 2 }}>
          {form.questions.length === 0 ? (
            <Typography>No questions added yet</Typography>
          ) : (
            form.questions.map((q, index) => (
              <TextField
                key={q.id}
                fullWidth
                sx={{ mb: 2 }}
                label={`Question ${index + 1}`}
                value={q.question}
                onChange={(e) => {
                  const updated = [...form.questions];
                  updated[index].question = e.target.value;
                  setForm({ ...form, questions: updated });
                }}
              />
            ))
          )}
        </Box>

        <Box sx={{ mt: 4, textAlign: "right" }}>
          <Button variant="contained" onClick={handleSubmit}>
            Create Form
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

export default CreateForm;
// context/FeedbackContext.jsx
import React, { createContext, useState, useContext } from 'react';

const FeedbackContext = createContext();

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
};

export const FeedbackProvider = ({ children }) => {
  const [forms, setForms] = useState([
    {
      id: 1,
      title: 'Mid-Semester Course Evaluation',
      course: 'Introduction to Computer Science',
      instructor: 'Dr. Sarah Johnson',
      description: 'Evaluate the course structure and teaching methodology',
      questions: [],
      responses: 3,
      status: 'active',
      createdAt: '2024-02-15'
    },
    {
      id: 2,
      title: 'Instructor Performance Feedback',
      course: 'Data Structures and Algorithms',
      instructor: 'Prof. Michael Chen',
      description: 'Provide feedback on teaching effectiveness',
      questions: [],
      responses: 2,
      status: 'active',
      createdAt: '2024-02-16'
    }
  ]);

  const [responses, setResponses] = useState([
    { formId: 1, rating: 4.5, date: '2024-02-15' },
    { formId: 1, rating: 4.0, date: '2024-02-16' },
    { formId: 1, rating: 4.2, date: '2024-02-17' },
    { formId: 2, rating: 3.8, date: '2024-02-18' },
    { formId: 2, rating: 4.1, date: '2024-02-19' }
  ]);

  const createForm = (newForm) => {
    setForms([...forms, { 
      ...newForm, 
      id: forms.length + 1, 
      responses: 0, 
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0]
    }]);
  };

  const updateForm = (id, updatedForm) => {
    setForms(forms.map(form => form.id === id ? { ...form, ...updatedForm } : form));
  };

  const deleteForm = (id) => {
    setForms(forms.filter(form => form.id !== id));
  };

  const toggleFormStatus = (id) => {
    setForms(forms.map(form => 
      form.id === id 
        ? { ...form, status: form.status === 'active' ? 'inactive' : 'active' }
        : form
    ));
  };

  const addResponse = (response) => {
    setResponses([...responses, { ...response, id: responses.length + 1 }]);
    // Update form response count
    setForms(forms.map(form => 
      form.id === response.formId 
        ? { ...form, responses: form.responses + 1 }
        : form
    ));
  };

  const value = {
    forms,
    responses,
    createForm,
    updateForm,
    deleteForm,
    toggleFormStatus,
    addResponse
  };

  return (
    <FeedbackContext.Provider value={value}>
      {children}
    </FeedbackContext.Provider>
  );
};
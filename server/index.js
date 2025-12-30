const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const User = require('./models/User');
const Resume = require('./models/Resume');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect DB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// AI Setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Routes (Simplified for example)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // Hash password here in real app
    const user = await User.create({ name, email, passwordHash: password });
    res.json(user);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.passwordHash !== password) throw new Error('Invalid credentials');
    res.json(user);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get('/api/resumes', async (req, res) => {
  // Add middleware to get userId from token
  const userId = req.headers['user-id']; 
  const resumes = await Resume.find({ userId });
  res.json(resumes);
});

app.post('/api/resumes', async (req, res) => {
  const userId = req.headers['user-id'];
  const resume = await Resume.create({ ...req.body, userId });
  res.json(resume);
});

// AI Endpoint Example
app.post('/api/ai/generate-summary', async (req, res) => {
  const { jobTitle, skills } = req.body;
  // Updated to latest stable model
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent(`Write a resume summary for ${jobTitle} with skills: ${skills}`);
  res.json({ text: result.response.text() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ตัวอย่าง route หลัก
app.get('/', (req, res) => {
  res.send('Intern Prep IT API');
});

// นำเข้า routes อื่นๆ
const studentRoutes = require('./routes/student/student');
app.use('/api/register/student', studentRoutes);

// เพิ่ม routes อื่นๆ ตามที่มีในโปรเจกต์ของคุณ

module.exports = app;
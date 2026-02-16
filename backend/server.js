require('dotenv').config();

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const reportSummaryRouter = require('./routes/teacher/reportSummary');
const app = require('./app');
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: '*' } });
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

app.use(express.json());

const teacherRouter = require('./routes/teacher/teacher');
// ให้ /api/register/teacher POST ชี้ไปที่ /register ใน teacherRouter
app.use('/api/register/teacher', teacherRouter);
app.use('/api/teacher/report-summary', reportSummaryRouter);
app.use('/api/summary', require('./routes/teacher/teacher'));

app.use(session({
  secret: 'internprep_secret_key', // เปลี่ยนเป็น key ที่ปลอดภัย
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // ถ้าใช้ https ให้เป็น true
}));

// Example route
app.get('/', (req, res) => {
  res.send('Intern Prep IT Backend Running');
});

const registerRouter = require('./routes/register');
const agencyRouter = require('./routes/agency/agency');
app.use('/api/register', registerRouter);
app.use('/api/register/agency', agencyRouter);
app.use('/api/agency', agencyRouter);
const loginRouter = require('./routes/login');
app.use('/api', loginRouter);

// Serve static files from uploads folder
app.use('/api/upload-image', require('./routes/uploadImage'));
app.use('/uploads', express.static('uploads'));
const studentReportRouter = require('./routes/studentReport');
app.use('/api', studentReportRouter);

// Student Work Log API
app.use('/api/student-work-log', require('./routes/student/studentWorkLog'));
app.use('/api/teacher/student-work-logs', require('./routes/student/studentWorkLog'));
app.use('/api/student-report', require('./routes/student/studentReport'));
const studentRouter = require('./routes/student/student');
app.use('/api/student', studentRouter);

// TODO: Import and use routes for auth, student, teacher, agency

// socket.io connection
app.set('io', io);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
});

http.listen(5000, () => {
  console.log('Server running on port 5000');
});

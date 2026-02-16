const express = require('express');
const router = express.Router();
const db = require('../models/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const reportDir = path.join(__dirname, '../../uploads/reports');
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, reportDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${req.body.student_id}_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

router.post('/student-report', upload.single('report_file'), async (req, res) => {
  try {
    const { student_id, student_name } = req.body;
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const filePath = `/uploads/reports/${req.file.filename}`;
    await db.query(
      'INSERT INTO tb_student_report (student_id, student_name, report_file, report_file_url, created_at) VALUES (?, ?, ?, ?, NOW())',
      [student_id, student_name, req.file.originalname, filePath]
    );
    res.json({ message: 'อัปโหลดสำเร็จ', report_file_url: filePath });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed', details: err.message });
  }
});

router.get('/student-report', async (req, res) => {
  const { student_id } = req.query;
  try {
    const [rows] = await db.query(
      'SELECT * FROM tb_student_report WHERE student_id = ? ORDER BY created_at DESC',
      [student_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด', details: err.message });
  }
});

router.get('/student-report/all', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM tb_student_report ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด', details: err.message });
  }
});

module.exports = router;
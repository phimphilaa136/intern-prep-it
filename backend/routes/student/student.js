const express = require('express');
const router = express.Router();
const db = require('../../models/db');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profile/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });
const storageReport = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/reports/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const uploadReport = multer({ storage: storageReport });

// เพิ่มบรรทัดนี้ในไฟล์ backend/app.js หรือ index.js

// อัปเดตสถานะการสมัครและสถานะการฝึกงาน
router.post('/update-enrollment-status', async (req, res) => {
  const { request_id, status, training_status } = req.body;
  if (!request_id) return res.status(400).json({ error: 'Missing request_id' });
  try {
    let query = '';
    let params = [];
    if (status) {
      query = 'UPDATE tb_internship_enrollment SET status = ? WHERE request_id = ?';
      params = [status, request_id];
    } else if (training_status) {
      query = 'UPDATE tb_internship_enrollment SET training_status = ? WHERE request_id = ?';
      params = [training_status, request_id];
    } else {
      return res.status(400).json({ error: 'Missing status or training_status' });
    }
  await db.query(query, params);
  // broadcast event internship_update
  const io = req.app.get('io');
  if (io) io.emit('internship_update', { request_id, status, training_status });
  res.json({ message: 'Update successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ดึงข้อมูลบันทึกการปฏิบัติงานของนักศึกษาทั้งหมด
// แก้ไขบันทึกการปฏิบัติงานของนักศึกษา
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { work_report, checkin_time, checkout_time, hours_worked, problem, status, agency_name } = req.body;
    // สร้าง query สำหรับอัปเดตข้อมูล
    const fields = [];
    const values = [];
    if (work_report !== undefined) { fields.push('work_report = ?'); values.push(work_report); }
    if (checkin_time !== undefined) { fields.push('checkin_time = ?'); values.push(checkin_time); }
    if (checkout_time !== undefined) { fields.push('checkout_time = ?'); values.push(checkout_time); }
    if (hours_worked !== undefined) { fields.push('hours_worked = ?'); values.push(hours_worked); }
    if (problem !== undefined) { fields.push('problem = ?'); values.push(problem); }
    if (status !== undefined) { fields.push('status = ?'); values.push(status); }
    if (agency_name !== undefined) { fields.push('agency_name = ?'); values.push(agency_name); }
    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
    values.push(id);
    const sql = `UPDATE tb_student_work_log SET ${fields.join(', ')} WHERE id = ?`;
    const [result] = await db.query(sql, values);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Work log not found' });
    res.json({ message: 'Work log updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/student-work-log', async (req, res) => {
  try {
    const [rows] = await require('../../models/db').query('SELECT * FROM tb_student_work_log');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Student Routes
// ====================================

// ดึงรายชื่อหน่วยงานที่อาจารย์ฝ่ายสหกิจยืนยันแล้ว (tb_confirmed_agencies)
router.get('/available-agencies', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT c.open_id, c.agency_name, c.capacity, c.address, c.phone_number,
        (
          SELECT COUNT(*) FROM tb_internship_enrollment e WHERE e.open_id = c.open_id
        ) AS selected_students
      FROM tb_confirmed_agencies c
      WHERE c.capacity > 0
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ดึงข้อมูลจาก tb_confirmed_agencies สำหรับ dropdown เลือกหน่วยงาน (เพิ่ม selected_students)
router.get('/confirmed-agencies', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT c.open_id, c.agency_name, c.capacity, c.address, c.phone_number,
        (
          SELECT COUNT(*) FROM tb_internship_enrollment e WHERE e.open_id = c.open_id
        ) AS selected_students
      FROM tb_confirmed_agencies c
      WHERE c.capacity > 0
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register Student
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const {
      student_id, student_gender, student_name, student_fac, student_major,
      student_class, student_year, student_semester,
      student_email, student_tel, student_address, student_advisor,
      student_sick, password
    } = req.body;
    // ใช้ MD5 hash แทน bcrypt
    const hash = crypto.createHash('md5').update(password).digest('hex');
    const image_path = req.file ? '/uploads/' + req.file.filename : '';
    await db.query(
      `INSERT INTO tb_student 
        (student_id, student_gender, student_name, student_fac, student_major, student_class, student_year, student_semester, student_email, student_tel, student_address, student_advisor, student_sick, image_path, password)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [student_id, student_gender, student_name, student_fac, student_major, student_class, student_year, student_semester, student_email, student_tel, student_address, student_advisor, student_sick, image_path, hash]
    );
    res.status(201).json({ message: 'Student registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ลงทะเบียนขอฝึกงาน
router.post('/internship-enrollment', async (req, res) => {
  try {
  const { student_id, student_name, schedule_day, open_id, agency_name } = req.body;
    const [studentRows] = await db.query('SELECT student_id FROM tb_student WHERE student_id = ?', [student_id]);
    if (studentRows.length === 0) {
      return res.status(400).json({ error: 'student_id ไม่พบในระบบ' });
    }
    const [agencyRows] = await db.query('SELECT open_id FROM tb_confirmed_agencies WHERE open_id = ?', [open_id]);
    if (agencyRows.length === 0) {
      return res.status(400).json({ error: 'open_id หน่วยงานไม่ถูกต้อง' });
    }
    await db.query(
      `INSERT INTO tb_internship_enrollment (student_id, student_name, schedule_day, open_id, agency_name)
       VALUES (?, ?, ?, ?, ?)`,
      [student_id, student_name, schedule_day, open_id, agency_name]
    );
    res.status(201).json({ message: 'Internship enrollment created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ดึงรายการฝึกงานของนักศึกษา
router.get('/internship-requests', async (req, res) => {
  try {
    const { student_id } = req.query;
    let query = 'SELECT request_id, student_id, student_name, open_id, agency_name, schedule_day, status, training_status, created_at, updated_at FROM tb_internship_enrollment';
    const params = [];
    if (student_id) {
      query += ' WHERE student_id = ?';
      params.push(student_id);
    }
    query += ' ORDER BY created_at DESC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ดึงข้อมูลนักศึกษาทั้งหมด
// ดึงข้อมูลนักศึกษาตาม student_id
router.get('/student', async (req, res) => {
  try {
    const { student_id } = req.query;
    if (!student_id) {
      return res.status(400).json({ error: 'student_id is required' });
    }
    const [rows] = await db.query(
      `SELECT student_id, student_gender, student_name, student_fac, student_major, student_class, student_year, student_semester, student_email, student_tel, student_address, student_advisor, student_sick, image_path, created_at, updated_at FROM tb_student WHERE student_id = ?`,
      [student_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// อัปเดตข้อมูลโปรไฟล์นักศึกษา
router.put('/student/:student_id', async (req, res) => {
  try {
    const { student_id } = req.params;
    const {
      student_gender,
      student_name,
      student_fac,
      student_major,
      student_class,
      student_year,
      student_semester,
      student_email,
      student_tel,
      student_address,
      student_advisor,
      student_sick
    } = req.body;
    const [result] = await db.query(
      `UPDATE tb_student SET 
        student_gender = ?,
        student_name = ?,
        student_fac = ?,
        student_major = ?,
        student_class = ?,
        student_year = ?,
        student_semester = ?,
        student_email = ?,
        student_tel = ?,
        student_address = ?,
        student_advisor = ?,
        student_sick = ?,
        updated_at = NOW()
      WHERE student_id = ?`,
      [
        student_gender,
        student_name,
        student_fac,
        student_major,
        student_class,
        student_year,
        student_semester,
        student_email,
        student_tel,
        student_address,
        student_advisor,
        student_sick,
        student_id
      ]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ message: 'Student profile updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// บันทึกการทำงานของนักศึกษา
router.post('/work-log', async (req, res) => {
  try {
    const { student_id, student_name, agency_name, work_date, hours_worked, work_report, time_in, time_out, problem, status } = req.body;
    await db.query(
      `INSERT INTO tb_Student_Work_Log (work_date, student_id, student_name, agency_name, work_report, checkin_time, checkout_time, hours_worked, problem, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [work_date, student_id, student_name, agency_name, work_report, time_in, time_out, hours_worked, problem, status]
    );
    res.status(201).json({ message: 'Work log created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// อัปโหลดรูปภาพ
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    const student_id = req.body.student_id;
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const imagePath = `/uploads/profile/${req.file.filename}`;
    await db.query('UPDATE tb_student SET image_path=? WHERE student_id=?', [imagePath, student_id]);
    res.json({ imagePath });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed', details: err.message });
  }
});

// แจ้งเตือนครบ 96 ชั่วโมง
router.post('/student-work-log/notify-96hours', async (req, res) => {
  const { student_id, student_name, total_hours } = req.body;
  const io = req.app.get('io');
  if (io) {
    io.emit('student_96hours', { student_id, student_name, total_hours });
    console.log('Emit:', student_id, student_name, total_hours); // เพิ่ม log
  }
  res.json({ message: 'แจ้งเตือนครบ 96 ชั่วโมงแล้ว' });
});

router.get('/students-96hours', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT student_id, student_name, SUM(hours_worked) AS total_hours
      FROM tb_student_work_log
      GROUP BY student_id, student_name
      HAVING SUM(hours_worked) >= 96
    `);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  }
});

// ส่งเล่มรายงานนักศึกษา (tb_student_report)
router.post('/student-report', uploadReport.single('report_file'), async (req, res) => {
  try {
    const { student_id, student_name } = req.body;
    const report_file = req.file ? req.file.originalname : '';
    const report_file_url = req.file ? '/uploads/reports/' + req.file.filename : '';
    // เพิ่ม submitted_at เป็นเวลาปัจจุบัน, status เป็นค่า default 'รออนุมัติ'
    await db.query(
      `INSERT INTO tb_student_report 
        (student_id, student_name, report_file, report_file_url, created_at, submitted_at, status)
       VALUES (?, ?, ?, ?, NOW(), NOW(), 'รออนุมัติ')`,
      [student_id, student_name, report_file, report_file_url]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ดึงข้อมูลรายงานของนักศึกษา
router.get('/student-report', async (req, res) => {
  try {
    const { student_id } = req.query;
    let sql = 'SELECT * FROM tb_student_report';
    const params = [];
    if (student_id) {
      sql += ' WHERE student_id = ?';
      params.push(student_id);
    }
    sql += ' ORDER BY created_at DESC';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ดึงข้อมูลการลงทะเบียนขอฝึกงานของนักศึกษา
router.get('/internship-enrollment', async (req, res) => {
  const { student_id } = req.query;
  try {
    const [rows] = await db.query(
      `SELECT 
        request_id,
        student_id,
        student_name,
        schedule_day,
        open_id,
        agency_name,
        status,
        training_status,
        created_at
      FROM tb_internship_enrollment
      WHERE student_id = ?
      ORDER BY created_at DESC`,
      [student_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลการลงทะเบียนขอฝึก', details: err });
  }
});

module.exports = router;

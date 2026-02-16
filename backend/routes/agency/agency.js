const express = require('express');
const router = express.Router();
const db = require('../../models/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');


// ยืนยัน work log ของนักศึกษา (อัปเดต status)
// ยืนยัน work log ของนักศึกษา (อัปเดต status เฉพาะของหน่วยงานที่ล็อกอิน)
router.patch('/student-work-logs/:student_id/:work_date', async (req, res) => {
  const { student_id, work_date } = req.params;
  const username = req.query.username;
  console.log('PATCH /student-work-logs', { student_id, work_date, username });
  if (!username) return res.status(400).json({ error: 'Missing username' });
  try {
    // หา agency_name จาก username
    const [supervisorRows] = await db.query('SELECT agency_name FROM tb_supervisor WHERE username = ?', [username]);
    if (supervisorRows.length === 0) {
      return res.status(404).json({ error: 'ไม่พบหัวหน้าหน่วยงานนี้', username });
    }
    const agency_name = supervisorRows[0].agency_name;
    // log เงื่อนไข query
    console.log('UPDATE tb_student_work_log WHERE', { student_id, work_date, agency_name });
    // อัปเดต status เป็น 'ยืนยันแล้ว' เฉพาะ work log ของนักศึกษานี้ (ไม่เช็ควันที่)
    const [result] = await db.query(
      'UPDATE tb_student_work_log SET status = ? WHERE student_id = ?',
      ['ยืนยันแล้ว', student_id]
    );
    console.log('affectedRows:', result.affectedRows, 'agency_name:', agency_name);
    if (result.affectedRows === 0) {
      // debug: ลอง query เฉพาะ student_id
      const [debugRows] = await db.query(
        'SELECT student_id, work_date, agency_name, status FROM tb_student_work_log WHERE student_id = ?',
        [student_id]
      );
      return res.status(404).json({ error: 'ไม่พบข้อมูล work log ที่ตรงกับรหัสนักศึกษา', student_id, agency_name, debugRows });
    }
    res.json({ message: 'ยืนยันการปฏิบัติงานสำเร็จ (เช็คแค่รหัสนักศึกษา)' });
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการยืนยันการปฏิบัติงาน', details: err });
  }
});

// ดึงผลการประเมินของนักศึกษาทั้งหมดในหน่วยงานนี้ (total_score + comment)
router.get('/student-evaluations', async (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ error: 'Missing username' });
  try {
    // หา agency_name จาก username
    const [supervisorRows] = await db.query('SELECT agency_name FROM tb_supervisor WHERE username = ?', [username]);
    if (supervisorRows.length === 0) {
      return res.status(404).json({ error: 'ไม่พบหัวหน้าหน่วยงานนี้', username });
    }
    const agency_name = supervisorRows[0].agency_name;
    // ดึงผลการประเมินของนักศึกษาทั้งหมดในหน่วยงานนี้ พร้อม evaluated_at และ comment
    const [rows] = await db.query(
      `SELECT a.student_id, s.student_name, a.total_score, a.evaluated_at, a.comment
       FROM tb_agency_evaluation a
       LEFT JOIN tb_student s ON a.student_id = s.student_id
       WHERE a.agency_name = ?`,
      [agency_name]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงผลการประเมิน', details: err });
  }
});

// บันทึกผลการประเมินของหัวหน้างาน
router.post('/save-evaluation', async (req, res) => {
  const {
    student_id,
    supervisor_name,
    agency_name,
    total_score,
    comment,
    score_1,
    score_2,
    score_3,
    score_4,
    score_5,
    score_6,
    score_7,
    score_8,
    score_9,
    score_10
  } = req.body;
  if (!student_id || !supervisor_name || !agency_name || total_score == null) {
    return res.status(400).json({ error: 'ข้อมูลไม่ครบถ้วน' });
  }
  try {
    // ตรวจสอบว่ามีการประเมินแล้วหรือยัง
    const [check] = await db.query(
      'SELECT evaluation_id FROM tb_agency_evaluation WHERE student_id = ? AND supervisor_name = ? AND agency_name = ?',
      [student_id, supervisor_name, agency_name]
    );
    if (check.length > 0) {
      // อัปเดตผลการประเมิน
      await db.query(
        'UPDATE tb_agency_evaluation SET score_1 = ?, score_2 = ?, score_3 = ?, score_4 = ?, score_5 = ?, score_6 = ?, score_7 = ?, score_8 = ?, score_9 = ?, score_10 = ?, total_score = ?, comment = ?, evaluated_at = NOW() WHERE evaluation_id = ?',
        [score_1, score_2, score_3, score_4, score_5, score_6, score_7, score_8, score_9, score_10, total_score, comment, check[0].evaluation_id]
      );
    } else {
      // เพิ่มผลการประเมินใหม่
      await db.query(
        'INSERT INTO tb_agency_evaluation (student_id, supervisor_name, agency_name, score_1, score_2, score_3, score_4, score_5, score_6, score_7, score_8, score_9, score_10, total_score, comment, evaluated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
        [student_id, supervisor_name, agency_name, score_1, score_2, score_3, score_4, score_5, score_6, score_7, score_8, score_9, score_10, total_score, comment]
      );
    }
    res.json({ message: 'บันทึกผลการประเมินสำเร็จ' });
  } catch (err) {
    console.error('Save evaluation error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึกผลการประเมิน', details: err.message, sql: err.sqlMessage });
  }
});

// API ดึงข้อมูลหัวหน้าหน่วยงานและชื่อหน่วยงาน
router.get('/supervisor-info', async (req, res) => {
  const { username } = req.query;
  try {
    const [rows] = await db.query('SELECT agency_name, phone_number, address FROM tb_supervisor WHERE username = ?', [username]);
    if (rows.length > 0) {
      res.json({
        agency_name: rows[0].agency_name,
        phone_number: rows[0].phone_number,
        address: rows[0].address // เพิ่ม address
      });
    } else {
      res.json({});
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ดึงข้อมูลนักศึกษาสำหรับหน้าประเมินผลการฝึก เฉพาะของหัวหน้าหน่วยงานที่เข้าสู่ระบบ
router.get('/students-for-evaluation', async (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ error: 'Missing username' });
  try {
    // หา agency_name และ supervisor_name จาก username
    const [supervisorRows] = await db.query('SELECT agency_name, supervisor_name FROM tb_supervisor WHERE username = ?', [username]);
    if (supervisorRows.length === 0) {
      return res.status(404).json({ error: 'ไม่พบหัวหน้าหน่วยงานนี้', username });
    }
    const agency_name = supervisorRows[0].agency_name;
    const supervisor_name = supervisorRows[0].supervisor_name;
    // ดึง student_id, student_name, student_major, student_fac จาก tb_student และ supervisor_name จาก tb_supervisor
    const [rows] = await db.query(
      `SELECT s.student_id, s.student_name, s.student_major, s.student_fac, sup.supervisor_name, e.agency_name
       FROM tb_student s
       INNER JOIN tb_internship_enrollment e ON s.student_id = e.student_id
       INNER JOIN tb_supervisor sup ON sup.agency_name = e.agency_name
       WHERE e.agency_name = ? AND e.status = 'อนุมัติแล้ว' AND sup.username = ?`,
      [agency_name, username]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลนักศึกษาสำหรับประเมิน', details: err });
  }
});

//รายชื่อนักศึกษาที่เข้าฝึกกับหน่วยงาน//
router.get('/students-by-supervisor', async (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ error: 'Missing username' });
  try {
    // หา agency_name จาก username
    const [supervisorRows] = await db.query('SELECT agency_name FROM tb_supervisor WHERE username = ?', [username]);
    if (supervisorRows.length === 0) {
      return res.status(404).json({ error: 'ไม่พบหัวหน้าหน่วยงานนี้' });
    }
    const agency_name = supervisorRows[0].agency_name;
    // ดึงข้อมูลนักศึกษาที่เข้าฝึกกับหน่วยงานนี้ พร้อม created_at
    const [rows] = await db.query(
      `SELECT student_id, student_name, agency_name, schedule_day, status, training_status, created_at
       FROM tb_internship_enrollment
       WHERE agency_name = ? AND status = 'อนุมัติแล้ว'`,
      [agency_name]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลนักศึกษา', details: err });
  }
});
//////////////////////////////////////////////////////////////////////////////////
// ดึงข้อมูลการปฏิบัติงานของนักศึกษาตามหน่วยงานของหัวหน้าหน่วยงาน
router.get('/student-work-logs', async (req, res) => {
  const { username } = req.query;
  console.log('student-work-logs: username =', username);
  if (!username) return res.status(400).json({ error: 'Missing username' });
  try {
    // หา agency_name จาก username
    const [supervisorRows] = await db.query('SELECT agency_name FROM tb_supervisor WHERE username = ?', [username]);
    console.log('supervisorRows:', supervisorRows);
    if (supervisorRows.length === 0) {
      return res.status(404).json({ error: 'ไม่พบหัวหน้าหน่วยงานนี้', username });
    }
    const agency_name = supervisorRows[0].agency_name;
    // ดึงข้อมูล work log เฉพาะนักศึกษาที่ agency_name ตรงกับหัวหน้าหน่วยงาน
    const [rows] = await db.query(
      `SELECT w.work_date, w.student_id, w.student_name, w.agency_name, w.work_report, w.checkin_time, w.checkout_time, w.hours_worked, w.problem, w.status
       FROM tb_student_work_log w
       WHERE w.agency_name = ?`,
      [agency_name]
    );
    console.log('work log rows:', rows);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล work log', details: err });
  }
});

////////////////////////////////////////////////////////////////////////////////////////////////

// API ดึงรายชื่อนักศึกษาที่เข้าฝึกกับหน่วยงาน

// ดึงข้อมูล supervisor ทั้งหมด (สำหรับหน้าจัดการหน่วยงาน)
router.get('/supervisor', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT supervisor_id, supervisor_name, gender, agency_name, position, phone_number, created_at, updated_at FROM tb_supervisor');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ดึงข้อมูล supervisor ทั้งหมด (สำหรับหน้าจัดการหน่วยงาน)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT supervisor_id, supervisor_name, gender, agency_name, position, phone_number, created_at, updated_at FROM tb_supervisor');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ลงทะเบียนหน่วยงานใหม่
router.post('/', async (req, res) => {
  const { username, gender, supervisor_name, position, agency_name, phone_number, password, address } = req.body;
  try {
    // ตรวจสอบ username ซ้ำ
    const [check] = await db.query('SELECT supervisor_id FROM tb_supervisor WHERE username = ?', [username]);
    if (check.length > 0) {
      return res.status(400).json({ error: 'ชื่อผู้ใช้นี้ถูกใช้แล้ว' });
    }
    // เข้ารหัสรหัสผ่าน
    const passwordMD5 = crypto.createHash('md5').update(password).digest('hex');
    // เพิ่ม supervisor
    await db.query(
      'INSERT INTO tb_supervisor (username, gender, supervisor_name, position, agency_name, phone_number, address, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        username,
        gender,
        supervisor_name,
        position,
        agency_name,
        phone_number,
        address, // เพิ่ม address
        passwordMD5
      ]
    );
    res.status(201).json({ message: 'ลงทะเบียนหน่วยงานสำเร็จ' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Agency Routes
// ====================================

// ดึง open_id ทั้งหมดที่มีสถานะอนุมัติแล้ว
router.get('/approved-open-ids', async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT DISTINCT open_id FROM tb_internship_enrollment WHERE status = 'อนุมัติแล้ว'"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึง open_id', details: err });
  }
});

// ดึงรายชื่อหน่วยงานที่ยืนยันแล้ว
router.get('/confirmed-agencies', async (req, res) => {
  try {
    // ดึงข้อมูลหน่วยงานและจำนวนที่เลือกไปแล้ว (selected_count) ทุกสถานะ พร้อมจำนวนที่เหลือ (remaining_capacity)
    const [rows] = await db.query(`
      SELECT c.open_id, c.agency_name, c.capacity, c.location, c.phone_number,
        IFNULL(e.selected_count, 0) AS selected_count,
        (c.capacity - IFNULL(e.selected_count, 0)) AS remaining_capacity
      FROM tb_confirmed_agencies c
      LEFT JOIN (
        SELECT open_id, COUNT(*) AS selected_count
        FROM tb_internship_enrollment
        GROUP BY open_id
      ) e ON c.open_id = e.open_id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลหน่วยงาน', details: err });
  }
});

// ดึงนักศึกษาที่เลือกหน่วยงานนี้และสถานะสมัครเป็น 'อนุมัติแล้ว'
// ดึงรายชื่อนักศึกษาที่เข้าฝึกกับหน่วยงานตาม username ของหัวหน้าหน่วยงาน
router.get('/enrollment-students', async (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ error: 'Missing username' });
  try {
    // หา agency_name จาก username
    const [supervisorRows] = await db.query('SELECT agency_name FROM tb_supervisor WHERE username = ?', [username]);
    if (supervisorRows.length === 0) {
      return res.status(404).json({ error: 'ไม่พบหัวหน้าหน่วยงานนี้' });
    }
    const agency_name = supervisorRows[0].agency_name;
    // ดึงข้อมูลนักศึกษาที่เลือกหน่วยงานนี้และสถานะสมัครเป็น 'อนุมัติแล้ว'
    const [rows] = await db.query(
      'SELECT student_id, student_name, agency_name, schedule_day, status, training_status FROM tb_internship_enrollment WHERE agency_name = ? AND status = "อนุมัติแล้ว"',
      [agency_name]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล enrollment', details: err });
  }
});

// Login agency
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.query(
      'SELECT supervisor_id, username, supervisor_name, agency_name, password FROM tb_supervisor WHERE username = ?',
      [username]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'ชื่อผู้ใช้งานไม่ถูกต้อง' });
    }
    const supervisor = rows[0];
    const match = await bcrypt.compare(password, supervisor.password);
    if (!match) {
      return res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
    }
    res.json({
      supervisor_id: supervisor.supervisor_id,
      supervisor_name: supervisor.supervisor_name,
      agency_name: supervisor.agency_name,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// เพิ่มข้อมูลเปิดรับนักศึกษา
router.post('/open-for-students', async (req, res) => {
  try {
    const { agency_name, capacity, address, phone_number, status, student_semester, student_year } = req.body;
    await db.query(
      `INSERT INTO tb_open_for_students (agency_name, capacity, address, phone_number, status, student_semester, student_year, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [agency_name, capacity, address, phone_number, status, student_semester, student_year]
    );
    res.status(201).json({ message: 'Open registration created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/register/agency/open-for-students/:open_id
router.patch('/open-for-students/:open_id', async (req, res) => {
  try {
    const { open_id } = req.params;
    const { agency_name, capacity, address, phone_number, status, student_semester, student_year } = req.body;
    await db.query(
      `UPDATE tb_open_for_students SET agency_name=?, capacity=?, address=?, phone_number=?, status=?, student_semester=?, student_year=?, updated_at=NOW() WHERE open_id=?`,
      [agency_name, capacity, address, phone_number, status, student_semester, student_year, open_id]
    );
    res.json({ message: 'Open registration updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ดึงข้อมูลเปิดรับนักศึกษาเฉพาะของหัวหน้าหน่วยงานที่เข้าสู่ระบบตาม username
router.get('/open-for-students', async (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ error: 'Missing username' });
  try {
    const [supervisorRows] = await db.query('SELECT agency_name FROM tb_supervisor WHERE username = ?', [username]);
    if (supervisorRows.length === 0) {
      return res.status(404).json({ error: 'ไม่พบหัวหน้าหน่วยงานนี้' });
    }
    const agency_name = supervisorRows[0].agency_name;
    const [rows] = await db.query(
      'SELECT open_id, status, agency_name, capacity, address, phone_number, student_semester, student_year, created_at FROM tb_open_for_students WHERE agency_name = ?',
      [agency_name]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

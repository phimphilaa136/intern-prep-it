const express = require('express');
const router = express.Router();
const db = require('../../models/db');
const crypto = require('crypto');

// แก้ไขข้อมูลหัวหน้าหน่วยงาน (PUT /api/register/teacher/supervisor/:supervisor_id)
router.put('/supervisor/:supervisor_id', async (req, res) => {
  const { supervisor_id } = req.params;
  const {
    supervisor_name,
    gender,
    agency_name,
    position,
    phone_number,
    username
  } = req.body;
  try {
    await db.query(
      `UPDATE tb_supervisor SET supervisor_name=?, gender=?, agency_name=?, position=?, phone_number=?, username=? WHERE supervisor_id=?`,
      [supervisor_name, gender, agency_name, position, phone_number, username, supervisor_id]
    );
    res.json({ message: 'แก้ไขข้อมูลหัวหน้าหน่วยงานสำเร็จ' });
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลหัวหน้าหน่วยงาน', details: err });
  }
});

// ลบข้อมูลหัวหน้าหน่วยงาน (DELETE /api/register/teacher/supervisor/:supervisor_id)
router.delete('/supervisor/:supervisor_id', async (req, res) => {
  const { supervisor_id } = req.params;
  try {
    await db.query('DELETE FROM tb_supervisor WHERE supervisor_id = ?', [supervisor_id]);
    res.json({ message: 'ลบข้อมูลหัวหน้าหน่วยงานสำเร็จ' });
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบข้อมูลหัวหน้าหน่วยงาน', details: err });
  }
});

// แก้ไขข้อมูลนักศึกษา (PUT /api/register/teacher/students/:student_id)
router.put('/students/:student_id', async (req, res) => {
  const { student_id } = req.params;
  const {
    student_name,
    student_gender,
    student_fac,
    student_major,
    student_email,
    student_tel,
    student_address,
    student_advisor,
    student_sick,
    image_path
  } = req.body;
  try {
    await db.query(
      `UPDATE tb_student SET student_name=?, student_gender=?, student_fac=?, student_major=?, student_email=?, student_tel=?, student_address=?, student_advisor=?, student_sick=?, image_path=? WHERE student_id=?`,
      [student_name, student_gender, student_fac, student_major, student_email, student_tel, student_address, student_advisor, student_sick, image_path, student_id]
    );
    res.json({ message: 'แก้ไขข้อมูลนักศึกษาสำเร็จ' });
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลนักศึกษา', details: err });
  }
});

// ลบข้อมูลนักศึกษา (DELETE /api/register/teacher/students/:student_id)
router.delete('/students/:student_id', async (req, res) => {
  const { student_id } = req.params;
  try {
    await db.query('DELETE FROM tb_student WHERE student_id = ?', [student_id]);
    res.json({ message: 'ลบข้อมูลนักศึกษาสำเร็จ' });
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบข้อมูลนักศึกษา', details: err });
  }
});

// ดึงข้อมูลหน่วยงานที่เปิดรับทั้งหมดจาก tb_open_for_students สำหรับหน้าอาจารย์
router.get('/open-for-students', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM tb_open_for_students');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลหน่วยงานที่เปิดรับ', details: err });
  }
});

// ดึงข้อมูลการประเมินที่ประเมินแล้วจาก tb_teacher_evaluation
router.get('/evaluated-students', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT student_id, student_name, agency_name, total_score, comment, evaluated_at,
        score_1, score_2, score_3, score_4, score_5, score_6, score_7, score_8, score_9, score_10
       FROM tb_teacher_evaluation WHERE total_score IS NOT NULL`
    );
    // แปลงคะแนนเป็น array
    const result = rows.map(r => ({
      student_id: r.student_id,
      student_name: r.student_name,
      agency_name: r.agency_name,
      total_score: r.total_score,
      comment: r.comment,
      evaluated_at: r.evaluated_at,
      scores: [
        r.score_1 ?? 0,
        r.score_2 ?? 0,
        r.score_3 ?? 0,
        r.score_4 ?? 0,
        r.score_5 ?? 0,
        r.score_6 ?? 0,
        r.score_7 ?? 0,
        r.score_8 ?? 0,
        r.score_9 ?? 0,
        r.score_10 ?? 0
      ]
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลการประเมิน', details: err });
  }
});

/////////////////////////////////////////////////////////
// ดึงข้อมูลนักศึกษาที่อนุมัติแล้วสำหรับหน้าประเมินผลการฝึก
/////////////////////////////////////////////////////////
router.get('/students-for-evaluation-simple', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT student_id, student_name, agency_name FROM tb_internship_enrollment WHERE status = 'อนุมัติแล้ว'`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลนักศึกษาสำหรับประเมินผล', details: err });
  }
});

// ลงทะเบียนอาจารย์ฝ่ายสหกิจ (POST /api/register/teacher)
router.post('/', async (req, res) => {
  const { username, gender, full_name, faculty, major, email, phone_number, address, password } = req.body;
  try {
    // ตรวจสอบ username ซ้ำ
    const [check] = await db.query('SELECT teacher_id FROM tb_teacher WHERE username = ?', [username]);
    if (check.length > 0) {
      return res.status(400).json({ error: 'ชื่อผู้ใช้นี้ถูกใช้แล้ว' });
    }
    // เข้ารหัสรหัสผ่าน
    const passwordMD5 = crypto.createHash('md5').update(password).digest('hex');
    // เพิ่มอาจารย์
    await db.query(
      'INSERT INTO tb_teacher (username, gender, full_name, faculty, major, email, phone_number, address, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        username,
        gender,
        full_name,
        faculty,
        major,
        email,
        phone_number,
        address,
        passwordMD5
      ]
    );
    res.status(201).json({ message: 'ลงทะเบียนอาจารย์สำเร็จ' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ดึงรายชื่อนักศึกษาขอเข้าฝึกงาน (รหัสนักศึกษา, ชื่อนามสกุล, ชื่อหน่วยงาน)
router.get('/enrollment-students', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT student_id, student_name, agency_name FROM tb_internship_enrollment WHERE status = 'รอการอนุมัติ'`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลนักศึกษาขอเข้าฝึก', details: err });
  }
});

// บันทึกผลการประเมินของอาจารย์
router.post('/evaluation', async (req, res) => {
  try {
    const {
      student_id,
      student_name,
      agency_name,
      scores,
      total_score,
      comment
    } = req.body;
    // scores = [score_1, ..., score_10]
    const [result] = await db.query(
      `INSERT INTO tb_teacher_evaluation (
        student_id, student_name, agency_name,
        score_1, score_2, score_3, score_4, score_5, score_6, score_7, score_8, score_9, score_10,
        total_score, comment
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        student_id,
        student_name,
        agency_name,
        scores[0], scores[1], scores[2], scores[3], scores[4], scores[5], scores[6], scores[7], scores[8], scores[9],
        total_score,
        comment
      ]
    );
    res.status(201).json({ message: 'บันทึกผลการประเมินสำเร็จ', evaluation_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึกผลการประเมิน', details: err });
  }
});

// ดึงข้อมูลผลการประเมินทั้งหมด
// ดึงรายงานประเมินผลของหัวหน้างาน
router.get('/agency-evaluations', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT a.evaluation_id, a.student_id, s.student_name, s.student_fac, s.student_major, a.supervisor_name, a.agency_name,
        a.total_score, a.comment, a.evaluated_at,
        a.score_1, a.score_2, a.score_3, a.score_4, a.score_5, a.score_6, a.score_7, a.score_8, a.score_9, a.score_10,
        CASE WHEN a.total_score IS NULL THEN 'รอประเมิน' WHEN a.total_score >= 60 THEN 'ผ่าน' ELSE 'ไม่ผ่าน' END AS status
      FROM tb_agency_evaluation a
      LEFT JOIN tb_student s ON a.student_id = s.student_id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลรายงานประเมินผลของหัวหน้างาน', details: err });
  }
});
router.get('/evaluations', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT evaluation_id, student_id, student_name, agency_name, total_score, comment, evaluated_at FROM tb_teacher_evaluation`
    );
    // เพิ่มสถานะ: ถ้ามีคะแนนถือว่า "ประเมินแล้ว" ถ้าไม่มี "รอประเมิน"
    const data = rows.map(r => ({
      student_id: r.student_id,
      name: r.student_name,
      agency: r.agency_name,
      score: r.total_score,
      status: r.total_score !== null ? 'ประเมินแล้ว' : 'รอประเมิน',
      comment: r.comment,
      evaluated_at: r.evaluated_at
    }));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผลการประเมิน', details: err });
  }
});

// ดึงข้อมูลนักศึกษาสำหรับหน้าประเมินผลการฝึก
router.get('/students-for-evaluation', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT e.student_id, e.student_name, e.agency_name, t.total_score, t.comment
       FROM tb_internship_enrollment e
       LEFT JOIN tb_teacher_evaluation t ON e.student_id = t.student_id
       WHERE e.status = 'อนุมัติแล้ว'`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลนักศึกษาสำหรับประเมินผล', details: err });
  }
});

// Teacher/Admin Routes
// ดึงข้อมูลนักศึกษาทั้งหมด (สำหรับหน้าจัดการนักศึกษา)
router.get('/students', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT student_id, student_gender, student_name, student_fac, student_major, student_class, student_year, student_semester, student_email, student_tel, student_address, student_advisor, student_sick, image_path, created_at, updated_at FROM tb_student`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลนักศึกษา', details: err });
  }
});
// ====================================

// Confirm agency
router.post('/confirm-agency', async (req, res) => {
  try {
    const { open_id, agency_name, capacity, address, phone_number } = req.body; // เปลี่ยนจาก location เป็น address
    // ลบข้อมูลเดิมก่อน (ถ้ามี) เพื่อให้สามารถยืนยันใหม่ได้
    await db.query('DELETE FROM tb_confirmed_agencies WHERE open_id = ?', [open_id]);
    await db.query(
      `INSERT INTO tb_confirmed_agencies (open_id, agency_name, capacity, address, phone_number)
       VALUES (?, ?, ?, ?, ?)`,
      [open_id, agency_name, capacity, address, phone_number] // เปลี่ยนจาก location เป็น address
    );
    res.status(201).json({ message: 'Confirmed agency sent successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel confirm agency
router.delete('/cancel-confirm-agency/:open_id', async (req, res) => {
  try {
    const { open_id } = req.params;
    await db.query('DELETE FROM tb_confirmed_agencies WHERE open_id = ?', [open_id]);
    res.json({ message: 'ยกเลิกการส่งข้อมูลหน่วยงานเรียบร้อยแล้ว' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ดึงข้อมูล work log ของนักศึกษาทั้งหมด
router.get('/student-work-logs', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        id AS log_id,
        work_date,
        student_id,
        student_name,
        agency_name,
        work_report,
        checkin_time,
        checkout_time,
        hours_worked,
        problem,
        status
      FROM tb_Student_Work_Log
      ORDER BY work_date DESC, id DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล work log', details: err });
  }
});

// ดึงรายชื่อ supervisor/agency สำหรับหน้า teacher manage agencies
router.get('/supervisor', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT supervisor_id, supervisor_name, agency_name, username FROM tb_supervisor'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล supervisor', details: err });
  }
});

// ดึงข้อมูลหน่วยงานทั้งหมดสำหรับหน้าจัดการหน่วยงาน
router.get('/all-supervisors', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT supervisor_id, supervisor_name, agency_name, username, gender, position, phone_number, address, created_at FROM tb_supervisor'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลหน่วยงาน', details: err });
  }
});

// สรุปข้อมูลแดชบอร์ดอาจารย์: นักศึกษาทั้งหมด, หน่วยงานทั้งหมด, รายชื่อหน่วยงานที่เปิดรับทั้งหมด, รายชื่อนักศึกษาขอเข้าฝึกทั้งหมด
router.get('/teacher-dashboard', async (req, res) => {
  try {
    // นักศึกษาทั้งหมด
    const [[{ studentCount }]] = await db.query('SELECT COUNT(*) AS studentCount FROM tb_student');
    // หน่วยงานทั้งหมด
    const [[{ agencyCount }]] = await db.query('SELECT COUNT(*) AS agencyCount FROM tb_supervisor');
    // รายชื่อหน่วยงานที่เปิดรับทั้งหมด
    const [[{ openAgencyCount }]] = await db.query('SELECT COUNT(DISTINCT agency_name) AS openAgencyCount FROM tb_open_for_students');
    // รายชื่อนักศึกษาขอเข้าฝึกทั้งหมด (สถานะรอการอนุมัติ)
    const [[{ requestStudentCount }]] = await db.query("SELECT COUNT(*) AS requestStudentCount FROM tb_internship_enrollment");
    res.json({
      studentCount,
      agencyCount,
      openAgencyCount,
      requestStudentCount
    });
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสรุปแดชบอร์ด', details: err });
  }
});

// ดึงข้อมูลนักศึกษาขอเข้าฝึกทั้งหมดจาก tb_internship_enrollment
router.get('/all-internship-enrollments', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        request_id,
        student_id,
        student_name,
        schedule_day,
        open_id,
        agency_name,
        status,
        training_status,
        created_at,
        updated_at
      FROM tb_internship_enrollment
      ORDER BY created_at DESC, request_id DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลนักศึกษาขอเข้าฝึกทั้งหมด', details: err });
  }
});

// Login teacher
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM tb_teacher WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }
    const teacher = rows[0];
    const match = await bcrypt.compare(password, teacher.password);
    if (!match) {
      return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }
    // เข้าสู่ระบบสำเร็จ
    res.json({ message: 'เข้าสู่ระบบสำเร็จ', teacher_id: teacher.teacher_id });
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ', details: err });
  }
});

// แก้ไขข้อมูลนักศึกษา (PATCH /api/register/teacher/students/:student_id)
router.patch('/students/:student_id', async (req, res) => {
  const { student_id } = req.params;
  const update = req.body;
  try {
    await db.query(
      `UPDATE tb_student SET student_name=?, student_gender=?, student_fac=?, student_major=?, student_email=?, student_tel=?, student_address=?, student_advisor=?, student_sick=? WHERE student_id=?`,
      [
        update.student_name,
        update.student_gender,
        update.student_fac,
        update.student_major,
        update.student_email,
        update.student_tel,
        update.student_address,
        update.student_advisor,
        update.student_sick,
        student_id
      ]
    );
    res.json({ message: 'แก้ไขข้อมูลสำเร็จ' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// อัปเดตสถานะรายงานของนักศึกษา (PATCH /api/register/teacher/student-report/:report_id)
router.patch('/student-report/:report_id', async (req, res) => {
  const { report_id } = req.params;
  const { status } = req.body;
  try {
    await db.query(
      'UPDATE tb_student_report SET status = ? WHERE report_id = ?',
      [status, report_id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'อัปเดตสถานะไม่สำเร็จ', details: err });
  }
});

module.exports = router;

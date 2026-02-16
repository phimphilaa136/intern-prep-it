const express = require('express');
const router = express.Router();
const db = require('../models/db');
const crypto = require('crypto'); // ใช้สำหรับ MD5

router.post('/login', async (req, res) => {
  const { student_id, username, password } = req.body;
  if ((!student_id && !username) || !password) {
    return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }

  // แปลงรหัสผ่านที่รับมาเป็น MD5 hash
  const passwordMD5 = crypto.createHash('md5').update(password).digest('hex');

  let user, role;
  if (student_id) {
    // นักศึกษา
    const [rows] = await db.query('SELECT * FROM tb_student WHERE student_id = ?', [student_id]);
    if (rows.length === 0 || rows[0].password !== passwordMD5) {
      return res.status(401).json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    }
    user = rows[0];
    role = "student";
  } else if (username) {
    // อาจารย์
    const [rows] = await db.query('SELECT * FROM tb_teacher WHERE username = ?', [username]);
    if (rows.length > 0) {
      if (rows[0].password !== passwordMD5) {
        return res.status(401).json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
      }
      user = rows[0];
      role = "teacher";
    } else {
      // หน่วยงาน
      const [rows2] = await db.query('SELECT * FROM tb_supervisor WHERE username = ?', [username]);
      if (rows2.length === 0 || rows2[0].password !== passwordMD5) {
        return res.status(401).json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
      }
      user = rows2[0];
      role = "agency";
    }
  }

  res.json({ message: "เข้าสู่ระบบสำเร็จ", role });
});

module.exports = router;
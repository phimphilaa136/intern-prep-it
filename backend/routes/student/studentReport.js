const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const db = require(path.join(__dirname, '../../models/db'));

// ฟังก์ชัน sanitize ชื่อไฟล์ (ลบอักขระพิเศษที่อาจทำให้ path error)
function sanitizeFilename(filename) {
  const name = path.parse(filename).name;
  const ext = path.extname(filename);
  return name.replace(/[\/\\\?\%\*\:\|\"\<\>]/g, '_').trim() + ext;
}

// ตั้งค่า multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/reports/");
  },
  filename: (req, file, cb) => {
    // ใช้ชื่อไฟล์จริง (UTF-8) + timestamp
    const cleanedName = sanitizeFilename(file.originalname);
    const safeName = `${Date.now()}_${cleanedName}`;
    cb(null, safeName);
  }
});

const upload = multer({ storage });

// POST อัปโหลดไฟล์
router.post("/", upload.single("report_file"), async (req, res) => {
  try {
    const { student_id, student_name } = req.body;

    if (!req.file) return res.status(400).json({ error: "ไม่มีไฟล์อัปโหลด" });

    // เก็บชื่อไฟล์จริง
    const report_file = req.file.originalname; // ชื่อไฟล์ตามที่อัปโหลด
    const report_file_url = "/uploads/reports/" + req.file.filename; // path จริง

    // บันทึกลง DB
    await db.query(
      `INSERT INTO tb_student_report (student_id, student_name, report_file, report_file_url, status)
       VALUES (?, ?, ?, ?, ?)`,
      [student_id, student_name, report_file, report_file_url, "รออนุมัติ"]
    );

    res.json({ success: true, report_file, report_file_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET ดึงข้อมูลรายงานทั้งหมด (สามารถกรอง student_id ได้)
router.get("/", async (req, res) => {
  try {
    const { student_id } = req.query;
    let query = "SELECT * FROM tb_student_report ORDER BY created_at DESC";
    let params = [];
    if (student_id) {
      query = "SELECT * FROM tb_student_report WHERE student_id=? ORDER BY created_at DESC";
      params = [student_id];
    }
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// กำหนด storage สำหรับรูปภาพ
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/images/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// POST: อัปโหลดรูปภาพ
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // ส่ง path กลับไปให้ frontend
  res.json({ image_path: '/uploads/images/' + req.file.filename });
});

module.exports = router;

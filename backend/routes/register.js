const express = require('express');
const router = express.Router();

// รวม router แยกแต่ละกลุ่ม
router.use('/student', require('./student/student'));
router.use('/agency', require('./agency/agency'));
router.use('/teacher', require('./teacher/teacher'));

// (ตัวอย่าง route พิเศษที่ยังไม่มีในไฟล์ย่อย)
// router.post('/student/update-enrollment-status', ...)

module.exports = router;
const express = require('express');
const router = express.Router();
const db = require('../../models/db');

// GET /api/report-summary?year=xxxx
router.get('/', async (req, res) => {
	try {
		const year = req.query.year || '';

		// 1. รายชื่อหน่วยงานที่เปิดรับทั้งหมด (tb_open_for_students)

		// 1. รายชื่อหน่วยงานที่เปิดรับทั้งหมด (tb_open_for_students)
		// ฟังก์ชันแปลง created_at เป็นปี พ.ศ.
		// SELECT YEAR(created_at)+543 AS year_thai FROM ...
		const [agencyRows] = await db.query(
			`SELECT DISTINCT agency_name FROM tb_open_for_students WHERE YEAR(created_at)+543 = ?`, [year]
		);
		const agencies = agencyRows.map(a => a.agency_name);

		// 2. จำนวนนักศึกษาที่ออกฝึกทั้งหมด (tb_internship_enrollment)
		const [enrollRows] = await db.query(
			`SELECT COUNT(*) AS total_students FROM tb_internship_enrollment WHERE YEAR(created_at)+543 = ?`, [year]
		);
		const total_students = enrollRows[0]?.total_students || 0;

		// 3. จำนวนนักศึกษาฝึกเสร็จทั้งหมด (tb_internship_enrollment)
		// และแสดงจำนวนแต่ละ training_status
		const [statusRows] = await db.query(
			`SELECT training_status, COUNT(*) AS count FROM tb_internship_enrollment WHERE YEAR(created_at)+543 = ? GROUP BY training_status`, [year]
		);
	// จำนวนฝึกเสร็จ
	const completed_students = statusRows.find(s => s.training_status === 'เสร็จสิ้น')?.count || 0;
	// จำนวนสิ้นสุดการฝึก
	const ended_students = statusRows.find(s => s.training_status === 'สิ้นสุดการฝึก')?.count || 0;

		// 4. ส่งเล่มรายงานทั้งหมด (tb_student_report)
		const [reportRows] = await db.query(
			`SELECT COUNT(*) AS report_submitted FROM tb_student_report WHERE YEAR(created_at)+543 = ?`, [year]
		);
		const report_submitted = reportRows[0]?.report_submitted || 0;

		// 5. ประเมินผลการฝึกทั้งหมด (tb_teacher_evaluation)
		const [evalRows] = await db.query(
			`SELECT COUNT(*) AS evaluation_done FROM tb_teacher_evaluation WHERE YEAR(evaluated_at)+543 = ?`, [year]
		);
		const evaluation_done = evalRows[0]?.evaluation_done || 0;

		// สรุปผลรวมทั้งหมด
		const summary = [{
			agencies,
			total_students,
			completed_students,
			ended_students,
			report_submitted,
			evaluation_done
		}];
		res.json(summary);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลรายงานผล', details: err });
	}
});

module.exports = router;

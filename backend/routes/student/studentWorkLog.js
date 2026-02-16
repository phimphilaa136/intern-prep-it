const express = require('express');
const router = express.Router();
const db = require('../../models/db');

// รองรับ PATCH /:id สำหรับแก้ไขข้อมูล work log
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { work_report, checkin_time, checkout_time, hours_worked, problem, status, agency_name } = req.body;
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

// Create a new work log entry
router.post('/', async (req, res) => {
  try {
    const { work_date, student_id, student_name, agency_name, work_report, checkin_time, checkout_time, hours_worked, problem, status } = req.body;
    await db.query(
      `INSERT INTO tb_Student_Work_Log (work_date, student_id, student_name, agency_name, work_report, checkin_time, checkout_time, hours_worked, problem, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [work_date, student_id, student_name, agency_name, work_report, checkin_time, checkout_time, hours_worked, problem, status]
    );
    res.status(201).json({ message: 'บันทึกข้อมูลสำเร็จ' });
  } catch (err) {
    res.status(500).json({ error: 'บันทึกข้อมูลไม่สำเร็จ', details: err.message });
  }
});

// Get all work log entries (optionally filter by student_id, agency_confirmed, teacher_checked)
router.get('/', async (req, res) => {
  try {
    const { student_id, agency_confirmed, teacher_checked } = req.query;
    let query = 'SELECT * FROM tb_Student_Work_Log WHERE 1=1';
    let params = [];
    if (student_id) {
      query += ' AND student_id = ?';
      params.push(student_id);
    }
    if (agency_confirmed) {
      query += ' AND agency_confirmed = ?';
      params.push(agency_confirmed);
    }
    if (teacher_checked) {
      query += ' AND teacher_checked = ?';
      params.push(teacher_checked);
    }
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update work log status (agency/teacher confirm)
// Update work log fields
router.patch('/:log_id', async (req, res) => {
  try {
    const { work_report, checkin_time, checkout_time, hours_worked, problem, status, agency_name } = req.body;
    // สร้าง fields และ values สำหรับ update
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
    values.push(req.params.log_id);
    const sql = `UPDATE tb_Student_Work_Log SET ${fields.join(', ')} WHERE log_id = ?`;
    await db.query(sql, values);
    res.json({ message: 'Work log updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete work log entry
router.delete('/:log_id', async (req, res) => {
  try {
    await db.query('DELETE FROM tb_Student_Work_Log WHERE log_id = ?', [req.params.log_id]);
    res.json({ message: 'Work log deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

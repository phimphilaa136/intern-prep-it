import React, { useState, useEffect } from 'react';
import { FaUserGraduate, FaCalendarAlt, FaBuilding, FaCheckCircle, FaHourglassHalf, FaTimesCircle } from 'react-icons/fa';

function StudentPreparation() {
  const [agencies, setAgencies] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [form, setForm] = useState({
    student_id: '',
    student_name: '',
    schedule_day: '',
    open_id: '',
    agency_name: '',
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  // ดึงข้อมูลนักศึกษาจาก tb_student
  useEffect(() => {
    const currentStudentId = localStorage.getItem('student_id');
    if (currentStudentId) {
      fetch(`http://localhost:5000/api/register/student/student?student_id=${currentStudentId}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setForm(f => ({
              ...f,
              student_id: data[0].student_id || '',
              student_name: data[0].student_name || ''
            }));
          }
        })
        .catch(() => {});
    }
  }, []);

  // ดึงข้อมูล tb_confirmed_agencies + selected_students
  useEffect(() => {
    fetch('http://localhost:5000/api/register/student/available-agencies')
      .then(res => res.json())
      .then(data => {
        setAgencies(Array.isArray(data) ? data : []);
      })
      .catch(() => setAgencies([]));
  }, []);

  // ดึงข้อมูลการลงทะเบียนขอฝึกจาก tb_internship_enrollment
  useEffect(() => {
    const currentStudentId = localStorage.getItem('student_id');
    if (currentStudentId) {
      fetch(`http://localhost:5000/api/register/student/internship-enrollment?student_id=${currentStudentId}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setRegistrations(data);
            if (data.length > 0) setFormSubmitted(true); // ถ้ามีข้อมูลแล้วให้ซ่อนฟอร์ม
          } else {
            setRegistrations([]);
          }
        })
        .catch(() => setRegistrations([]));
    }
  }, [formSubmitted]);

  const handleChange = e => {
    const { name, value } = e.target;
    if (name === 'open_id') {
      const selectedAgency = agencies.find(a => String(a.open_id) === String(value));
      setForm(f => ({
        ...f,
        open_id: value,
        agency_name: selectedAgency ? selectedAgency.agency_name : ''
      }));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    fetch('http://localhost:5000/api/register/student/internship-enrollment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: form.student_id,
        student_name: form.student_name,
        schedule_day: form.schedule_day,
        open_id: form.open_id,
        agency_name: form.agency_name
      })
    })
    .then(res => res.json())
    .then(() => {
      setForm({ student_id: '', student_name: '', schedule_day: '', open_id: '', agency_name: '' });
      setFormSubmitted(true); // ซ่อนฟอร์มหลังลงทะเบียน
    })
    .catch(() => {
      setForm({ student_id: '', student_name: '', schedule_day: '', open_id: '', agency_name: '' });
    });
  };

  const statusIcon = status => {
    if (status === 'อนุมัติแล้ว') return <FaCheckCircle style={{color:'#16a085'}} title="อนุมัติแล้ว"/>;
    if (status === 'รอการอนุมัติ') return <FaHourglassHalf style={{color:'#f39c12'}} title="รอการอนุมัติ"/>;
    return <FaTimesCircle style={{color:'#e74c3c'}} title="ไม่อนุมัติ"/>;
  };
  const internStatusColor = status => {
    if (status === 'กำลังฝึก') return '#16a085';
    if (status === 'พักการฝึกชั่วคราว') return '#f39c12';
    if (status === 'สิ้นสุดการฝึก') return '#2c3e50';
    return '#bdc3c7';
  };

  return (
    <div className="student-preparation" style={{background:'#f8f9fa',padding:'2rem',borderRadius:'16px',boxShadow:'0 2px 12px rgba(44,62,80,0.08)',maxWidth:'1500px',margin:'2rem auto'}}>
      <h2 style={{marginBottom:'1.5rem',color:'#16a085',display:'flex',alignItems:'center',gap:'0.7rem'}}><FaCalendarAlt style={{marginRight:6}}/> ลงทะเบียนขอฝึก</h2>
      {/* แบบฟอร์มลงทะเบียนขอฝึก */}
      {!formSubmitted && (
        <form onSubmit={handleSubmit} style={{background:'#fff',padding:'1.5rem',borderRadius:'12px',boxShadow:'0 2px 8px rgba(44,62,80,0.08)',marginBottom:'2rem',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem',alignItems:'center'}}>
          <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><FaUserGraduate /> <span>รหัสนักศึกษา:</span></div>
          <input type="text" name="student_id" value={form.student_id} readOnly disabled style={{padding:'0.5rem',borderRadius:'8px',border:'1px solid #ccc',background:'#eee',fontWeight:'bold',color:'#000000ff'}} />
          <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><FaUserGraduate /> <span>ชื่อนามสกุล:</span></div>
          <input type="text" name="student_name" value={form.student_name} readOnly disabled style={{padding:'0.5rem',borderRadius:'8px',border:'1px solid #ccc',background:'#eee',fontWeight:'bold',color:'#000000ff'}} />
          <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><FaCalendarAlt /> <span>เลือกวัน:</span></div>
          <select name="schedule_day" value={form.schedule_day} onChange={handleChange} required style={{padding:'0.5rem',borderRadius:'8px',border:'1px solid #ccc'}}>
            <option value="">-- เลือกวัน --</option>
            <option value="วันจันทร์">วันจันทร์</option>
            <option value="วันอังคาร">วันอังคาร</option>
            <option value="วันพุธ">วันพุธ</option>
            <option value="วันพฤหัสบดี">วันพฤหัสบดี</option>
            <option value="วันศุกร์">วันศุกร์</option>
          </select>
          <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><FaBuilding /> <span>เลือกหน่วยงาน:</span></div>
          <select name="open_id" value={form.open_id} onChange={handleChange} required style={{fontWeight:'bold'}}>
            <option value="">-- เลือกหน่วยงาน --</option>
            {agencies.map((a,idx)=>(
              <option
                key={a.open_id || idx}
                value={a.open_id}
                disabled={a.selected_students >= a.capacity}
                style={{
                  color: a.selected_students >= a.capacity ? '#e74c3c' : (form.open_id === a.open_id ? '#0562f7' : undefined),
                  fontWeight: 'bold'
                }}>
                {a.agency_name}
                {` | จำนวนรับ: ${a.capacity} | เลือกไปแล้ว: ${a.selected_students}`}
                {a.selected_students >= a.capacity ? ' | เต็มแล้ว' : ''}
                {` | ที่อยู่: ${a.address} | เบอร์โทร: ${a.phone_number}`}
              </option>
            ))}
          </select>
          <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><FaBuilding /> <span>ชื่อหน่วยงาน:</span></div>
          <input type="text" name="agency_name" value={form.agency_name} onChange={handleChange} required style={{padding:'0.5rem',borderRadius:'8px',border:'1px solid #ccc',background:'#fff',fontWeight:'bold'}} />
          <div></div>
          <div style={{display:'flex',gap:'1rem'}}>
            <button type="submit" style={{background:'#2979ff',color:'#fff',border:'none',borderRadius:'8px',padding:'0.5rem 1.5rem',fontWeight:'100',fontSize:'1rem',cursor:'pointer'}}>ลงทะเบียนขอฝึก</button>
          </div>
        </form>
      )}
      {/* ตารางแสดงข้อมูลการลงทะเบียนขอฝึก */}
      <table style={{width:'100%',background:'#fff',borderRadius:'10px',boxShadow:'0 5px 8px rgba(44,62,80,0.08)',overflow:'hidden',fontSize:'0.9rem'}}>
        <thead style={{background:'#2979ff',color:'#fff'}}>
          <tr>
            <th style={{textAlign:'center'}}><FaUserGraduate style={{marginRight:4}}/> รหัสนักศึกษา</th>
            <th style={{textAlign:'center'}}><FaUserGraduate style={{marginRight:4}}/> ชื่อนามสกุล</th>
            <th style={{textAlign:'center'}}><FaCalendarAlt style={{marginRight:4}}/> วันทำการ</th>
            <th style={{textAlign:'center'}}><FaBuilding style={{marginRight:4}}/> หน่วยงาน</th>
            <th style={{textAlign:'center'}}>สถานะการสมัคร</th>
            <th style={{textAlign:'center'}}>สถานะการฝึก</th>
            <th style={{textAlign:'center'}}><FaCalendarAlt style={{marginRight:4}}/> วันที่สมัคร</th>
          </tr>
        </thead>
        <tbody>
          {registrations.length > 0 && registrations.map((r, idx) => (
            <tr key={r.request_id || idx} style={{background:'#f4f8fb'}}>
              <td style={{textAlign:'center'}}>{r.student_id}</td>
              <td style={{textAlign:'center'}}>{r.student_name}</td>
              <td style={{textAlign:'center'}}>{r.schedule_day}</td>
              <td style={{textAlign:'center'}}>{(() => {
                const agency = agencies.find(a => String(a.open_id) === String(r.open_id));
                if (agency) {
                  return `${agency.agency_name} (${agency.address}) | เบอร์โทร: ${agency.phone_number}`;
                }
                return r.agency_name || '-';
              })()}</td>
              <td style={{textAlign:'center',fontWeight:'bold'}}>{statusIcon(r.status)} <span style={{marginLeft:6}}>{r.status}</span></td>
              <td style={{textAlign:'center',fontWeight:'bold',color:internStatusColor(r.training_status)} }>{r.training_status}</td>
              <td style={{textAlign:'center'}}>{r.created_at ? new Date(r.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'numeric', year: 'numeric' }) : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StudentPreparation;

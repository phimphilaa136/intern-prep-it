import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import useAgencyOpenId from './useAgencyOpenId';
import { io } from 'socket.io-client';
import { FaUserGraduate, FaUniversity, FaBookOpen, FaPhoneAlt, FaCalendarAlt, FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaBuilding } from 'react-icons/fa';

function AgencyStudentList(props) {
  // รับ username จาก Outlet context ถ้าไม่มีใน props
  const outletContext = useOutletContext && useOutletContext();
  const username =
    props.username ||
    (outletContext && outletContext.username) ||
    localStorage.getItem('username');
  const [students, setStudents] = useState([]);
  const [selectedYear, setSelectedYear] = useState('ทั้งหมด');

  useEffect(() => {
    console.log('AgencyStudentList: username ที่ใช้เรียก backend =', username);
    if (!username) {
      console.log('username ไม่ถูกต้อง:', username);
      return;
    }
    console.log('username ที่ใช้เรียก backend:', username);
    fetch(`http://localhost:5000/api/agency/students-by-supervisor?username=${encodeURIComponent(username)}`)
      .then(res => res.json())
      .then(data => {
        setStudents(Array.isArray(data) ? data : []);
      });

    const socket = io('http://localhost:5000');
    socket.on('internship_update', (payload) => {
      fetch(`http://localhost:5000/api/agency/students-by-supervisor?username=${encodeURIComponent(username)}`)
        .then(res => res.json())
        .then(data => {
          setStudents(Array.isArray(data) ? data : []);
        });
    });
    return () => {
      socket.disconnect();
    };
  }, [username]);

  const statusIcon = status => {
    if (status === 'ฝึกงานอยู่') return <FaCheckCircle style={{color:'#16a085'}} title="ฝึกงานอยู่"/>;
    if (status === 'รอฝึกงาน') return <FaHourglassHalf style={{color:'#f39c12'}} title="รอฝึกงาน"/>;
    return <FaTimesCircle style={{color:'#e74c3c'}} title="ไม่ได้รับเลือก"/>;
  };

  const applyStatusColor = status => {
    if (status === 'อนุมัติแล้ว') return '#16a085';
    if (status === 'รออนุมัติ') return '#f39c12';
    return '#e74c3c';
  };

  // ฟิลเตอร์ข้อมูลตามปีที่เลือก
  const filteredStudents = selectedYear === 'ทั้งหมด'
    ? students
    : students.filter(s => {
        // สมมติว่า s.student_year มีข้อมูลปีการศึกษา
        return s.student_year === selectedYear;
      });

  // เพิ่มฟังก์ชันแปลงวันที่เป็น พ.ศ.
  function formatThaiDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d)) return '-';
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear() + 543;
    return `${day}/${month}/${year}`;
  }

  return (
    <div className="agency-student-list" style={{background:'#f8f9fa',padding:'2rem',borderRadius:'16px',boxShadow:'0 2px 12px rgba(44,62,80,0.08)'}}>
      <h2 style={{marginBottom:'1.5rem',color:'#16a085',display:'flex',alignItems:'center',gap:'0.7rem'}}><FaUserGraduate style={{marginRight:6}}/> รายชื่อนักศึกษาที่เข้าฝึกกับหน่วยงาน</h2>
      {/* ช่องเลือกปีอยู่ด้านบนคอลัมน์สถานะการฝึก */}
      <div style={{display:'flex',justifyContent:'flex-end',alignItems:'center',marginBottom:'0.7rem'}}>
        <label htmlFor="year-select" style={{fontWeight:'bold',color:'#000000ff',marginRight:'0.7rem'}}></label>
        <select
          id="year-select"
          value={selectedYear}
          onChange={e => setSelectedYear(e.target.value)}
          style={{padding:'0.7rem 1.2rem',borderRadius:'8px',border:'1.5px solid #000000ff',fontSize:'1.08rem'}}
        >
          <option value="ทั้งหมด">ทั้งหมด</option>
          <option value="2566">2566</option>
          <option value="2567">2567</option>
          <option value="2568">2568</option>
          <option value="2569">2569</option>
        </select>
      </div>
      <table style={{width:'100%',background:'#fff',borderRadius:'12px',boxShadow:'0 2px 8px rgba(44,62,80,0.08)',overflow:'hidden',fontSize:'1rem'}}>
        <thead style={{background:'#16a085',color:'#fff'}}>
          <tr>
            <th><FaCalendarAlt style={{marginRight:4}}/> วันที่</th>
            <th><FaUserGraduate style={{marginRight:4}}/> รหัสนักศึกษา</th>
            <th><FaUserGraduate style={{marginRight:4}}/> ชื่อนามสกุล</th>
            <th><FaBuilding style={{marginRight:4}}/> หน่วยงาน</th>
            <th><FaCalendarAlt style={{marginRight:4}}/> วันทำการ</th>
            <th>สถานะการสมัคร</th>
            <th>สถานะการฝึก</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map((s,i) => (
            <tr key={s.student_id + '-' + (s.schedule_day || '') + '-' + i} style={{background:i%2===0?'#f4f8fb':'#fff'}}>
              <td>{s.created_at ? formatThaiDate(s.created_at) : '-'}</td>
              <td>{s.student_id}</td>
              <td>{s.student_name}</td>
              <td>{s.agency_name}</td>
              <td>{s.schedule_day || '-'}</td>
              <td>{s.status}</td>
              <td>{s.training_status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AgencyStudentList;
import React, { useState, useEffect } from 'react';
import { FaUserGraduate, FaCalendarAlt, FaFileAlt, FaClock, FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaTools, FaBell, FaEye } from 'react-icons/fa';
import io from 'socket.io-client';

function TeacherCheckWorkLog() {
  const [logs, setLogs] = useState([]);
  const [searchStudentId, setSearchStudentId] = useState('');
  const [searchStudentName, setSearchStudentName] = useState('');
  const [searchAgencyName, setSearchAgencyName] = useState('');
  const [selectedYear, setSelectedYear] = useState('ทั้งหมด');
  const [notifications, setNotifications] = useState([]);
  const [showNotificationList, setShowNotificationList] = useState(false);

  // เพิ่ม state สำหรับกรองนักศึกษาครบ/ไม่ครบ 96 ชั่วโมง
  const [showComplete, setShowComplete] = useState(null); // null=ทั้งหมด, true=ครบ, false=ไม่ครบ
  const [detailStudentId, setDetailStudentId] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/register/student/student-work-log')
      .then(res => res.json())
      .then(data => setLogs(Array.isArray(data) ? data : []))
      .catch(() => setLogs([]));
  }, []);

  useEffect(() => {
    const socket = io('http://localhost:5000');
    socket.on('student_96hours', (data) => {
      setNotifications(n => {
        if (n.some(x => x.student_id === data.student_id)) return n;
        return [...n, data];
      });
      console.log('Received:', data); // เพิ่ม log
    });
    return () => socket.disconnect();
  }, []);

  const statusMap = {
    'รอดำเนินการ': { color: '#f39c12', icon: <FaHourglassHalf /> },
    'ยืนยันแล้ว': { color: '#27ae60', icon: <FaCheckCircle /> },
    'ปฏิเสธ': { color: '#e74c3c', icon: <FaTimesCircle /> },
  };

  // คำนวณชั่วโมงรวมของแต่ละนักศึกษา
  const studentHoursMap = {};
  logs.forEach(l => {
    if (!studentHoursMap[l.student_id]) {
      studentHoursMap[l.student_id] = {
        student_id: l.student_id,
        student_name: l.student_name,
        agency_name: l.agency_name,
        total_hours: 0
      };
    }
    studentHoursMap[l.student_id].total_hours += parseFloat(l.hours_worked) || 0;
  });
  const studentsWithHours = Object.values(studentHoursMap);

  // ฟิลเตอร์ข้อมูลตามช่องค้นหาและปี
  const filteredLogs = logs.filter(l =>
    (searchStudentId === '' || (l.student_id && l.student_id.toString().includes(searchStudentId))) &&
    (searchStudentName === '' || (l.student_name && l.student_name.toLowerCase().includes(searchStudentName.toLowerCase()))) &&
    (searchAgencyName === '' || (l.agency_name && l.agency_name.toLowerCase().includes(searchAgencyName.toLowerCase()))) &&
    (selectedYear === 'ทั้งหมด' || (l.work_date && new Date(l.work_date).getFullYear() + 543 === Number(selectedYear)))
  );

  // ฟิลเตอร์นักศึกษาตามสถานะครบ/ไม่ครบ 96 ชั่วโมง
  let filteredStudents = studentsWithHours;
  if (showComplete === true) {
    filteredStudents = studentsWithHours.filter(s => s.total_hours >= 96);
  } else if (showComplete === false) {
    filteredStudents = studentsWithHours.filter(s => s.total_hours < 96);
  }

  // สำหรับแสดงเฉพาะ "แสดงทั้งหมด"
  const showStudentTable = showComplete === null;

  // ดึง work log ของนักศึกษาที่เลือกดูรายละเอียด
  const detailLogs = detailStudentId
    ? logs.filter(l => l.student_id === detailStudentId)
    : [];

  return (
    <div className="teacher-check-work-log" style={{position:'relative',background:'#f8f9fa',padding:'1rem',borderRadius:'16px',boxShadow:'0 2px 12px rgba(44,62,80,0.08)',maxWidth:'1800px',margin:'2.5rem auto'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.5rem',position:'relative'}}>
        <h2 style={{color:'#16a085',display:'flex',alignItems:'center',gap:'0.7rem'}}>
          <FaTools style={{marginRight:6}}/> ตรวจสอบการปฏิบัติงานของนักศึกษา
        </h2>
        {/* ลบไอคอนแจ้งเตือนออก */}
      </div>
      <div style={{
        display:'flex',
        gap:'1rem',
        marginBottom:'1.2rem',
        flexWrap:'wrap',
        alignItems:'center',
        justifyContent:'space-between'
      }}>
        <div style={{display:'flex',gap:'1rem',flexWrap:'wrap'}}>
          <input
            type="text"
            placeholder="ค้นหารหัสนักศึกษา"
            value={searchStudentId}
            onChange={e => setSearchStudentId(e.target.value)}
            style={{padding:'0.5rem 1rem',borderRadius:'8px',border:'1.5px solid #000000ff',fontSize:'1rem',minWidth:'180px'}}
          />
          <input
            type="text"
            placeholder="ค้นหาชื่อนักศึกษา"
            value={searchStudentName}
            onChange={e => setSearchStudentName(e.target.value)}
            style={{padding:'0.5rem 1rem',borderRadius:'8px',border:'1.5px solid #000000ff',fontSize:'1rem',minWidth:'180px'}}
          />
          <input
            type="text"
            placeholder="ค้นหาชื่อหน่วยงาน"
            value={searchAgencyName}
            onChange={e => setSearchAgencyName(e.target.value)}
            style={{padding:'0.5rem 1rem',borderRadius:'8px',border:'1.5px solid #000000ff',fontSize:'1rem',minWidth:'180px'}}
          />
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'0.7rem'}}>
          <label htmlFor="year-select" style={{fontWeight:'bold',color:'#000000ff'}}></label>
          <select
            id="year-select"
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            style={{padding:'0.4rem 1rem',borderRadius:'8px',border:'1.5px solid #000000ff',fontSize:'1rem'}}
          >
            <option value="ทั้งหมด">ทั้งหมด</option>
            <option value="2566">2566</option>
            <option value="2567">2567</option>
            <option value="2568">2568</option>
          </select>
        </div>
      </div>
      {/* ปุ่มกรองนักศึกษาครบ/ไม่ครบ 96 ชั่วโมง อยู่ใต้ช่องค้นหา */}
      <div style={{display:'flex',gap:'1rem',marginBottom:'1.2rem'}}>
        <button
          onClick={() => setShowComplete(null)}
          style={{
            background: showComplete === null ? '#2979ff' : '#bdc3c7',
            color:'#fff',
            border:'none',
            borderRadius:'8px',
            padding:'0.5rem 1.2rem',
            fontWeight:'bold',
            fontSize:'1rem',
            cursor:'pointer'
          }}
        >
          แสดงทั้งหมด
        </button>
        <button
          onClick={() => setShowComplete(true)}
          style={{
            background: showComplete === true ? '#16a085' : '#bdc3c7',
            color:'#fff',
            border:'none',
            borderRadius:'8px',
            padding:'0.5rem 1.2rem',
            fontWeight:'bold',
            fontSize:'1rem',
            cursor:'pointer'
          }}
        >
          นักศึกษาที่ครบชั่วโมง (96 ชม.)
        </button>
        <button
          onClick={() => setShowComplete(false)}
          style={{
            background: showComplete === false ? '#f39c12' : '#bdc3c7',
            color:'#fff',
            border:'none',
            borderRadius:'8px',
            padding:'0.5rem 1.2rem',
            fontWeight:'bold',
            fontSize:'1rem',
            cursor:'pointer'
          }}
        >
          นักศึกษาที่ยังไม่ครบชั่วโมง (96 ชม.)
        </button>
      </div>
      {/* ตารางแสดงนักศึกษาตามการกรอง เฉพาะแสดงทั้งหมด */}
      {showComplete !== null ? null : (
        <table style={{width:'100%',background:'#fff',borderRadius:'12px',boxShadow:'0 2px 8px rgba(44,62,80,0.08)',overflow:'hidden',fontSize:'1rem',marginBottom:'2rem'}}>
          <thead style={{background:'#2979ff',color:'#fff'}}>
            <tr>
              <th style={{textAlign:'center'}}>รหัสนักศึกษา</th>
              <th style={{textAlign:'center'}}>ชื่อนักศึกษา</th>
              <th style={{textAlign:'center'}}>ชื่อหน่วยงาน</th>
              <th style={{textAlign:'center'}}>ชั่วโมงรวม</th>
              <th style={{textAlign:'center'}}>สถานะ</th>
              <th style={{textAlign:'center'}}>ชั่วโมงที่เหลือ</th>
              <th style={{textAlign:'center'}}> {/* ปุ่มดูรายละเอียด */} </th>
            </tr>
          </thead>
          <tbody>
            {studentsWithHours.map((s,idx)=>(
              <tr key={s.student_id} style={{background:idx%2===0?'#f4f8fb':'#fff'}}>
                <td style={{textAlign:'center'}}>{s.student_id}</td>
                {/* เปลี่ยนจาก .split(' ')[0] เป็นแสดง s.student_name เต็ม */}
                <td style={{textAlign:'center'}}>{s.student_name}</td>
                <td style={{textAlign:'center'}}>{s.agency_name}</td>
                <td style={{textAlign:'center'}}>{s.total_hours}</td>
                <td style={{textAlign:'center',fontWeight:'bold',color:s.total_hours>=96?'#16a085':'#e74c3c'}}>
                  {s.total_hours>=96 ? 'ครบ 96 ชั่วโมงแล้ว' : 'ยังไม่ครบ'}
                </td>
                <td style={{textAlign:'center'}}>{s.total_hours>=96 ? 0 : (96-s.total_hours)}</td>
                <td style={{textAlign:'center'}}>
                  <button
                    onClick={() => setDetailStudentId(s.student_id)}
                    style={{
                      background:'#2979ff',
                      color:'#fff',
                      border:'none',
                      borderRadius:'8px',
                      padding:'0.3rem 1rem',
                      fontWeight:'bold',
                      fontSize:'1rem',
                      cursor:'pointer',
                      display:'flex',
                      alignItems:'center',
                      gap:'0.5rem'
                    }}
                  >
                    <FaEye /> ดูรายละเอียด
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* ตารางแสดงนักศึกษาตามการกรอง เฉพาะครบ/ไม่ครบ 96 ชั่วโมง */}
      {showComplete !== null && (
        <table style={{width:'100%',background:'#fff',borderRadius:'12px',boxShadow:'0 2px 8px rgba(44,62,80,0.08)',overflow:'hidden',fontSize:'1rem',marginBottom:'2rem'}}>
          <thead style={{background:'#2979ff',color:'#fff'}}>
            <tr>
              <th style={{textAlign:'center'}}>รหัสนักศึกษา</th>
              <th style={{textAlign:'center'}}>ชื่อนักศึกษา</th>
              <th style={{textAlign:'center'}}>ชื่อหน่วยงาน</th>
              <th style={{textAlign:'center'}}>ชั่วโมงรวม</th>
              <th style={{textAlign:'center'}}>สถานะ</th>
              <th style={{textAlign:'center'}}>ชั่วโมงที่เหลือ</th>
              <th style={{textAlign:'center'}}> {/* ปุ่มดูรายละเอียด */} </th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((s,idx)=>(
              <tr key={s.student_id} style={{background:idx%2===0?'#f4f8fb':'#fff'}}>
                <td style={{textAlign:'center'}}>{s.student_id}</td>
                {/* เปลี่ยนจาก .split(' ')[0] เป็นแสดง s.student_name เต็ม */}
                <td style={{textAlign:'center'}}>{s.student_name}</td>
                <td style={{textAlign:'center'}}>{s.agency_name}</td>
                <td style={{textAlign:'center'}}>{s.total_hours}</td>
                <td style={{textAlign:'center',fontWeight:'bold',color:s.total_hours>=96?'#16a085':'#e74c3c'}}>
                  {s.total_hours>=96 ? 'ครบ 96 ชั่วโมงแล้ว' : 'ยังไม่ครบ'}
                </td>
                <td style={{textAlign:'center'}}>{s.total_hours>=96 ? 0 : (96-s.total_hours)}</td>
                <td style={{textAlign:'center'}}>
                  <button
                    onClick={() => setDetailStudentId(s.student_id)}
                    style={{
                      background:'#2979ff',
                      color:'#fff',
                      border:'none',
                      borderRadius:'8px',
                      padding:'0.3rem 1rem',
                      fontWeight:'bold',
                      fontSize:'1rem',
                      cursor:'pointer',
                      display:'flex',
                      alignItems:'center',
                      gap:'0.5rem'
                    }}
                  >
                    <FaEye /> ดูรายละเอียด
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Modal ดูรายละเอียด */}
      {detailStudentId && (
        <div style={{
          position:'fixed',
          top:0,left:0,width:'100vw',height:'100vh',
          background:'rgba(44,62,80,0.18)',zIndex:9999,
          display:'flex',alignItems:'center',justifyContent:'center'
        }}>
          <div style={{
            background:'#fff',borderRadius:'16px',boxShadow:'0 2px 16px rgba(44,62,80,0.18)',padding:'2rem 2.5rem',
            minWidth:'340px',maxWidth:'90vw',textAlign:'center',position:'relative'
          }}>
            <h3 style={{marginBottom:'1.2rem',color:'#2979ff'}}>รายละเอียดการปฏิบัติงาน</h3>
            {/* ข้อมูลสรุปนักศึกษาด้านบน */}
            {(() => {
              const student = studentsWithHours.find(s => s.student_id === detailStudentId);
              if (!student) return null;
              return (
                <table style={{width:'100%',marginBottom:'1.2rem',fontSize:'1rem',background:'#f4f8fb',borderRadius:'8px'}}>
                  <tbody>
                    <tr>
                      <td style={{fontWeight:'bold',textAlign:'right',width:'140px'}}>รหัสนักศึกษา:</td>
                      <td style={{textAlign:'left'}}>{student.student_id}</td>
                      <td style={{fontWeight:'bold',textAlign:'right',width:'140px'}}>ชื่อนามสกุล:</td>
                      <td style={{textAlign:'left'}}>{student.student_name}</td>
                    </tr>
                    <tr>
                      <td style={{fontWeight:'bold',textAlign:'right'}}>ชื่อหน่วยงาน:</td>
                      <td style={{textAlign:'left'}}>{student.agency_name}</td>
                      <td style={{fontWeight:'bold',textAlign:'right'}}>ชั่วโมงรวม:</td>
                      <td style={{textAlign:'left'}}>{student.total_hours}</td>
                    </tr>
                    <tr>
                      <td style={{fontWeight:'bold',textAlign:'right'}}>สถานะ:</td>
                      <td style={{textAlign:'left',color:student.total_hours>=96?'#16a085':'#e74c3c',fontWeight:'bold'}}>
                        {student.total_hours>=96 ? 'ครบ 96 ชั่วโมงแล้ว' : 'ยังไม่ครบ'}
                      </td>
                      <td style={{fontWeight:'bold',textAlign:'right'}}>ชั่วโมงที่เหลือ:</td>
                      <td style={{textAlign:'left'}}>{student.total_hours>=96 ? 0 : (96-student.total_hours)}</td>
                    </tr>
                  </tbody>
                </table>
              );
            })()}
            {/* ตารางรายละเอียดการปฏิบัติงาน */}
            <table style={{width:'100%',marginBottom:'1.2rem',fontSize:'1rem'}}>
              <thead>
                <tr style={{background:'#f4f8fb'}}>
                  <th>วันที่</th>
                  <th>รายงานการปฏิบัติงาน</th>
                  <th>เวลามา</th>
                  <th>เวลากลับ</th>
                  <th>ชั่วโมง</th>
                  <th>ปัญหาที่พบและการแก้ไข</th>
                  <th>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {detailLogs.map((l,idx)=>(
                  <tr key={idx}>
                    <td>{l.work_date ? new Date(l.work_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'numeric', year: 'numeric' }) : '-'}</td>
                    <td>{l.work_report}</td>
                    <td>{l.checkin_time}</td>
                    <td>{l.checkout_time}</td>
                    <td>{l.hours_worked}</td>
                    <td>{l.problem}</td>
                    <td style={{color:statusMap[l.status]?.color || '#7f8c8d',fontWeight:'bold'}}>
                      {l.status === 'ยืนยันแล้ว' ? statusMap[l.status].icon : null} {l.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={() => setDetailStudentId(null)}
              style={{
                background:'#e74c3c',
                color:'#fff',
                border:'none',
                borderRadius:'8px',
                padding:'0.7rem 1.5rem',
                fontWeight:'500',
                fontSize:'1rem',
                cursor:'pointer'
              }}
            >ปิด</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherCheckWorkLog;

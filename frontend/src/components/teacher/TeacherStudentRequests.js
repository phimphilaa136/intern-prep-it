import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { FaUserGraduate, FaBuilding, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaPlayCircle, FaPauseCircle, FaStopCircle } from 'react-icons/fa';

function TeacherStudentRequests() {
  // ช่องค้นหาชื่อหน่วยงาน
  const [searchAgency, setSearchAgency] = useState("");
  const [requests, setRequests] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState({}); // { [request_id]: true/false }
  const [message, setMessage] = useState("");

  const [searchStudentId, setSearchStudentId] = useState("");
  const [searchStudentName, setSearchStudentName] = useState("");
  const [selectedYear, setSelectedYear] = useState("ทั้งหมด");

  // อัปเดตสถานะการสมัคร (tb_internship_enrollment)
  const updateApplyStatus = async (request_id, status) => {
    setLoading(l => ({ ...l, [request_id]: true }));
    setMessage("");
    try {
      const res = await fetch('http://localhost:5000/api/register/student/update-enrollment-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id, status })
      });
      if (!res.ok) throw new Error("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
      setMessage("อัปเดตสถานะสำเร็จ");
    } catch (e) {
      setMessage(e.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(l => ({ ...l, [request_id]: false }));
    }
  };
  // ยกเลิกสถานะการสมัคร (tb_internship_enrollment)
  const cancelApplyStatus = async (request_id) => {
    setLoading(l => ({ ...l, [request_id]: true }));
    setMessage("");
    try {
      const res = await fetch('http://localhost:5000/api/register/student/update-enrollment-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id, status: 'รอการอนุมัติ' })
      });
      if (!res.ok) throw new Error("เกิดข้อผิดพลาดในการยกเลิกสถานะ");
      setMessage("ยกเลิกสถานะสำเร็จ");
    } catch (e) {
      setMessage(e.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(l => ({ ...l, [request_id]: false }));
    }
  };
  // อัปเดตสถานะการฝึก (tb_internship_enrollment)
  const updateTrainingStatus = async (request_id, training_status) => {
    setLoading(l => ({ ...l, [request_id]: true }));
    setMessage("");
    try {
      const res = await fetch('http://localhost:5000/api/register/student/update-enrollment-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id, training_status })
      });
      if (!res.ok) throw new Error("เกิดข้อผิดพลาดในการอัปเดตสถานะการฝึก");
      setMessage("อัปเดตสถานะการฝึกสำเร็จ");
    } catch (e) {
      setMessage(e.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(l => ({ ...l, [request_id]: false }));
    }
  };
  // ยกเลิกสถานะการฝึก (tb_internship_enrollment)
  const cancelTrainingStatus = async (request_id) => {
    setLoading(l => ({ ...l, [request_id]: true }));
    setMessage("");
    try {
      const res = await fetch('http://localhost:5000/api/register/student/update-enrollment-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id, training_status: 'ยังไม่เริ่ม' })
      });
      if (!res.ok) throw new Error("เกิดข้อผิดพลาดในการยกเลิกสถานะการฝึก");
      setMessage("ยกเลิกสถานะการฝึกสำเร็จ");
    } catch (e) {
      setMessage(e.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(l => ({ ...l, [request_id]: false }));
    }
  };

  // กรองให้เหลือเฉพาะ request ล่าสุดของแต่ละ student_id
  const getLatestRequests = (allRequests) => {
    const latestMap = {};
    allRequests.forEach(r => {
      if (!latestMap[r.student_id] || new Date(r.updated_at) > new Date(latestMap[r.student_id].updated_at)) {
        latestMap[r.student_id] = r;
      }
    });
    return Object.values(latestMap);
  };

  useEffect(() => {
    // ดึงข้อมูลนักศึกษาขอเข้าฝึกทั้งหมดจาก tb_internship_enrollment
    fetch('http://localhost:5000/api/register/teacher/all-internship-enrollments')
      .then(res => res.json())
      .then(data => setRequests(Array.isArray(data) ? data : []))
      .catch(() => setRequests([]));

    // ดึงข้อมูลหน่วยงานจาก tb_confirmed_agencies
    fetch('http://localhost:5000/api/register/student/available-agencies')
      .then(res => res.json())
      .then(data => setAgencies(Array.isArray(data) ? data : []))
      .catch(() => setAgencies([]));

    // เชื่อมต่อ socket.io
    const socket = io('http://localhost:5000');
    socket.on('internship_update', (payload) => {
      // เมื่อมีการอัปเดตสถานะ ให้ดึงข้อมูลใหม่จาก backend
      fetch('http://localhost:5000/api/register/student/internship-requests')
        .then(res => res.json())
        .then(data => setRequests(Array.isArray(data) ? getLatestRequests(data) : []))
        .catch(() => setRequests([]));
      // ดึงข้อมูลหน่วยงานจาก tb_confirmed_agencies
      fetch('http://localhost:5000/api/register/student/available-agencies')
        .then(res => res.json())
        .then(data => setAgencies(Array.isArray(data) ? data : []))
        .catch(() => setAgencies([]));
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  // ฟังก์ชันแปลงวันที่และเวลาเป็นรูปแบบ 2025-09-02 14:11:12
  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const pad = n => n.toString().padStart(2, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hour = pad(d.getHours());
    const min = pad(d.getMinutes());
    const sec = pad(d.getSeconds());
    return `${year}-${month}-${day} ${hour}:${min}:${sec}`;
  };

  // status enums
  const applyStatus = [
    { label: 'รออนุมัติ', color: '#f39c12', icon: <FaHourglassHalf /> },
    { label: 'อนุมัติแล้ว', color: '#27ae60', icon: <FaCheckCircle /> },
    { label: 'ไม่อนุมัติ', color: '#e74c3c', icon: <FaTimesCircle /> },
  ];
  const workStatus = {
    'ยังไม่เริ่ม': { label: 'ยังไม่เริ่ม', color: '#bdc3c7', icon: <FaHourglassHalf /> },
    'กำลังฝึก': { label: 'กำลังฝึก', color: '#2980b9', icon: <FaPlayCircle /> },
    'พักการฝึกชั่วคราว': { label: 'พักการฝึก', color: '#f39c12', icon: <FaPauseCircle /> },
    'สิ้นสุดการฝึก': { label: 'สิ้นสุด', color: '#7f8c8d', icon: <FaStopCircle /> },
  };

  return (
    <div className="teacher-student-requests" style={{background:'#f8f9fa',padding:'2rem',borderRadius:'16px',boxShadow:'0 2px 12px rgba(44,62,80,0.08)',maxWidth:'1400px',margin:'2rem auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:'2.5rem'}}>
        <div>
          <h2 style={{color:'#16a085',display:'flex',alignItems:'center',gap:'0.7rem',marginBottom:'1rem'}}><FaUserGraduate style={{marginRight:6}}/> รายชื่อนักศึกษาขอเข้าฝึก</h2>
          <div style={{display:'flex',gap:'1rem',flexWrap:'wrap',marginTop:'0.5rem'}}>
            <input
              type="text"
              placeholder="ค้นหารหัสนักศึกษา"
              value={searchStudentId}
              onChange={e => setSearchStudentId(e.target.value)}
              style={{padding:'0.5rem 1rem',borderRadius:'8px',border:'1.5px solid #000000ff',fontSize:'1rem',minWidth:'160px'}}
            />
            <input
              type="text"
              placeholder="ค้นหาชื่อนามสกุล"
              value={searchStudentName}
              onChange={e => setSearchStudentName(e.target.value)}
              style={{padding:'0.5rem 1rem',borderRadius:'8px',border:'1.5px solid #000000ff',fontSize:'1rem',minWidth:'160px'}}
            />
            <input
              type="text"
              placeholder="ค้นหาหน่วยงาน"
              value={searchAgency}
              onChange={e => setSearchAgency(e.target.value)}
              style={{padding:'0.5rem 1rem',borderRadius:'8px',border:'1.5px solid #000000ff',fontSize:'1rem',minWidth:'160px'}}
            />
          </div>
        </div>
        {/* ช่องเลือกปีการศึกษาอยู่ด้านขวาและอยู่บนคอลัมน์วันที่สร้าง */}
        <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end'}}>
          <label htmlFor="year-select" style={{fontWeight:'bold',color:'#000000ff',marginBottom:'0.4rem'}}></label>
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
      {message && <div style={{marginBottom:'1rem',color:message.includes('สำเร็จ')?'#27ae60':'#e74c3c',fontWeight:'bold',textAlign:'center'}}>{message}</div>}
      <table style={{width:'100%',background:'#fff',borderRadius:'12px',boxShadow:'0 2px 8px rgba(44,62,80,0.08)',overflow:'hidden',fontSize:'1rem'}}>
        <thead style={{background:'#2979ff',color:'#fff'}}>
          <tr>
            <th style={{textAlign:'center'}}><FaUserGraduate style={{marginRight:4}}/> รหัสนักศึกษา</th>
            <th style={{textAlign:'center'}}><FaUserGraduate style={{marginRight:4}}/> ชื่อนามสกุล</th>
            <th style={{textAlign:'center'}}><FaBuilding style={{marginRight:4}}/> หน่วยงาน</th>
            <th style={{textAlign:'center'}}><FaCalendarAlt style={{marginRight:4}}/> วันทำการ</th>
            <th style={{textAlign:'center'}}><FaHourglassHalf style={{marginRight:4}}/> สถานะการสมัคร</th>
            <th style={{textAlign:'center'}}><FaPlayCircle style={{marginRight:4}}/> สถานะการฝึก</th>
            <th style={{textAlign:'center'}}><FaCalendarAlt style={{marginRight:4}}/> วันที่สร้าง</th>
          </tr>
        </thead>
        <tbody>
          {requests
            .filter(r => {
              // กรองตามปีการศึกษา (สมมติว่ามี field year หรือ created_at)
              if (selectedYear !== "ทั้งหมด") {
                const year = r.created_at ? new Date(r.created_at).getFullYear() + 543 : "";
                if (year.toString() !== selectedYear) return false;
              }
              // กรองตามรหัสนักศึกษา
              if (searchStudentId && !r.student_id.toString().includes(searchStudentId)) return false;
              // กรองตามชื่อนามสกุล
              if (searchStudentName && !r.student_name.toLowerCase().includes(searchStudentName.toLowerCase())) return false;
              // กรองตามหน่วยงาน
              const agency = agencies.find(a => a.open_id === r.open_id);
              if (searchAgency && (!agency || !agency.agency_name.toLowerCase().includes(searchAgency.toLowerCase()))) return false;
              return true;
            })
            .map((r,idx)=>(
            <tr key={r.request_id} style={{background:idx%2===0?'#f4f8fb':'#fff'}}>
              <td style={{textAlign:'center'}}>{r.student_id}</td>
              <td style={{textAlign:'center'}}>{r.student_name}</td>
              <td style={{textAlign:'center'}}>
                {(() => {
                  const agency = agencies.find(a => a.open_id === r.open_id);
                  if (!agency) return <span style={{color:'#bdc3c7'}}>ไม่พบข้อมูล</span>;
                  return (
                    <span>
                      <span style={{fontWeight:'bold',color:'#2979ff'}}>{agency.agency_name}</span>
                    </span>
                  );
                })()}
              </td>
              <td style={{textAlign:'center'}}>{r.schedule_day}</td>
              <td style={{textAlign:'center'}}>
                <span style={{
                  color: r.status==='รอการอนุมัติ'?'#f39c12':r.status==='อนุมัติแล้ว'?'#27ae60':'#e74c3c',
                  fontWeight:'bold',
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  gap:'0.3rem'
                }}>
                  {r.status==='รอการอนุมัติ'?<FaHourglassHalf/>:r.status==='อนุมัติแล้ว'?<FaCheckCircle/>:<FaTimesCircle/>} {r.status}
                </span>
                <div style={{marginTop:'0.5rem',display:'flex',gap:'0.5rem',justifyContent:'center'}}>
                  {(['รอการอนุมัติ','รออนุมัติ'].includes((r.status || '').replace(/\s/g,'').toLowerCase())) && (
                    <>
                      <button
                        onClick={()=>updateApplyStatus(r.request_id,'อนุมัติแล้ว')}
                        disabled={!!loading[r.request_id]}
                        style={{
                          background:'#27ae60',
                          color:'#fff',
                          border:'none',
                          borderRadius:'8px',
                          padding:'0.3rem 1rem',
                          fontWeight:'500',
                          fontSize:'0.95rem',
                          cursor:loading[r.request_id]?'not-allowed':'pointer',
                          display:'flex',
                          alignItems:'center',
                          gap:'0.5rem',
                          opacity:loading[r.request_id]?0.6:1
                        }}>
                        <FaCheckCircle /> อนุมัติ
                      </button>
                      <button
                        onClick={()=>updateApplyStatus(r.request_id,'ไม่อนุมัติ')}
                        disabled={!!loading[r.request_id]}
                        style={{
                          background:'#e74c3c',
                          color:'#fff',
                          border:'none',
                          borderRadius:'8px',
                          padding:'0.3rem 1rem',
                          fontWeight:'500',
                          fontSize:'0.95rem',
                          cursor:loading[r.request_id]?'not-allowed':'pointer',
                          display:'flex',
                          alignItems:'center',
                          gap:'0.5rem',
                          opacity:loading[r.request_id]?0.6:1
                        }}>
                        <FaTimesCircle /> ไม่อนุมัติ
                      </button>
                    </>
                  )}
                  {(r.status==='อนุมัติแล้ว'||r.status==='ไม่อนุมัติ') && (
                    <button
                      onClick={()=>cancelApplyStatus(r.request_id)}
                      disabled={!!loading[r.request_id]}
                      style={{
                        background:'#bdc3c7',
                        color:'#2c3e50',
                        border:'none',
                        borderRadius:'8px',
                        padding:'0.3rem 1rem',
                        fontWeight:'500',
                        fontSize:'0.95rem',
                        cursor:loading[r.request_id]?'not-allowed':'pointer',
                        display:'flex',
                        alignItems:'center',
                        gap:'0.5rem',
                        opacity:loading[r.request_id]?0.6:1
                      }}>
                      ยกเลิก
                    </button>
                  )}
                </div>
              </td>
              <td style={{textAlign:'center'}}>
                <span style={{color:r.training_status==='ยังไม่เริ่ม'?'#bdc3c7':r.training_status==='กำลังฝึก'?'#2980b9':r.training_status==='พักการฝึกชั่วคราว'?'#f39c12':'#7f8c8d',fontWeight:'bold',display:'flex',alignItems:'center',justifyContent:'center',gap:'0.3rem'}}>
                  {r.training_status==='ยังไม่เริ่ม'?<FaHourglassHalf/>:r.training_status==='กำลังฝึก'?<FaPlayCircle/>:r.training_status==='พักการฝึกชั่วคราว'?<FaPauseCircle/>:<FaStopCircle/>} {r.training_status}
                </span>
                <div style={{marginTop:'0.5rem',display:'flex',gap:'0.5rem',justifyContent:'center'}}>
                  {r.training_status==='ยังไม่เริ่ม' && <>
                    <button onClick={()=>updateTrainingStatus(r.request_id,'กำลังฝึก')} disabled={!!loading[r.request_id]} style={{background:'#2980b9',color:'#fff',border:'none',borderRadius:'8px',padding:'0.3rem 1rem',fontWeight:'500',fontSize:'0.95rem',cursor:loading[r.request_id]?'not-allowed':'pointer',display:'flex',alignItems:'center',gap:'0.5rem',opacity:loading[r.request_id]?0.6:1}}><FaPlayCircle /> กำลังฝึก</button>
                    <button onClick={()=>updateTrainingStatus(r.request_id,'พักการฝึกชั่วคราว')} disabled={!!loading[r.request_id]} style={{background:'#f39c12',color:'#fff',border:'none',borderRadius:'8px',padding:'0.3rem 1rem',fontWeight:'500',fontSize:'0.95rem',cursor:loading[r.request_id]?'not-allowed':'pointer',display:'flex',alignItems:'center',gap:'0.5rem',opacity:loading[r.request_id]?0.6:1}}><FaPauseCircle /> พักการฝึก</button>
                    <button onClick={()=>updateTrainingStatus(r.request_id,'สิ้นสุดการฝึก')} disabled={!!loading[r.request_id]} style={{background:'#7f8c8d',color:'#fff',border:'none',borderRadius:'8px',padding:'0.3rem 1rem',fontWeight:'500',fontSize:'0.95rem',cursor:loading[r.request_id]?'not-allowed':'pointer',display:'flex',alignItems:'center',gap:'0.5rem',opacity:loading[r.request_id]?0.6:1}}><FaStopCircle /> สิ้นสุด</button>
                  </>}
                  {(r.training_status==='กำลังฝึก'||r.training_status==='พักการฝึกชั่วคราว'||r.training_status==='สิ้นสุดการฝึก') && <button onClick={()=>cancelTrainingStatus(r.request_id)} disabled={!!loading[r.request_id]} style={{background:'#bdc3c7',color:'#2c3e50',border:'none',borderRadius:'8px',padding:'0.3rem 1rem',fontWeight:'500',fontSize:'0.95rem',cursor:loading[r.request_id]?'not-allowed':'pointer',display:'flex',alignItems:'center',gap:'0.5rem',opacity:loading[r.request_id]?0.6:1}}>ยกเลิก</button>}
                </div>
              </td>
              <td style={{textAlign:'center'}}>{r.created_at ? new Date(r.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'numeric', year: 'numeric' }) : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TeacherStudentRequests;

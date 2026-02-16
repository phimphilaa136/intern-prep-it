import React, { useState, useEffect } from 'react';
import { FaUserGraduate, FaBuilding, FaCalendarAlt, FaFilePdf, FaHourglassHalf, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

function TeacherCheckReport() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [searchStudentId, setSearchStudentId] = useState('');
  const [searchStudentName, setSearchStudentName] = useState('');
  const [selectedYear, setSelectedYear] = useState('ทั้งหมด');

  // ดึงข้อมูลรายงานทั้งหมดจาก backend
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('http://localhost:5000/api/student-report/all');
        if (!res.ok) throw new Error('ไม่สามารถดึงข้อมูลรายงาน');
        const data = await res.json();
        setReports(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };
    fetchReports();
  }, [message]);

  // PATCH สถานะรายงาน
  const handleStatus = async (report_id, status) => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`/api/register/teacher/student-report/${report_id}`, { // <== แก้ path ให้ตรงกับ backend
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('อัปเดตสถานะไม่สำเร็จ');
      setMessage('อัปเดตสถานะสำเร็จ');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const statusMap = {
    'รออนุมัติ': { color: '#f39c12', icon: <FaHourglassHalf /> },
    'อนุมัติแล้ว': { color: '#27ae60', icon: <FaCheckCircle /> },
    'ไม่ผ่าน': { color: '#e74c3c', icon: <FaTimesCircle /> },
  };

  // ฟิลเตอร์ข้อมูล
  const filteredReports = reports.filter(r => {
    // ปี พ.ศ.
    if (selectedYear !== 'ทั้งหมด') {
      const year = r.created_at ? new Date(r.created_at).getFullYear() + 543 : '';
      if (year.toString() !== selectedYear) return false;
    }
    // รหัสนักศึกษา
    if (searchStudentId && !r.student_id?.toString().includes(searchStudentId)) return false;
    // ชื่อนามสกุล
    if (searchStudentName && !r.student_name?.toLowerCase().includes(searchStudentName.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="teacher-check-report" style={{background:'#f8f9fa',padding:'0.5rem',borderRadius:'16px',boxShadow:'0 2px 12px rgba(44,62,80,0.08)',maxWidth:'1400px',margin:'2rem auto'}}>
      <h2 style={{marginBottom:'1.5rem',color:'#16a085',display:'flex',alignItems:'center',gap:'0.7rem'}}><FaFilePdf style={{marginRight:6}}/> ตรวจสอบเล่มรายงาน</h2>
      {error && <div style={{color:'#e74c3c',marginBottom:'1rem'}}>{error}</div>}
      {message && <div style={{color:'#27ae60',marginBottom:'1rem'}}>{message}</div>}
      {/* ช่องค้นหาและ dropdown อยู่บนคอลัมน์การดำเนินการ */}
      <div style={{
        display:'flex',
        justifyContent:'space-between',
        alignItems:'center',
        marginBottom:'1rem',
        flexWrap:'wrap'
      }}>
        <div style={{display:'flex',gap:'1rem',flexWrap:'wrap'}}>
          <input
            type="text"
            placeholder="ค้นหารหัสนักศึกษา"
            value={searchStudentId}
            onChange={e => setSearchStudentId(e.target.value)}
            style={{padding:'0.4rem 1.2rem',borderRadius:'8px',border:'1.5px solid #000000ff',fontSize:'1.08rem',minWidth:'180px'}}
          />
          <input
            type="text"
            placeholder="ค้นหาชื่อนามสกุล"
            value={searchStudentName}
            onChange={e => setSearchStudentName(e.target.value)}
            style={{padding:'0.4rem 1.2rem',borderRadius:'8px',border:'1.5px solid #000000ff',fontSize:'1.08rem',minWidth:'180px'}}
          />
          {/* ลบช่องค้นหาหน่วยงานออก */}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'0.7rem'}}>
          <label htmlFor="year-select" style={{fontWeight:'bold',color:'#000000ff'}}></label>
          <select
            id="year-select"
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            style={{padding:'0.4rem 1.2rem',borderRadius:'8px',border:'1.5px solid #000000ff',fontSize:'1.08rem'}}
          >
            <option value="ทั้งหมด">ทั้งหมด</option>
            <option value="2566">2566</option>
            <option value="2567">2567</option>
            <option value="2568">2568</option>
          </select>
        </div>
      </div>
      <table style={{width:'100%',background:'#fff',borderRadius:'12px',boxShadow:'0 2px 8px rgba(44,62,80,0.08)',overflow:'hidden',fontSize:'1rem'}}>
        <thead style={{background:'#2979ff',color:'#fff'}}>
          <tr>
            <th style={{textAlign:'center'}}><FaUserGraduate style={{marginRight:4}}/> รหัสนักศึกษา</th>
            <th style={{textAlign:'center'}}><FaUserGraduate style={{marginRight:4}}/> ชื่อนามสกุล</th>
            <th style={{textAlign:'center'}}><FaCalendarAlt style={{marginRight:4}}/> วันที่ส่ง</th>
            <th style={{textAlign:'center'}}><FaFilePdf style={{marginRight:4}}/> ไฟล์รายงาน</th>
            <th style={{textAlign:'center'}}><FaHourglassHalf style={{marginRight:4}}/> สถานะ</th>
            <th style={{textAlign:'center'}}>การดำเนินการ</th>
          </tr>
        </thead>
        <tbody>
          {filteredReports.map((r,idx)=>(
            <tr key={r.report_id || idx} style={{background:idx%2===0?'#f4f8fb':'#fff'}}>
              <td style={{textAlign:'center'}}>{r.student_id}</td>
              <td style={{textAlign:'center'}}>{r.student_name}</td>
              <td style={{textAlign:'center'}}>{r.created_at ? new Date(r.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'numeric', year: 'numeric' }) : '-'}</td>
              <td style={{textAlign:'center'}}>
                {r.report_file ? (
                  <a
                    href={r.report_file_url ? r.report_file_url : `http://localhost:5000/uploads/reports/${encodeURIComponent(r.report_file)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    style={{
                      color:'#e74c3c',
                      fontWeight:'bold',
                      textDecoration:'none',
                      display:'flex',
                      alignItems:'center',
                      gap:'0.4rem'
                    }}
                  >
                    <FaFilePdf /> ดาวน์โหลด
                  </a>
                ) : (
                  <span style={{color:'#bdc3c7'}}>ไม่มีไฟล์</span>
                )}
              </td>
              <td style={{textAlign:'center'}}>
                <span style={{color:statusMap[r.status]?.color,fontWeight:'bold',display:'flex',alignItems:'center',justifyContent:'center',gap:'0.3rem'}}>{statusMap[r.status]?.icon} {r.status}</span>
              </td>
              <td style={{textAlign:'center'}}>
                {r.status==='รออนุมัติ' && (
                  <>
                    <button onClick={()=>handleStatus(r.report_id,'อนุมัติแล้ว')} disabled={loading} style={{background:'#27ae60',color:'#fff',border:'none',borderRadius:'8px',padding:'0.4rem 1rem',fontWeight:'500',fontSize:'0.95rem',cursor:loading?'not-allowed':'pointer',marginRight:'0.5rem',display:'flex',alignItems:'center',gap:'0.5rem'}}><FaCheckCircle /> อนุมัติ</button>
                    <button onClick={()=>handleStatus(r.report_id,'ไม่ผ่าน')} disabled={loading} style={{background:'#e74c3c',color:'#fff',border:'none',borderRadius:'8px',padding:'0.4rem 1rem',fontWeight:'500',fontSize:'0.95rem',cursor:loading?'not-allowed':'pointer',display:'flex',alignItems:'center',gap:'0.5rem'}}><FaTimesCircle /> ไม่ผ่าน</button>
                  </>
                )}
                {r.status==='อนุมัติแล้ว' && (
                  <span style={{background:'#27ae60',color:'#fff',borderRadius:'8px',padding:'0.4rem 1rem',fontWeight:'500',fontSize:'0.95rem',display:'flex',alignItems:'center',gap:'0.5rem'}}><FaCheckCircle /> อนุมัติแล้ว</span>
                )}
                {r.status==='ไม่ผ่าน' && (
                  <span style={{background:'#e74c3c',color:'#fff',borderRadius:'8px',padding:'0.4rem 1rem',fontWeight:'500',fontSize:'0.95rem',display:'flex',alignItems:'center',gap:'0.5rem'}}><FaTimesCircle /> ไม่ผ่าน</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TeacherCheckReport;

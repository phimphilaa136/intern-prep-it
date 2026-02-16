import React, { useState, useEffect } from 'react';
import { FaBuilding, FaCheckCircle, FaTimesCircle, FaMapMarkerAlt, FaPhoneAlt, FaCalendarAlt, FaSyncAlt, FaPaperPlane } from 'react-icons/fa';

function TeacherAgencyList() {
  // ตรวจสอบว่า agency ถูกยืนยันแล้วหรือยัง
  const isConfirmed = (agency) => confirmedAgencies.some(c => c.open_id === agency.open_id);

  // ฟังก์ชันยกเลิกการยืนยัน
  const handleCancelConfirm = (agency) => {
    fetch(`http://localhost:5000/api/register/teacher/cancel-confirm-agency/${agency.open_id}`, {
      method: 'DELETE',
    })
    .then(res => res.json())
    .then(data => {
      setShowAlert({
        type: 'success',
        message: 'ยกเลิกการส่งข้อมูลหน่วยงานเรียบร้อยแล้ว'
      });
      // รีเฟรช confirmedAgencies
      fetch('http://localhost:5000/api/register/student/available-agencies')
        .then(res => res.json())
        .then(data => setConfirmedAgencies(Array.isArray(data) ? data : []));
      setSelectedIdx(null);
      setTimeout(() => setShowAlert(null), 2500);
    })
    .catch(() => {
      setShowAlert({
        type: 'error',
        message: 'เกิดข้อผิดพลาดในการยกเลิกข้อมูล'
      });
      setTimeout(() => setShowAlert(null), 2500);
    });
  };
  const [agencies, setAgencies] = useState([]);
  const [confirmedAgencies, setConfirmedAgencies] = useState([]);
  const [selectedConfirmed, setSelectedConfirmed] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [searchAgencyName, setSearchAgencyName] = useState('');
  const [searchSemester, setSearchSemester] = useState('');
  const [searchYear, setSearchYear] = useState('');
  useEffect(() => {
  fetch('http://localhost:5000/api/register/teacher/open-for-students')
      .then(res => res.json())
      .then(data => setAgencies(Array.isArray(data) ? data : []))
      .catch(() => setAgencies([]));
    // ดึงข้อมูลที่อาจารย์ยืนยันแล้ว
  fetch('http://localhost:5000/api/register/student/available-agencies')
      .then(res => res.json())
      .then(data => setConfirmedAgencies(Array.isArray(data) ? data : []))
      .catch(() => setConfirmedAgencies([]));
  }, []);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [showAlert, setShowAlert] = useState(null);

  const handleConfirm = (agency) => {
    fetch('http://localhost:5000/api/register/teacher/confirm-agency', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        open_id: agency.open_id,
        agency_name: agency.agency_name,
        capacity: agency.capacity,
        address: agency.address, // เปลี่ยนจาก location เป็น address
        phone_number: agency.phone_number
      })
    })
    .then(res => res.json())
    .then(data => {
      setShowAlert({
        type: 'success',
        message: 'ยืนยันการส่งหน่วยงานเรียบร้อยแล้ว'
      });
      fetch('http://localhost:5000/api/register/student/available-agencies')
        .then(res => res.json())
        .then(data => setConfirmedAgencies(Array.isArray(data) ? data : []));
      setSelectedIdx(null);
      setTimeout(() => setShowAlert(null), 2500);
    })
    .catch(() => {
      setShowAlert({
        type: 'error',
        message: 'เกิดข้อผิดพลาดในการส่งข้อมูล'
      });
      setTimeout(() => setShowAlert(null), 2500);
    });
  };

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

  // กรองข้อมูลตามปีการศึกษาและช่องค้นหา
  const filteredAgencies = agencies.filter(a =>
    (selectedYear ? String(a.student_year) === selectedYear : true) &&
    (searchAgencyName ? a.agency_name?.toLowerCase().includes(searchAgencyName.toLowerCase()) : true) &&
    (searchSemester ? String(a.student_semester) === searchSemester : true) &&
    (searchYear ? String(a.student_year) === searchYear : true)
  );

  return (
    <div className="teacher-agency-list" style={{background:'#f8f9fa',padding:'2rem',borderRadius:'16px',boxShadow:'0 2px 12px rgba(44,62,80,0.08)',maxWidth:'1400px',margin:'2rem auto',position:'relative'}}>
      {/* แจ้งเตือนสวยงาม */}
      {showAlert && (
        <div style={{
          position:'fixed',
          top:'2.5rem',
          right:'2.5rem',
          zIndex:9999,
          background: showAlert.type === 'success' ? 'linear-gradient(90deg,#16a085 80%,#1abc9c 100%)' : 'linear-gradient(90deg,#e74c3c 80%,#c0392b 100%)',
          color:'#fff',
          borderRadius:'14px',
          boxShadow:'0 2px 12px rgba(44,62,80,0.12)',
          padding:'1rem 2.2rem',
          fontWeight:'bold',
          fontSize:'1.08rem',
          display:'flex',
          alignItems:'center',
          gap:'0.8rem'
        }}>
          {showAlert.type === 'success'
            ? <FaCheckCircle size={22} style={{marginRight:8}}/>
            : <FaTimesCircle size={22} style={{marginRight:8}}/>
          }
          {showAlert.message}
        </div>
      )}
      <h2 style={{marginBottom:'1.5rem',color:'#16a085',display:'flex',alignItems:'center',gap:'0.7rem'}}><FaBuilding style={{marginRight:6}}/> รายชื่อหน่วยงานที่เปิดรับ</h2>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.5rem',gap:'1rem'}}>
        {/* ช่องค้นหาอยู่ด้านซ้าย */}
        <div style={{display:'flex',gap:'1rem',alignItems:'center'}}>
          <label style={{fontWeight:'bold'}}>
            <input
              type="text"
              value={searchAgencyName}
              onChange={e => setSearchAgencyName(e.target.value)}
              placeholder="ชื่อหน่วยงาน"
              style={{marginLeft:'0.5rem',padding:'0.4rem 1.2rem',borderRadius:'8px',border:'1.5px solid #000000ff',width:'220px',fontSize:'1.08rem'}}
            />
          </label>
          <label style={{fontWeight:'bold'}}>
            <input
              type="text"
              value={searchSemester}
              onChange={e => setSearchSemester(e.target.value)}
              placeholder="ภาคเรียน"
              style={{marginLeft:'0.5rem',padding:'0.4rem 1.2rem',borderRadius:'8px',border:'1.5px solid #000000ff',width:'140px',fontSize:'1.08rem'}}
            />
          </label>
          <label style={{fontWeight:'bold'}}>
            <input
              type="text"
              value={searchYear}
              onChange={e => setSearchYear(e.target.value)}
              placeholder="ปีการศึกษา"
              style={{marginLeft:'0.5rem',padding:'0.4rem 1.2rem',borderRadius:'8px',border:'1.5px solid #000000ff',width:'140px',fontSize:'1.08rem'}}
            />
          </label>
        </div>
        {/* ช่องเลือกปีการศึกษาอยู่ด้านขวา */}
        <div style={{display:'flex',alignItems:'center',gap:'0.7rem'}}>
          <label style={{marginRight:'0.7rem',fontWeight:'bold'}}></label>
          <select value={selectedYear} onChange={e=>setSelectedYear(e.target.value)} style={{padding:'0.4rem 1.5rem',borderRadius:'8px',border:'1.5px solid #ccc',fontWeight:'bold',fontSize:'1.08rem'}}>
            <option value="">ทั้งหมด</option>
            <option value="2566">2566</option>
            <option value="2567">2567</option>
            <option value="2568">2568</option>
          </select>
        </div>
      </div>
      <table style={{width:'100%',background:'#fff',borderRadius:'12px',boxShadow:'0 2px 8px rgba(44,62,80,0.08)',overflow:'hidden',fontSize:'1rem'}}>
        <thead style={{background:'#2979ff',color:'#fff'}}>
          <tr>
            <th style={{textAlign:'center'}}><FaCheckCircle style={{marginRight:4}}/> สถานะ</th>
            <th style={{textAlign:'center'}}><FaBuilding style={{marginRight:4}}/> ชื่อหน่วยงาน</th>
            <th style={{textAlign:'center'}}>ภาคเรียน</th>
            <th style={{textAlign:'center'}}>ปีการศึกษา</th>
            <th style={{textAlign:'center'}}><FaCheckCircle style={{marginRight:4}}/> จำนวนรับฝึกงาน</th>
            <th style={{textAlign:'center'}}><FaMapMarkerAlt style={{marginRight:4}}/> ที่อยู่</th>
            <th style={{textAlign:'center'}}><FaPhoneAlt style={{marginRight:4}}/> เบอร์โทร</th>
            <th style={{textAlign:'center'}}><FaCalendarAlt style={{marginRight:4}}/> วันที่สร้าง</th>
            <th style={{textAlign:'center'}}><FaSyncAlt style={{marginRight:4}}/> อัปเดตล่าสุด</th>
            <th style={{textAlign:'center'}}>การดำเนินการ</th>
          </tr>
        </thead>
        <tbody>
          {filteredAgencies.map((a, idx) => (
            <tr key={a.open_id ? a.open_id : `row-${idx}`} style={{background:idx%2===0?'#f4f8fb':'#fff'}}>
              <td style={{textAlign:'center',fontWeight:'bold',color:a.status==='1'?'#16a085':'#bdc3c7'}}>
                {a.status === '1' ? <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'0.3rem'}}><FaCheckCircle/> เปิดรับ</span> : <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'0.3rem'}}>ไม่เปิดรับ</span>}
              </td>
              <td style={{textAlign:'center'}}>{a.agency_name}</td>
              <td style={{textAlign:'center'}}>{a.student_semester}</td>
              <td style={{textAlign:'center'}}>{a.student_year}</td>
              <td style={{textAlign:'center'}}>{a.capacity}</td>
              <td style={{textAlign:'center'}}>{a.address}</td> {/* เปลี่ยนจาก a.location เป็น a.address */}
              <td style={{textAlign:'center'}}>{a.phone_number}</td>
              <td style={{textAlign:'center'}}>{a.created_at ? new Date(a.created_at).toLocaleString('th-TH') : '-'}</td>
              <td style={{textAlign:'center'}}>{a.updated_at ? new Date(a.updated_at).toLocaleString('th-TH') : '-'}</td>
              <td style={{textAlign:'center'}}>
                {isConfirmed(a)
                  ? <button onClick={()=>handleCancelConfirm(a)} style={{background:'#e74c3c',color:'#fff',border:'none',borderRadius:'8px',padding:'0.4rem 1rem',fontWeight:'500',fontSize:'0.95rem',cursor:'pointer',display:'flex',alignItems:'center',gap:'0.5rem'}}><FaTimesCircle /> ยกเลิกการส่งข้อมูล</button>
                  : <button onClick={()=>setSelectedIdx(idx)} style={{background:'#2979ff',color:'#fff',border:'none',borderRadius:'8px',padding:'0.4rem 1rem',fontWeight:'500',fontSize:'0.95rem',cursor:'pointer',display:'flex',alignItems:'center',gap:'0.5rem'}}><FaPaperPlane /> ส่งข้อมูลหน่วยงาน</button>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedIdx!==null && (
        <div style={{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',zIndex:1000,background:'#fff',borderRadius:'12px',boxShadow:'0 2px 16px rgba(44,62,80,0.18)',padding:'2rem',maxWidth:'400px',width:'95vw',maxHeight:'90vh',overflow:'auto'}}>
          <h3 style={{marginBottom:'1rem',color:'#2979ff',textAlign:'center'}}><FaPaperPlane style={{marginRight:6}}/> ส่งข้อมูลหน่วยงาน</h3>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
            <div style={{fontWeight:'bold'}}>ชื่อหน่วยงาน:</div>
            <div>{agencies[selectedIdx].agency_name}</div>
            <div style={{fontWeight:'bold'}}>จำนวนรับฝึกงาน:</div>
            <div>{agencies[selectedIdx].capacity}</div>
            <div style={{fontWeight:'bold'}}>ที่อยู่:</div>
            <div>{agencies[selectedIdx].address}</div> {/* เปลี่ยนจาก location เป็น address */}
            <div style={{fontWeight:'bold'}}>เบอร์โทร:</div>
            <div>{agencies[selectedIdx].phone_number}</div>
            <div style={{fontWeight:'bold'}}>วันที่สร้าง:</div>
            <div>{formatDateTime(agencies[selectedIdx].created_at)}</div>
            <div style={{fontWeight:'bold'}}>อัปเดตล่าสุด:</div>
            <div>{formatDateTime(agencies[selectedIdx].updated_at)}</div>
          </div>
          <div style={{display:'flex',gap:'1rem',marginTop:'1.5rem',justifyContent:'center'}}>
            <button onClick={()=>setSelectedIdx(null)} style={{background:'#bdc3c7',color:'#2c3e50',border:'none',borderRadius:'8px',padding:'0.7rem 1.5rem',fontWeight:'500',fontSize:'1rem',cursor:'pointer'}}>ปิด</button>
            {isConfirmed(agencies[selectedIdx])
              ? <button onClick={()=>handleCancelConfirm(agencies[selectedIdx])}
                  style={{background:'#e74c3c',color:'#fff',border:'none',borderRadius:'8px',padding:'0.7rem 1.5rem',fontWeight:'500',fontSize:'1rem',cursor:'pointer',display:'flex',alignItems:'center',gap:'0.5rem'}}>
                  <FaTimesCircle /> ยกเลิกการส่งข้อมูล
                </button>
              : <button onClick={async ()=>{
                  await handleConfirm(agencies[selectedIdx]);
                  // ดึงข้อมูลยืนยันใหม่ทันทีหลังยืนยัน
                  await fetch('http://localhost:5000/api/register/student/available-agencies')
                    .then(res => res.json())
                    .then(data => setConfirmedAgencies(Array.isArray(data) ? data : []));
                  // modal ยังเปิดอยู่ ปุ่มจะเปลี่ยนทันที
                }}
                style={{background:'#2979ff',color:'#fff',border:'none',borderRadius:'8px',padding:'0.7rem 1.5rem',fontWeight:'500',fontSize:'1rem',cursor:'pointer',display:'flex',alignItems:'center',gap:'0.5rem'}}>
                <FaPaperPlane /> ยืนยันส่งข้อมูล
              </button>
            }
          </div>
        </div>
      )}
      {selectedIdx!==null && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(44,62,80,0.15)',zIndex:999}} onClick={()=>setSelectedIdx(null)}></div>
      )}
    </div>
  );
}

export default TeacherAgencyList;

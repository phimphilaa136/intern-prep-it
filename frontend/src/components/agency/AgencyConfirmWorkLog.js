import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaUserGraduate, FaClipboardList, FaClock, FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaExclamationCircle } from 'react-icons/fa';

function AgencyConfirmWorkLog() {
  // ฟังก์ชันแปลงวันที่เป็น วัน/เดือน/ปี พ.ศ.
  const formatThaiDate = (dateStr) => {
    if (!dateStr) return '';
    // ใช้เวลาท้องถิ่นของเครื่องผู้ใช้ ไม่บวก 7 ชั่วโมงเอง
    const d = new Date(dateStr);
    if (isNaN(d)) return '';
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear() + 543;
    return `${day}/${month.toString().padStart(2, '0')}/${year}`;
  };
  const [logs, setLogs] = useState([]);
  const [selectedYear, setSelectedYear] = useState('ทั้งหมด');
  // เพิ่ม state สำหรับแจ้งเตือนแบบสวยงาม
  const [alert, setAlert] = useState({ show: false, type: '', message: '', onConfirm: null });

  useEffect(() => {
    const username = localStorage.getItem('username');
    if (!username) return;
    fetch(`http://localhost:5000/api/agency/student-work-logs?username=${encodeURIComponent(username)}`)
      .then(res => res.json())
      .then(data => {
        setLogs(Array.isArray(data) ? data : []);
      });
  }, []);

  const statusIcon = status => {
    if (status === 'ยืนยันแล้ว') return <FaCheckCircle style={{color:'#16a085'}} title="ยืนยันแล้ว"/>;
    if (status === 'รอดำเนินการ') return <FaHourglassHalf style={{color:'#f39c12'}} title="รอดำเนินการ"/>;
    return <FaTimesCircle style={{color:'#e74c3c'}} title="ปฏิเสธ"/>;
  };

  const statusColor = status => {
    if (status === 'ยืนยันแล้ว') return '#16a085';
    if (status === 'รอดำเนินการ') return '#f39c12';
    return '#e74c3c';
  };

  // ฟังก์ชันยืนยัน work log แบบใหม่
  const handleConfirmLog = async (student_id, work_date) => {
    setAlert({
      show: true,
      type: 'confirm',
      message: 'คุณต้องการยืนยันการปฏิบัติงานนี้ใช่หรือไม่?',
      onConfirm: async () => {
        const username = localStorage.getItem('username');
        const dateOnly = work_date ? work_date.slice(0, 10) : '';
        try {
          const res = await fetch(`http://localhost:5000/api/agency/student-work-logs/${student_id}/${dateOnly}?username=${encodeURIComponent(username)}`, {
            method: 'PATCH',
          });
          if (res.ok) {
            setLogs(logs.map(l => (l.student_id === student_id && l.work_date === work_date ? { ...l, status: 'ยืนยันแล้ว' } : l)));
            setAlert({
              show: true,
              type: 'success',
              message: 'ยืนยันการปฏิบัติงานสำเร็จ',
              onConfirm: null
            });
          } else {
            setAlert({
              show: true,
              type: 'error',
              message: 'เกิดข้อผิดพลาดในการยืนยัน',
              onConfirm: null
            });
          }
        } catch (err) {
          setAlert({
            show: true,
            type: 'error',
            message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
            onConfirm: null
          });
        }
      }
    });
  };

  // ฟังก์ชันปิดการแจ้งเตือน
  const handleCloseAlert = () => {
    setAlert({ show: false, type: '', message: '', onConfirm: null });
  };

  // ฟังก์ชันยืนยันการแจ้งเตือน (สำหรับกรณีมีฟังก์ชัน onConfirm)
  const handleConfirmAlert = () => {
    if (alert.onConfirm) {
      alert.onConfirm();
    }
    handleCloseAlert();
  };

  // ฟิลเตอร์ข้อมูลตามปีที่เลือก
  const filteredLogs = selectedYear === 'ทั้งหมด'
    ? logs
    : logs.filter(l => {
        const year = l.work_date ? new Date(l.work_date).getFullYear() + 543 : '';
        return year.toString() === selectedYear;
      });

  return (
    <div className="agency-confirm-work-log" style={{background:'#f8f9fa',padding:'2rem',borderRadius:'16px',boxShadow:'0 2px 12px rgba(44,62,80,0.08)'}}>
      <h2 style={{marginBottom:'1.5rem',color:'#16a085',display:'flex',alignItems:'center',gap:'0.7rem'}}><FaClipboardList style={{marginRight:6}}/> ยืนยันการปฏิบัติงานของนักศึกษา</h2>
      {/* ช่องเลือกปีอยู่ด้านขวาบนตารางคอลัมน์ยืนยัน */}
      <div style={{display:'flex',justifyContent:'flex-end',alignItems:'center',marginBottom:'1rem'}}>
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
      <table style={{width:'100%',background:'#fff',borderRadius:'12px',boxShadow:'0 2px 8px rgba(44,62,80,0.08)',overflow:'hidden',fontSize:'0.9rem'}}>
        <thead style={{background:'#16a085',color:'#fff'}}>
          <tr>
            <th><FaCalendarAlt style={{marginRight:4}}/> วันที่</th>
            <th><FaUserGraduate style={{marginRight:4}}/> รหัสนักศึกษา</th>
            <th><FaUserGraduate style={{marginRight:4}}/> ชื่อนามสกุล</th>
            <th><FaUserGraduate style={{marginRight:4}}/> หน่วยงาน</th>
            <th><FaClipboardList style={{marginRight:4}}/> รายงานการปฏิบัติงาน</th>
            <th><FaClock style={{marginRight:4}}/> เวลามา</th>
            <th><FaClock style={{marginRight:4}}/> เวลากลับ</th>
            <th><FaClock style={{marginRight:4}}/> ชั่วโมง</th>
            <th><FaExclamationCircle style={{marginRight:4}}/> ปัญหาที่พบและการแก้ไข</th>
            <th>สถานะ</th>
            <th>ยืนยัน</th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.map((l,i) => (
            <tr key={l.student_id + l.work_date} style={{background:i%2===0?'#f4f8fb':'#fff'}}>
              <td style={{textAlign:'center'}}>{formatThaiDate(l.work_date || l.created_at)}</td>
              <td style={{textAlign:'center'}}>{l.student_id}</td>
              <td style={{textAlign:'center'}}>{l.student_name}</td>
              <td style={{textAlign:'center'}}>{l.agency_name}</td>
              <td style={{textAlign:'center'}}>{l.work_report}</td>
              <td style={{textAlign:'center'}}>{l.checkin_time}</td>
              <td style={{textAlign:'center'}}>{l.checkout_time}</td>
              <td style={{textAlign:'center'}}>{l.hours_worked}</td>
              <td style={{textAlign:'center'}}>{l.problem}</td>
              <td style={{fontWeight:'bold',color:statusColor(l.status),textAlign:'center'}}>{statusIcon(l.status)} <span style={{marginLeft:6}}>{l.status}</span></td>
              <td style={{textAlign:'center'}}>
                {l.status === 'รอดำเนินการ' ? (
                  <button onClick={()=>handleConfirmLog(l.student_id, l.work_date)} style={{background:'#16a085',color:'#fff',border:'none',borderRadius:'8px',padding:'0.5rem 1rem',fontWeight:'500',fontSize:'0.95rem',cursor:'pointer'}}>ยืนยัน</button>
                ) : (
                  <button style={{background:'#bdc3c7',color:'#2c3e50',border:'none',borderRadius:'8px',padding:'0.5rem 1rem',fontWeight:'500',fontSize:'0.95rem',cursor:'not-allowed'}} disabled>ยืนยัน</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ส่วนแจ้งเตือนแบบ modal สวยงาม */}
      {alert.show && (
        <div style={{
          position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(44,62,80,0.18)',zIndex:9999,
          display:'flex',alignItems:'center',justifyContent:'center'
        }}>
          <div style={{
            background:'#fff',borderRadius:'16px',boxShadow:'0 2px 16px rgba(44,62,80,0.18)',padding:'2rem 2.5rem',
            minWidth:'320px',maxWidth:'90vw',textAlign:'center',position:'relative'
          }}>
            {alert.type === 'confirm' && (
              <>
                <FaHourglassHalf size={38} style={{color:'#f39c12',marginBottom:'1rem'}} />
                <div style={{fontSize:'1.15rem',fontWeight:'500',marginBottom:'1.5rem',color:'#2c3e50'}}>{alert.message}</div>
                <div style={{display:'flex',gap:'1rem',justifyContent:'center'}}>
                  <button
                    onClick={() => { setAlert({ show: false }); alert.onConfirm && alert.onConfirm(); }}
                    style={{background:'#16a085',color:'#fff',border:'none',borderRadius:'8px',padding:'0.7rem 1.5rem',fontWeight:'500',fontSize:'1rem',cursor:'pointer'}}
                  >ยืนยัน</button>
                  <button
                    onClick={() => setAlert({ show: false })}
                    style={{background:'#bdc3c7',color:'#2c3e50',border:'none',borderRadius:'8px',padding:'0.7rem 1.5rem',fontWeight:'500',fontSize:'1rem',cursor:'pointer'}}
                  >ยกเลิก</button>
                </div>
              </>
            )}
            {alert.type === 'success' && (
              <>
                <FaCheckCircle size={38} style={{color:'#16a085',marginBottom:'1rem'}} />
                <div style={{fontSize:'1.15rem',fontWeight:'500',marginBottom:'1.5rem',color:'#16a085'}}>{alert.message}</div>
                <button
                  onClick={() => setAlert({ show: false })}
                  style={{background:'#2979ff',color:'#fff',border:'none',borderRadius:'8px',padding:'0.7rem 1.5rem',fontWeight:'500',fontSize:'1rem',cursor:'pointer'}}
                >ปิด</button>
              </>
            )}
            {alert.type === 'error' && (
              <>
                <FaExclamationCircle size={38} style={{color:'#e74c3c',marginBottom:'1rem'}} />
                <div style={{fontSize:'1.15rem',fontWeight:'500',marginBottom:'1.5rem',color:'#e74c3c'}}>{alert.message}</div>
                <button
                  onClick={() => setAlert({ show: false })}
                  style={{background:'#e74c3c',color:'#fff',border:'none',borderRadius:'8px',padding:'0.7rem 1.5rem',fontWeight:'500',fontSize:'1rem',cursor:'pointer'}}
                >ปิด</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AgencyConfirmWorkLog;

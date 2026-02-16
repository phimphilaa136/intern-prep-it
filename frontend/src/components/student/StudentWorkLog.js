import React, { useState, useEffect, useRef } from 'react';
import { FaCalendarAlt, FaUserGraduate, FaClipboardList, FaClock, FaExclamationCircle, FaHourglassHalf, FaCheckCircle, FaPlus, FaBuilding, FaRegClock, FaRegHourglass, FaPrint } from 'react-icons/fa';

function StudentWorkLog() { 
  // ดึงข้อมูล student_id, student_name, agency_name จาก tb_internship_enrollment
  useEffect(() => {
    const currentStudentId = localStorage.getItem('student_id');
    if (currentStudentId) {
      fetch(`http://localhost:5000/api/register/student/internship-requests?student_id=${currentStudentId}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            // หา agency_name ล่าสุดที่ไม่ว่าง
            const latest = data.find(d => d.agency_name && d.agency_name.trim() !== '');
            setForm(f => ({
              ...f,
              student_id: (latest ? latest.student_id : data[0].student_id) || '',
              student_name: (latest ? latest.student_name : data[0].student_name) || '',
              agency_name: (latest ? latest.agency_name : '')
            }));
          }
        })
        .catch(() => {});
    }
  }, []);
  // ฟังก์ชันสำหรับปริ๊น/ดาวน์โหลด PDF เฉพาะตาราง
  const tableRef = useRef();
  const handlePrint = () => {
    // สร้าง HTML เฉพาะตารางโดยไม่รวมคอลัมน์ "แก้ไข"
    const tableHtml = `
      <table style="width:100%;border-collapse:collapse;font-size:1rem;">
        <thead style="background:#2979ff;color:#fff;">
          <tr>
            <th style="text-align:center;">วันที่</th>
            <th style="text-align:center;">รหัสนักศึกษา</th>
            <th style="text-align:center;">ชื่อนามสกุล</th>
            <th style="text-align:center;">ชื่อหน่วยงาน</th>
            <th style="text-align:center;">รายงานการปฏิบัติงาน</th>
            <th style="text-align:center;">เวลามา</th>
            <th style="text-align:center;">เวลากลับ</th>
            <th style="text-align:center;">ชั่วโมง</th>
            <th style="text-align:center;">ปัญหาที่พบและการแก้ไข</th>
            <th style="text-align:center;">สถานะ</th>
          </tr>
        </thead>
        <tbody>
          ${logs.map(l => `
            <tr>
              <td style="text-align:center;">${formatThaiDate(l.date)}</td>
              <td style="text-align:center;">${l.student_id}</td>
              <td style="text-align:center;">${l.student_name}</td>
              <td style="text-align:center;">${l.agency_name}</td>
              <td style="text-align:center;">${l.work_report}</td>
              <td style="text-align:center;">${l.time_in}</td>
              <td style="text-align:center;">${l.time_out}</td>
              <td style="text-align:center;">${l.hours}</td>
              <td style="text-align:center;">${l.problem}</td>
              <td style="text-align:center;">${l.status}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    const printWindow = window.open('', '', 'height=900,width=1200');
    printWindow.document.write(`
      <html>
        <head>
          <title>ตารางบันทึกการปฏิบัติงาน</title>
          <style>
            body { font-family: 'Sarabun', Arial, sans-serif; background: #fff; margin: 0; }
            table { width: 100%; border-collapse: collapse; font-size: 1rem; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
            th { background: #2979ff; color: #fff; }
            tr:nth-child(even) { background: #f4f8fb; }
            tr:nth-child(odd) { background: #fff; }
            h3 { color: #2979ff; margin-bottom: 1rem; }
          </style>
        </head>
        <body>
          <h3>ตารางบันทึกการปฏิบัติงาน</h3>
          ${tableHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };
  // ดึงข้อมูลนักศึกษาจาก localStorage
  const student_id = localStorage.getItem('student_id');
  console.log('student_id from localStorage:', student_id); // debug
  const [logs, setLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const student_name = localStorage.getItem('student_name') || '';
  const [form, setForm] = useState({
    date: '',
    student_id: student_id || '',
    student_name: student_name,
    agency_name: '',
    work_report: '',
    time_in: '',
    time_out: '',
    hours: '',
    problem: '',
    status: 'รอดำเนินการ',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // --- State สำหรับแก้ไข log ---
  const [editIdx, setEditIdx] = useState(null);
  const [editLog, setEditLog] = useState(null);

  // --- ฟังก์ชันแก้ไข log ---
  const handleEditLog = idx => {
    setEditIdx(idx);
    setEditLog({...logs[idx]});
  };
  const handleEditLogChange = e => {
    setEditLog({ ...editLog, [e.target.name]: e.target.value });
  };
  const handleEditLogSave = async () => {
    setLoading(true);
    setError('');
    try {
      const logId = editLog.log_id || editLog.id || editLog.work_log_id;
      if (!logId) {
        setError('ไม่พบรหัส log สำหรับแก้ไข');
        setLoading(false);
        return;
      }
      // เพิ่ม agency_name ใน payload
      const payload = {
        agency_name: editLog.agency_name,
        work_report: editLog.work_report,
        checkin_time: editLog.time_in,
        checkout_time: editLog.time_out,
        hours_worked: Number(editLog.hours),
        problem: editLog.problem,
        status: editLog.status
      };
      const res = await fetch(`/api/student-work-log/${logId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('แก้ไขข้อมูลไม่สำเร็จ');
      // ดึงข้อมูลใหม่
      const getRes = await fetch(`/api/student-work-log?student_id=${student_id}`);
      const data = await getRes.json();
      setLogs(data.map(l => ({
        date: l.work_date,
        student_id: l.student_id,
        student_name: l.student_name,
        agency_name: l.agency_name,
        work_report: l.work_report,
        time_in: l.checkin_time || '',
        time_out: l.checkout_time || '',
        hours: l.hours_worked,
        problem: l.problem || '',
        status: l.status,
        id: l.id,
        log_id: l.log_id
      })));
      setEditIdx(null);
      setEditLog(null);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };
  const handleEditLogCancel = () => {
    setEditIdx(null);
    setEditLog(null);
  };

  // ดึงข้อมูล work log จาก backend
  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/student-work-log?student_id=${student_id}`);
        if (!res.ok) throw new Error('ไม่สามารถดึงข้อมูลการปฏิบัติงาน');
        const data = await res.json();
        console.log('API Response worklog data:', data); // debug
        setLogs(data.map(l => ({
          date: l.work_date,
          student_id: l.student_id,
          student_name: l.student_name,
          agency_name: l.agency_name, // ดึงชื่อหน่วยงานจาก backend
          work_report: l.work_report,
          time_in: l.checkin_time || '',
          time_out: l.checkout_time || '',
          hours: l.hours_worked,
          problem: l.problem || '',
          status: l.status,
          id: l.id ?? l.log_id ?? l.work_log_id,
          log_id: l.log_id ?? l.id ?? l.work_log_id
        })));
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };
    if (student_id) fetchLogs();
  }, [student_id]);
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ส่งข้อมูลไป backend
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        work_date: form.date,
        student_id: form.student_id,
        student_name: form.student_name,
        agency_name: form.agency_name,
        work_report: form.work_report,
        checkin_time: form.time_in,
        checkout_time: form.time_out,
        hours_worked: Number(form.hours),
        problem: form.problem,
        status: form.status
      };
      const res = await fetch('/api/student-work-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('บันทึกข้อมูลไม่สำเร็จ');
      // ดึงข้อมูลใหม่
      const getRes = await fetch(`/api/student-work-log?student_id=${student_id}`);
      const data = await getRes.json();
      setLogs(data.map(l => ({
        date: l.work_date,
        student_id: l.student_id,
        student_name: l.student_name,
        agency_name: l.agency_name,
        work_report: l.work_report,
        time_in: l.checkin_time || '',
        time_out: l.checkout_time || '',
        hours: l.hours_worked,
        problem: l.problem || '',
        status: l.status,
        id: l.id ?? l.log_id ?? l.work_log_id,
        log_id: l.log_id ?? l.id ?? l.work_log_id
      })));
      setForm({ date: '', student_id: student_id, student_name: '', agency_name: '', work_report: '', time_in: '', time_out: '', hours: '', problem: '', status: 'รอดำเนินการ' });
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const statusIcon = status => {
    if (status === 'ยืนยันแล้ว') return <FaCheckCircle style={{color:'#16a085'}} title="ยืนยันแล้ว"/>;
    if (status === 'รอดำเนินการ') return <FaHourglassHalf style={{color:'#f39c12'}} title="รอดำเนินการ"/>;
    return <FaExclamationCircle style={{color:'#e74c3c'}} title={status}/>;
  };

  // ฟังก์ชันแปลงวันที่เป็นรูปแบบ 1/2/2568
  const formatThaiDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear() + 543;
    return `${day}/${month}/${year}`;
  };

 // State สำหรับชั่วโมงรวมและชั่วโมงที่เหลือ
  const [totalHours, setTotalHours] = useState(0);
  const [remainingHours, setRemainingHours] = useState(96);

  // คำนวณชั่วโมงรวมและชั่วโมงที่เหลือเมื่อ logs เปลี่ยน
  useEffect(() => {
    const sum = logs.reduce((acc, l) => acc + (parseFloat(l.hours) || 0), 0);
    setTotalHours(sum);
    setRemainingHours(96 - sum);
  }, [logs]);

  // คำนวณชั่วโมงอัตโนมัติเมื่อเวลามา/เวลากลับเปลี่ยน
  useEffect(() => {
    if (form.time_in && form.time_out) {
      const inTime = new Date(`1970-01-01T${form.time_in}`);
      const outTime = new Date(`1970-01-01T${form.time_out}`);
      let diff = (outTime - inTime) / (1000 * 60 * 60);
      if (diff < 0) diff = 0;
      setForm(f => ({ ...f, hours: diff.toFixed(2) }));
    }
  }, [form.time_in, form.time_out]);

  useEffect(() => {
    if (totalHours >= 96) {
      // ส่งแจ้งเตือนไป backend
      fetch('/api/student-work-log/notify-96hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: student_id,
          student_name: student_name,
          total_hours: totalHours
        })
      });
    }
  }, [totalHours, student_id, student_name]);

  return (
    <div className="student-work-log" style={{background:'#f8f9fa',padding:'2rem',borderRadius:'16px',boxShadow:'0 2px 12px rgba(44,62,80,0.08)',maxWidth:'1400px',margin:'2rem auto'}}>
      <h2 style={{marginBottom:'1.5rem',color:'#16a085',display:'flex',alignItems:'center',gap:'0.7rem'}}><FaClipboardList style={{marginRight:6}}/> บันทึกการปฏิบัติงานของนักศึกษา</h2>
      {/* ช่องชั่วโมงรวมและชั่วโมงที่เหลือ ดีไซน์ใหม่ให้สวยงาม */}
      <div style={{display:'flex',gap:'2rem',marginBottom:'1.5rem',justifyContent:'flex-start'}}>
        <div style={{background:'linear-gradient(90deg,#0562f7 100%)',color:'#fff',borderRadius:'14px',boxShadow:'0 2px 8px rgba(22,160,133,0.12)',padding:'1.2rem 1.2rem',display:'flex',alignItems:'center',gap:'1.2rem',minWidth:'80px',position:'relative'}}>
          <FaRegClock size={38} style={{color:'#fff',background:'#0000005d',borderRadius:'50%',padding:'0.4rem',boxShadow:'0 2px 8px rgba(44,62,80,0.10)'}} />
          <div>
            <div style={{fontSize:'1.1rem',fontWeight:'500',letterSpacing:'0.5px'}}>ชั่วโมงรวม</div>
            <div style={{fontSize:'2.1rem',fontWeight:'bold',marginTop:'0.2rem',letterSpacing:'1px',textShadow:'0 2px 8px rgba(44,62,80,0.10)'}}>{totalHours}</div>
          </div>
        </div>
        <div style={{background:'linear-gradient(90deg,#f39c12 60%,#f7ca18 100%)',color:'#fff',borderRadius:'14px',boxShadow:'0 2px 8px rgba(243,156,18,0.12)',padding:'1.2rem 1.2rem',display:'flex',alignItems:'center',gap:'1.2rem',minWidth:'80px',position:'relative'}}>
          <FaRegHourglass size={38} style={{color:'#fff',background:'#f7ca18',borderRadius:'50%',padding:'0.4rem',boxShadow:'0 2px 8px rgba(44,62,80,0.10)'}} />
          <div>
            <div style={{fontSize:'1.1rem',fontWeight:'500',letterSpacing:'0.5px'}}>ชั่วโมงที่เหลือ</div>
            <div style={{fontSize:'2.1rem',fontWeight:'bold',marginTop:'0.2rem',letterSpacing:'1px',textShadow:'0 2px 8px rgba(44,62,80,0.10)'}}>{remainingHours}</div>
          </div>
        </div>
      </div>
      <div style={{display:'flex',justifyContent:'flex-end',marginBottom:'1.5rem'}}>
        {totalHours < 96 && (
          <button onClick={()=>setShowForm(true)} style={{background:'#2979ff',color:'#fff',border:'none',borderRadius:'8px',padding:'0.7rem 1.5rem',fontWeight:'500',fontSize:'1rem',cursor:'pointer',display:'flex',alignItems:'center',gap:'0.5rem'}}><FaPlus /> บันทึกการปฏิบัติงาน</button>
        )}
      </div>
      {error && <div style={{color:'#e74c3c',marginBottom:'1rem',textAlign:'center'}}>{error}</div>}
      {loading && <div style={{color:'#16a085',marginBottom:'1rem',textAlign:'center'}}>กำลังโหลดข้อมูล...</div>}
      {showForm && (
        <form onSubmit={handleSubmit} style={{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',zIndex:1000,background:'#fff',borderRadius:'12px',boxShadow:'0 2px 16px rgba(44,62,80,0.18)',padding:'2rem',maxWidth:'500px',width:'95vw',maxHeight:'90vh',overflow:'auto'}}>
          <h3 style={{marginBottom:'1rem',color:'#2979ff',textAlign:'center'}}><FaClipboardList style={{marginRight:6}}/> ฟอร์มบันทึกการปฏิบัติงาน</h3>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1rem'}}>
            <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><FaCalendarAlt /> <span>วันที่:</span></div>
            <input type="date" name="date" value={form.date} onChange={handleChange} required style={{padding:'0.5rem',borderRadius:'8px',border:'1px solid #ccc'}} />
            <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><FaUserGraduate /> <span>รหัสนักศึกษา:</span></div>
            <input type="text" name="student_id" value={form.student_id} readOnly disabled style={{padding:'0.5rem',borderRadius:'8px',border:'1px solid #ccc',background:'#eee',fontWeight:'bold',color:'#000'}} />
            <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><FaUserGraduate /> <span>ชื่อนามสกุล:</span></div>
            <input type="text" name="student_name" value={form.student_name} readOnly disabled style={{padding:'0.5rem',borderRadius:'8px',border:'1px solid #ccc',background:'#eee',fontWeight:'bold',color:'#000'}} />
            <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><FaBuilding /> <span>ชื่อหน่วยงาน:</span></div>
            <input type="text" name="agency_name" value={form.agency_name || ''} readOnly disabled style={{padding:'0.5rem',borderRadius:'8px',border:'1px solid #ccc',background:'#eee',fontWeight:'bold',color:'#000'}} />
            <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><FaClipboardList /> <span>รายงานการปฏิบัติงาน:</span></div>
            <textarea name="work_report" value={form.work_report} onChange={handleChange} rows={2} required style={{padding:'0.5rem',borderRadius:'8px',border:'1px solid #ccc'}}></textarea>
            <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><FaClock /> <span>เวลามา:</span></div>
            <input type="time" name="time_in" value={form.time_in} onChange={handleChange} required style={{padding:'0.5rem',borderRadius:'8px',border:'1px solid #ccc'}} />
            <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><FaClock /> <span>เวลากลับ:</span></div>
            <input type="time" name="time_out" value={form.time_out} onChange={handleChange} required style={{padding:'0.5rem',borderRadius:'8px',border:'1px solid #ccc'}} />
            <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><FaClock /> <span>ชั่วโมง:</span></div>
            <input type="number" name="hours" min="0" step="0.25" value={form.hours} onChange={handleChange} required style={{padding:'0.5rem',borderRadius:'8px',border:'1px solid #ccc'}} readOnly />
            <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><FaExclamationCircle /> <span>ปัญหาที่พบและการแก้ไข:</span></div>
            <input type="text" name="problem" value={form.problem} onChange={handleChange} style={{padding:'0.5rem',borderRadius:'8px',border:'1px solid #ccc'}} />
          </div>
          <div style={{display:'flex',gap:'1rem',marginTop:'1rem',justifyContent:'flex-end'}}>
            <button type="submit" style={{background:'#2979ff',color:'#fff',border:'none',borderRadius:'8px',padding:'0.7rem 1.2rem',fontWeight:'500',fontSize:'1rem',cursor:'pointer'}}>บันทึกการปฏิบัติงาน</button>
            <button type="button" onClick={()=>setShowForm(false)} style={{background:'#bdc3c7',color:'#2c3e50',border:'none',borderRadius:'8px',padding:'0.7rem 1.2rem',fontWeight:'500',fontSize:'1rem',cursor:'pointer'}}>ยกเลิก</button>
          </div>
        </form>
      )}
      {showForm && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(44,62,80,0.15)',zIndex:999}} onClick={()=>setShowForm(false)}></div>
      )}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',margin:'2rem 0 1rem 0'}}>
        <h3 style={{color:'#2979ff',display:'flex',alignItems:'center',gap:'1rem'}}><FaClipboardList style={{marginRight:6}}/> ตารางบันทึกการปฏิบัติงาน</h3>
        <button onClick={handlePrint} style={{background:'#fff',border:'none',borderRadius:'8px',padding:'0.5rem 1rem',boxShadow:'0 2px 8px rgba(44,62,80,0.10)',cursor:'pointer',display:'flex',alignItems:'center',gap:'0.5rem',fontWeight:'500',fontSize:'1rem',color:'#0562f7'}} title="ดาวน์โหลด PDF">
          <FaPrint size={22} style={{marginRight:4}} />
          <span style={{display:'inline-block'}}>ดาวน์โหลด PDF</span>
        </button>
      </div>
      <div ref={tableRef}>
        <table style={{width:'100%',background:'#fff',borderRadius:'12px',boxShadow:'0 2px 8px rgba(44,62,80,0.08)',overflow:'hidden',fontSize:'0.7rem'}}>
          <thead style={{background:'#2979ff',color:'#fff'}}>
            <tr>
              <th style={{textAlign:'center'}}><FaCalendarAlt style={{marginRight:4}}/> วันที่</th>
              <th style={{textAlign:'center'}}><FaUserGraduate style={{marginRight:4}}/> รหัสนักศึกษา</th>
              <th style={{textAlign:'center'}}><FaUserGraduate style={{marginRight:4}}/> ชื่อนามสกุล</th>
              <th style={{textAlign:'center'}}><FaBuilding style={{marginRight:4}}/> ชื่อหน่วยงาน</th>
              <th style={{textAlign:'center'}}><FaClipboardList style={{marginRight:4}}/> รายงานการปฏิบัติงาน</th>
              <th style={{textAlign:'center'}}><FaClock style={{marginRight:4}}/> เวลามา</th>
              <th style={{textAlign:'center'}}><FaClock style={{marginRight:4}}/> เวลากลับ</th>
              <th style={{textAlign:'center'}}><FaClock style={{marginRight:4}}/> ชั่วโมง</th>
              <th style={{textAlign:'center'}}><FaExclamationCircle style={{marginRight:4}}/> ปัญหาที่พบและการแก้ไข</th>
              <th style={{textAlign:'center'}}>สถานะ</th>
              <th style={{textAlign:'center'}}>แก้ไข</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l,idx)=>(
              <tr key={idx} style={{background:idx%2===0?'#f4f8fb':'#fff'}}>
                <td style={{textAlign:'center'}}>{formatThaiDate(l.date)}</td>
                <td style={{textAlign:'center'}}>{l.student_id}</td>
                <td style={{textAlign:'center'}}>{l.student_name}</td>
                <td style={{textAlign:'center'}}>{l.agency_name}</td>
                <td style={{textAlign:'center'}}>{l.work_report}</td>
                <td style={{textAlign:'center'}}>{l.time_in}</td>
                <td style={{textAlign:'center'}}>{l.time_out}</td>
                <td style={{textAlign:'center'}}>{l.hours}</td>
                <td style={{textAlign:'center'}}>{l.problem}</td>
                <td style={{textAlign:'center',fontWeight:'bold'}}>{statusIcon(l.status)} <span style={{marginLeft:6}}>{l.status}</span></td>
                <td style={{textAlign:'center'}}>
                  <button onClick={()=>handleEditLog(idx)} style={{background:'#16a085',color:'#fff',border:'none',borderRadius:'8px',padding:'0.3rem 1rem',fontWeight:'500',fontSize:'0.95rem',cursor:'pointer'}}>แก้ไข</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* ฟอร์มแก้ไข log และ overlay ต้องอยู่นอก <table>/<tbody> */}
      {editIdx!==null && editLog && (
        <>
          <form onSubmit={e=>{e.preventDefault();handleEditLogSave();}} style={{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',zIndex:1000,background:'#fff',borderRadius:'12px',boxShadow:'0 2px 16px rgba(44,62,80,0.18)',padding:'2rem',maxWidth:'500px',width:'95vw',maxHeight:'90vh',overflow:'auto'}}>
            <h3 style={{marginBottom:'1rem',color:'#2979ff',textAlign:'center'}}>แก้ไขบันทึกการปฏิบัติงาน</h3>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1rem'}}>
                <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><FaBuilding /> <span>ชื่อหน่วยงาน:</span></div>
                <input type="text" name="agency_name" value={editLog.agency_name || ''} onChange={handleEditLogChange} required style={{padding:'0.5rem',borderRadius:'8px',border:'1px solid #ccc',fontWeight:'bold'}} />
              <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><FaClipboardList /> <span>รายงานการปฏิบัติงาน:</span></div>
              <textarea name="work_report" value={editLog.work_report} onChange={handleEditLogChange} rows={2} required style={{padding:'0.5rem',borderRadius:'8px',border:'1px solid #ccc'}}></textarea>
              <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><FaClock /> <span>เวลามา:</span></div>
              <input type="time" name="time_in" value={editLog.time_in} onChange={handleEditLogChange} required style={{padding:'0.5rem',borderRadius:'8px',border:'1px solid #ccc'}} />
              <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><FaClock /> <span>เวลากลับ:</span></div>
              <input type="time" name="time_out" value={editLog.time_out} onChange={handleEditLogChange} required style={{padding:'0.5rem',borderRadius:'8px',border:'1px solid #ccc'}} />
              <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><FaClock /> <span>ชั่วโมง:</span></div>
              <input type="number" name="hours" min="0" step="0.25" value={editLog.hours} onChange={handleEditLogChange} required style={{padding:'0.5rem',borderRadius:'8px',border:'1px solid #ccc'}} />
              <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><FaExclamationCircle /> <span>ปัญหาที่พบและการแก้ไข:</span></div>
              <input type="text" name="problem" value={editLog.problem} onChange={handleEditLogChange} style={{padding:'0.5rem',borderRadius:'8px',border:'1px solid #ccc'}} />
                {/* ลบฟิลด์สถานะออกจากฟอร์มแก้ไข */}
            </div>
            <div style={{display:'flex',gap:'1rem',marginTop:'1rem',justifyContent:'flex-end'}}>
              <button type="submit" style={{background:'#16a085',color:'#fff',border:'none',borderRadius:'8px',padding:'0.7rem 1.2rem',fontWeight:'500',fontSize:'1rem',cursor:'pointer'}}>บันทึกการแก้ไข</button>
              <button type="button" onClick={handleEditLogCancel} style={{background:'#bdc3c7',color:'#2c3e50',border:'none',borderRadius:'8px',padding:'0.7rem 1.2rem',fontWeight:'500',fontSize:'1rem',cursor:'pointer'}}>ยกเลิก</button>
            </div>
          </form>
          <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(44,62,80,0.15)',zIndex:999}} onClick={handleEditLogCancel}></div>
        </>
      )}
    </div>
  );

}

export default StudentWorkLog;
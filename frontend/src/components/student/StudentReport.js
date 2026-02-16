import React, { useState, useEffect } from 'react';
import { FaUserGraduate, FaFilePdf, FaCalendarAlt, FaCheckCircle, FaHourglassHalf, FaEdit, FaPlus } from 'react-icons/fa';

function StudentReport() {
  const [reports, setReports] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    student_id: localStorage.getItem('student_id') || '',
    name: localStorage.getItem('student_name') || '',
    file: null,
    fileName: '',
  });
  const [editingIdx, setEditingIdx] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ฟังก์ชันแปลงวันที่เป็นรูปแบบ 9/02/2025
  const formatThaiDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const day = d.getDate();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // ดึงข้อมูลรายงานจาก backend
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/student-report?student_id=' + form.student_id);
        if (!res.ok) throw new Error('ไม่สามารถดึงข้อมูลรายงาน');
        const data = await res.json();
        setReports(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };
    if (form.student_id) fetchReports();
  }, [form.student_id, showForm]);

  // ดึงข้อมูล student_id และ student_name จาก tb_student
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
              name: data[0].student_name || ''
            }));
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleChange = e => {
    if (e.target.name === 'file') {
      setForm({ ...form, file: e.target.files[0], fileName: e.target.files[0]?.name || '' });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  // ส่งข้อมูลรายงานไป backend
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { student_id, name: student_name, file } = form;
      const formData = new FormData();
      formData.append('student_id', student_id);
      formData.append('student_name', student_name);
      formData.append('report_file', file);
      const res = await fetch('http://localhost:5000/api/student-report', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        setShowForm(false);
        setForm({ student_id, name: student_name, file: null, fileName: '' });
        setEditingIdx(null);
        // รีเฟรชข้อมูลรายงานทันทีหลังส่งสำเร็จ
        const fetchReports = async () => {
          setLoading(true);
          setError('');
          try {
            const res = await fetch('/api/student-report?student_id=' + student_id);
            if (!res.ok) throw new Error('ไม่สามารถดึงข้อมูลรายงาน');
            const data = await res.json();
            setReports(Array.isArray(data) ? data : []);
          } catch (err) {
            setError(err.message);
          }
          setLoading(false);
        };
        fetchReports();
      } else {
        const data = await res.json();
        setError(data.error || 'ส่งรายงานไม่สำเร็จ');
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleEdit = idx => {
    setForm({
      student_id: reports[idx].student_id,
      name: reports[idx].student_name,
      file: null,
      fileName: reports[idx].report_file,
    });
    setEditingIdx(idx);
    setShowForm(true);
  };

  const statusIcon = status => {
    if (status === 'อนุมัติแล้ว') return <FaCheckCircle style={{color:'#16a085'}} title="อนุมัติแล้ว"/>;
    if (status === 'รออนุมัติ') return <FaHourglassHalf style={{color:'#f39c12'}} title="รออนุมัติ"/>;
    if (status === 'ไม่ผ่าน') return <FaHourglassHalf style={{color:'#e74c3c'}} title="ไม่ผ่าน"/>;
    return <FaHourglassHalf style={{color:'#bdc3c7'}} title={status}/>;
  };

  return (
    <div className="student-report" style={{background:'#f8f9fa',padding:'2rem',borderRadius:'16px',boxShadow:'0 2px 12px rgba(44,62,80,0.08)',maxWidth:'1100px',margin:'2rem auto'}}>
      <h2 style={{marginBottom:'1.5rem',color:'#16a085',display:'flex',alignItems:'center',gap:'0.7rem'}}><FaFilePdf style={{marginRight:6}}/> ส่งเล่มรายงาน</h2>
      <div style={{display:'flex',justifyContent:'flex-end',marginBottom:'1.5rem'}}>
        <button onClick={()=>{setShowForm(true);setEditingIdx(null);}} style={{background:'#2979ff',color:'#fff',border:'none',borderRadius:'8px',padding:'0.7rem 1.5rem',fontWeight:'500',fontSize:'1rem',cursor:'pointer',display:'flex',alignItems:'center',gap:'0.5rem'}}><FaPlus /> ส่งเล่มรายงาน</button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} style={{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',zIndex:1000,background:'#fff',borderRadius:'12px',boxShadow:'0 2px 16px rgba(44,62,80,0.18)',padding:'2rem',maxWidth:'400px',width:'95vw',maxHeight:'90vh',overflow:'auto'}}>
          <h3 style={{marginBottom:'1rem',color:'#2979ff',textAlign:'center'}}><FaFilePdf style={{marginRight:6}}/> ฟอร์มส่งเล่มรายงาน</h3>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1rem'}}>
            <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><FaUserGraduate /> <span>รหัสนักศึกษา:</span></div>
            <input
              type="text"
              name="student_id"
              value={form.student_id}
              readOnly
              disabled
              style={{padding:'0.5rem',borderRadius:'8px',border:'1px solid #ccc',background:'#eee',fontWeight:'bold',color:'#000000ff'}}
            />
            <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><FaUserGraduate /> <span>ชื่อนามสกุล:</span></div>
            <input
              type="text"
              name="name"
              value={form.name}
              readOnly
              disabled
              style={{padding:'0.5rem',borderRadius:'8px',border:'1px solid #ccc',background:'#eee',fontWeight:'bold',color:'#000000ff'}}
            />
            <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><FaFilePdf /> <span>อัปโหลดไฟล์รายงาน (PDF):</span></div>
            <input type="file" name="file" accept="application/pdf" onChange={handleChange} required style={{padding:'0.5rem',borderRadius:'8px',border:'1px solid #ccc'}} />
          </div>
          <div style={{display:'flex',gap:'1rem',marginTop:'1rem',justifyContent:'flex-end'}}>
            <button type="submit" style={{background:'#2979ff',color:'#fff',border:'none',borderRadius:'8px',padding:'0.7rem 1.2rem',fontWeight:'500',fontSize:'1rem',cursor:'pointer'}} disabled={!form.fileName || loading}>ส่งเล่มรายงาน</button>
            <button type="button" onClick={()=>{setShowForm(false);setForm({student_id:'',name:'',file:null,fileName:''});setEditingIdx(null);}} style={{background:'#bdc3c7',color:'#2c3e50',border:'none',borderRadius:'8px',padding:'0.7rem 1.2rem',fontWeight:'500',fontSize:'1rem',cursor:'pointer'}}>ยกเลิก</button>
          </div>
        </form>
      )}
      {showForm && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(44,62,80,0.15)',zIndex:999}} onClick={()=>setShowForm(false)}></div>
      )}
      <h3 style={{margin:'2rem 0 1rem 0',color:'#2979ff',display:'flex',alignItems:'center',gap:'0.7rem'}}><FaFilePdf style={{marginRight:6}}/> ตารางส่งเล่มรายงาน</h3>
      <table style={{width:'100%',background:'#fff',borderRadius:'12px',boxShadow:'0 2px 8px rgba(44,62,80,0.08)',overflow:'hidden',fontSize:'0.9rem'}}>
        <thead style={{background:'#2979ff',color:'#fff'}}>
          <tr>
            <th style={{textAlign:'center'}}><FaUserGraduate style={{marginRight:4}}/> รหัสนักศึกษา</th>
            <th style={{textAlign:'center'}}><FaUserGraduate style={{marginRight:4}}/> ชื่อนามสกุล</th>
            <th style={{textAlign:'center'}}><FaFilePdf style={{marginRight:4}}/> ไฟล์</th>
            <th style={{textAlign:'center'}}><FaCalendarAlt style={{marginRight:4}}/> วันที่ส่ง</th>
            <th style={{textAlign:'center'}}>สถานะ</th>
          </tr>
        </thead>
        <tbody>
          {reports
            .filter(r => r.student_id === (localStorage.getItem('student_id') || ''))
            .map((r,idx)=>(
              <tr key={r.report_id || idx} style={{background:idx%2===0?'#f4f8fb':'#fff'}}>
                <td style={{textAlign:'center'}}>{r.student_id}</td>
                <td style={{textAlign:'center'}}>{r.student_name}</td>
                <td style={{textAlign:'center'}}>
                  <a 
                    href={r.report_file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{color:'#e74c3c', fontWeight:'bold', textDecoration:'underline'}}
                  >
                    {r.report_file}
                  </a>
                </td>
                <td style={{textAlign:'center'}}>{formatThaiDate(r.created_at)}</td>
                <td style={{textAlign:'center',fontWeight:'bold'}}>{statusIcon(r.status)} <span style={{marginLeft:6}}>{r.status}</span></td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default StudentReport;

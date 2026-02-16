import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AgencyLogin() {
  const [supervisorName, setSupervisorName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/register/agency/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supervisor_name: supervisorName, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('supervisor_id', data.supervisor_id);
        localStorage.setItem('supervisor_name', data.supervisor_name);
        localStorage.setItem('agency_name', data.agency_name);
        localStorage.setItem('username', supervisorName); // เซ็ต username หลัง login
        navigate('/agency'); // ไปหน้า dashboard
      } else {
        setError(data.error || 'เข้าสู่ระบบไม่สำเร็จ');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100vh'}}>
      <form onSubmit={handleSubmit} style={{background:'#fff',padding:'2rem',borderRadius:'12px',boxShadow:'0 2px 16px rgba(44,62,80,0.18)',maxWidth:'400px',width:'90vw'}}>
        <h2 style={{marginBottom:'1.5rem',color:'#16a085'}}>เข้าสู่ระบบหน่วยงาน</h2>
        <div style={{marginBottom:'1rem'}}>
          <label style={{fontWeight:'bold'}}>ชื่อหัวหน้าหน่วยงาน:</label>
          <input type="text" value={supervisorName} onChange={e=>setSupervisorName(e.target.value)} required style={{width:'100%',padding:'0.5rem',borderRadius:'8px',border:'2px solid #16a085'}} />
        </div>
        <div style={{marginBottom:'1rem'}}>
          <label style={{fontWeight:'bold'}}>รหัสผ่าน:</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required style={{width:'100%',padding:'0.5rem',borderRadius:'8px',border:'2px solid #16a085'}} />
        </div>
        {error && <div style={{color:'red',marginBottom:'1rem'}}>{error}</div>}
        <button type="submit" style={{background:'#16a085',color:'#fff',border:'none',borderRadius:'8px',padding:'0.7rem 1.2rem',fontWeight:'500',fontSize:'1rem',cursor:'pointer',width:'100%'}}>เข้าสู่ระบบ</button>
      </form>
    </div>
  );
}

export default AgencyLogin;

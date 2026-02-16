import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/main.css';

function RegisterPage() {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight:'100vh',
      background:'#fff',
      display:'flex',
      alignItems:'center',
      justifyContent:'center'
    }}>
      <div style={{
        background:'#fff',
        borderRadius:'22px',
        boxShadow:'0 2px 24px rgba(44,62,80,0.13)',
        padding:'2.5rem 2.5rem 2rem 2.5rem',
        maxWidth:'340px',
        width:'100%',
        display:'flex',
        flexDirection:'column',
        alignItems:'center'
      }}>
        <h2 style={{marginBottom:'1.5rem',color:'#2979ff',fontWeight:'bold',fontSize:'1.35rem'}}>ลงทะเบียนเข้าใช้งาน</h2>
        <div style={{width:'100%',display:'flex',flexDirection:'column',gap:'1rem',marginBottom:'1.5rem'}}>
          <button style={{width:'100%',padding:'0.8rem 0',borderRadius:'10px',fontWeight:'bold',fontSize:'1.08rem',background:'#16a085',color:'#fff',border:'none'}} onClick={() => navigate('/register/student')}>นักศึกษา</button>
          <button style={{width:'100%',padding:'0.8rem 0',borderRadius:'10px',fontWeight:'bold',fontSize:'1.08rem',background:'#2979ff',color:'#fff',border:'none'}} onClick={() => navigate('/register/teacher')}>อาจารย์ฝ่ายสหกิจ</button>
          <button style={{width:'100%',padding:'0.8rem 0',borderRadius:'10px',fontWeight:'bold',fontSize:'1.08rem',background:'#f39c12',color:'#fff',border:'none'}} onClick={() => navigate('/register/agency')}>หน่วยงาน</button>
        </div>
        <p style={{marginTop:'1.2rem',fontSize:'1rem',color:'#2979ff'}}>
          มีบัญชีอยู่แล้ว? <Link to="/"> <b>เข้าสู่ระบบ</b> </Link>
        </p>
        <button style={{marginTop:'1.2rem',background:'#bdc3c7',color:'#2c3e50',border:'none',borderRadius:'10px',padding:'0.7rem 1.5rem',fontWeight:'500',fontSize:'1rem',cursor:'pointer'}} onClick={() => navigate(-1)}>ย้อนกลับ</button>
      </div>
    </div>
  );
}

export default RegisterPage;

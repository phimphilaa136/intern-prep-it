import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/main.css';
import { FaEye, FaEyeSlash, FaUser, FaUserAlt, FaLock } from 'react-icons/fa';

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!username || !password) {
      setError("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
      return;
    }
    try {
      const bodyData = { password };
      if (/^\d+$/.test(username)) {
        bodyData.student_id = username;
      } else {
        bodyData.username = username;
      }
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData)
      });
      const data = await res.json();
      if (res.ok && data.message === "เข้าสู่ระบบสำเร็จ") {
        // ตรวจสอบ role จาก backend (student, teacher, agency)
        if (data.role === "student" || data.role === "นักศึกษา") {
          localStorage.setItem('student_id', username);
          navigate("/student");
        }
        else if (data.role === "teacher" || data.role === "อาจารย์") {
          localStorage.setItem('username', username);
          navigate("/teacher");
        }
        else if (data.role === "agency" || data.role === "หน่วยงาน") {
          localStorage.setItem('username', username);
          localStorage.setItem('agency_name', username);
          navigate("/agency");
        }
        else {
          setError("ประเภทผู้ใช้งานไม่ถูกต้อง");
        }
      } else {
        setError(data.error || data.message || "เข้าสู่ระบบไม่สำเร็จ");
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    }
  };

  return (
    <div style={{
      minHeight:'100vh',
      background:'#fff', // เปลี่ยนพื้นหลังเป็นสีขาว
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
        <FaUser size={64} style={{color:'#2979ff',marginBottom:'1rem'}}/>
        <h2 style={{marginBottom:'1.5rem',color:'#2979ff',fontWeight:'bold',fontSize:'1.35rem'}}>ลงชื่อเข้าใช้</h2>
        <form style={{width:'100%'}} onSubmit={handleLogin}>
          <div style={{position:'relative',marginBottom:'1.2rem',width:'100%'}}>
            <FaUserAlt style={{
              position:'absolute',
              left:'1rem',
              top:'50%',
              transform:'translateY(-50%)',
              color:'#2979ff',
              fontSize:'1.1rem'
            }}/>
            <input
              type="text"
              placeholder="รหัสนักศึกษา (ชื่อผู้ใช้)"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              style={{
                width:'100%',
                maxWidth:'600px',
                minWidth:'180px',
                padding:'0.8rem 1rem 0.8rem 2.7rem',
                borderRadius:'10px',
                border:'1.5px solid #e0e0e0',
                fontSize:'1.08rem',
                background:'#f7faff',
                boxSizing:'border-box'
              }}
            />
          </div>
          <div style={{position:'relative',marginBottom:'1.2rem',width:'100%'}}>
            <FaLock style={{
              position:'absolute',
              left:'1rem',
              top:'50%',
              transform:'translateY(-50%)',
              color:'#2979ff',
              fontSize:'1.1rem'
            }}/>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="รหัสผ่าน"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width:'100%',
                maxWidth:'600px',
                minWidth:'180px',
                padding:'0.8rem 1rem 0.8rem 2.7rem',
                borderRadius:'10px',
                border:'1.5px solid #e0e0e0',
                fontSize:'1.08rem',
                background:'#f7faff',
                boxSizing:'border-box'
              }}
            />
            <span
              onClick={() => setShowPassword(v => !v)}
              style={{
                position:'absolute',
                right:'1rem',
                top:'50%',
                transform:'translateY(-50%)',
                cursor:'pointer',
                color:'#888',
                display:'flex',
                alignItems:'center',
                height:'44px'
              }}
            >
              {showPassword ? <FaEyeSlash size={22}/> : <FaEye size={22}/>}
            </span>
          </div>
          <button type="submit" style={{
            width:'100%',
            background:'#2979ff',
            color:'#fff',
            border:'none',
            borderRadius:'10px',
            padding:'0.8rem 0',
            fontWeight:'bold',
            fontSize:'1.08rem',
            marginBottom:'0.5rem',
            marginTop:'0.5rem',
            boxShadow:'0 2px 8px rgba(44,62,80,0.10)',
            letterSpacing:'0.5px'
          }}>เข้าสู่ระบบ</button>
        </form>
        {error && <div style={{ color: "red", marginTop: "10px", textAlign:'center' }}>{error}</div>}
        <p style={{marginTop:'1.2rem',fontSize:'1rem',color:'#2979ff'}}>
          ยังไม่มีบัญชี? <Link to="/register"><b>ลงทะเบียน</b></Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;

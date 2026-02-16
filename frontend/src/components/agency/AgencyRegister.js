import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/main.css';
import { FaCheckCircle, FaTimesCircle, FaEye, FaEyeSlash } from 'react-icons/fa';

function AgencyRegister() {
  const navigate = useNavigate();
  const [form, setForm] = React.useState({
    username: "",
    gender: "",
    supervisor_name: "",
    position: "",
    agency_name: "",
    phone_number: "",
    address: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = React.useState("");
  const [alert, setAlert] = React.useState(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setAlert(null);
    if (form.password !== form.confirmPassword) {
      setAlert({ type: 'error', message: 'รหัสผ่านไม่ตรงกัน' });
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/register/agency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          gender: form.gender,
          supervisor_name: form.supervisor_name,
          position: form.position,
          agency_name: form.agency_name,
          phone_number: form.phone_number,
          address: form.address,
          password: form.password
        })
      });
      const data = await res.json();
      if (res.status === 201) {
        setAlert({ type: 'success', message: 'ลงทะเบียนสำเร็จ' });
        setTimeout(() => {
          navigate("/");
        }, 1800);
      } else {
        setAlert({ type: 'error', message: data.error || "เกิดข้อผิดพลาด" });
      }
    } catch (err) {
      setAlert({ type: 'error', message: "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้" });
    }
  };

  return (
    <div className="register-container styled-bg" style={{
      minHeight:'100vh',
      background:'#fff',
      display:'flex',
      alignItems:'center',
      justifyContent:'center' // เพิ่ม justifyContent:'center' เพื่อให้อยู่ตรงกลางหน้าจอ
    }}>
      <div style={{
        background:'#fff',
        borderRadius:'22px',
        boxShadow:'0 2px 24px rgba(44,62,80,0.13)',
        padding:'2.5rem 2.5rem 2rem 2.5rem',
        maxWidth:'600px',
        width:'100%',
        display:'flex',
        flexDirection:'column',
        alignItems:'center'
      }}>
        <h2 className="register-title" style={{marginBottom:'1.5rem',color:'#2979ff',fontWeight:'bold',fontSize:'1.35rem'}}>ลงทะเบียนหน่วยงาน</h2>
        {alert && (
          <div style={{
            position:'fixed',
            top:'2.5rem',
            right:'2.5rem',
            zIndex:9999,
            background: alert.type === 'success' ? 'linear-gradient(90deg,#16a085 80%,#1abc9c 100%)' : 'linear-gradient(90deg,#e74c3c 80%,#c0392b 100%)',
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
            {alert.type === 'success'
              ? <FaCheckCircle size={22} style={{marginRight:8}}/>
              : <FaTimesCircle size={22} style={{marginRight:8}}/>
            }
            {alert.message}
          </div>
        )}
        <form className="login-form" onSubmit={handleSubmit} style={{
          width:'100%',
          display:'grid',
          gridTemplateColumns:'1fr',
          gap:'1rem',
          marginBottom:'1.2rem'
        }}>
          {/* ช่องเดียวด้านบนสุด */}
          <input type="text" name="username" placeholder="ชื่อผู้ใช้" value={form.username} onChange={handleChange} required style={{
            width:'100%',
            padding:'0.7rem',
            borderRadius:'10px',
            border:'1.5px solid #e0e0e0',
            fontSize:'1rem',
            background:'#f7faff',
            boxSizing:'border-box'
          }} />
          {/* ช่องกรอกคู่กัน */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
            <select name="gender" value={form.gender} onChange={handleChange} required style={{
              width:'100%',
              padding:'0.7rem',
              borderRadius:'10px',
              border:'1.5px solid #e0e0e0',
              fontSize:'1rem',
              background:'#f7faff',
              boxSizing:'border-box'
            }}>
              <option value="">เลือกเพศ</option>
              <option value="ชาย">ชาย</option>
              <option value="หญิง">หญิง</option>
            </select>
            <input type="text" name="supervisor_name" placeholder="ชื่อนามสกุล" value={form.supervisor_name} onChange={handleChange} required style={{
              width:'100%',
              padding:'0.7rem',
              borderRadius:'10px',
              border:'1.5px solid #e0e0e0',
              fontSize:'1rem',
              background:'#f7faff',
              boxSizing:'border-box'
            }} />
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
            <input type="text" name="position" placeholder="ตำแหน่ง" value={form.position} onChange={handleChange} required style={{
              width:'100%',
              padding:'0.7rem',
              borderRadius:'10px',
              border:'1.5px solid #e0e0e0',
              fontSize:'1rem',
              background:'#f7faff',
              boxSizing:'border-box'
            }} />
            <input type="text" name="agency_name" placeholder="ชื่อหน่วยงาน" value={form.agency_name} onChange={handleChange} required style={{
              width:'100%',
              padding:'0.7rem',
              borderRadius:'10px',
              border:'1.5px solid #e0e0e0',
              fontSize:'1rem',
              background:'#f7faff',
              boxSizing:'border-box'
            }} />
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
            <input
              type="text"
              name="phone_number"
              placeholder="เบอร์โทร"
              value={form.phone_number}
              onChange={e => {
                // รับเฉพาะตัวเลข ไม่เกิน 10 หลัก
                const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                setForm({ ...form, phone_number: val });
              }}
              required
              maxLength={10}
              pattern="[0-9]{10}"
              title="กรุณากรอกเบอร์โทรเป็นตัวเลข 10 หลัก"
              style={{
                width:'100%',
                padding:'0.7rem',
                borderRadius:'10px',
                border:'1.5px solid #e0e0e0',
                fontSize:'1rem',
                background:'#f7faff',
                boxSizing:'border-box'
              }}
            />
            <input type="text" name="address" placeholder="ที่อยู่" value={form.address} onChange={handleChange} required style={{
              width:'100%',
              padding:'0.7rem',
              borderRadius:'10px',
              border:'1.5px solid #e0e0e0',
              fontSize:'1rem',
              background:'#f7faff',
              boxSizing:'border-box'
            }} />
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
            <div style={{position:'relative'}}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="รหัสผ่าน"
                value={form.password}
                onChange={e => {
                  const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                  setForm({ ...form, password: val });
                }}
                required
                maxLength={6}
                pattern="[0-9]{4,6}"
                title="กรุณากรอกรหัสผ่านเป็นตัวเลข 4-6 หลัก"
                style={{
                  width:'100%',
                  padding:'0.7rem',
                  borderRadius:'10px',
                  border:'1.5px solid #e0e0e0',
                  fontSize:'1rem',
                  background:'#f7faff',
                  paddingRight:'2.5rem',
                  boxSizing:'border-box'
                }}
              />
              <span
                onClick={() => setShowPassword(v => !v)}
                style={{
                  position:'absolute',
                  right:'0.8rem',
                  top:'50%',
                  transform:'translateY(-50%)',
                  cursor:'pointer',
                  color:'#888'
                }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            <div style={{position:'relative'}}>
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                placeholder="ยืนยันรหัสผ่าน"
                value={form.confirmPassword}
                onChange={e => {
                  const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                  setForm({ ...form, confirmPassword: val });
                }}
                required
                maxLength={6}
                pattern="[0-9]{4,6}"
                title="กรุณากรอกรหัสผ่านเป็นตัวเลข 4-6 หลัก"
                style={{
                  width:'100%',
                  padding:'0.7rem',
                  borderRadius:'10px',
                  border:'1.5px solid #e0e0e0',
                  fontSize:'1rem',
                  background:'#f7faff',
                  paddingRight:'2.5rem',
                  boxSizing:'border-box'
                }}
              />
              <span
                onClick={() => setShowConfirm(v => !v)}
                style={{
                  position:'absolute',
                  right:'0.8rem',
                  top:'50%',
                  transform:'translateY(-50%)',
                  cursor:'pointer',
                  color:'#888'
                }}
              >
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>
          <button type="submit" className="login-btn" style={{
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
          }}>ลงทะเบียน</button>
        </form>
        <p className="register-link" style={{marginTop:'1.2rem',fontSize:'1rem',color:'#2979ff'}}>มีบัญชีอยู่แล้ว? <Link to="/">เข้าสู่ระบบ</Link></p>
        <button className="back-btn" style={{marginTop:'1.2rem',background:'#bdc3c7',color:'#2c3e50',border:'none',borderRadius:'10px',padding:'0.7rem 1.5rem',fontWeight:'500',fontSize:'1rem',cursor:'pointer'}} onClick={() => navigate(-1)}>ย้อนกลับ</button>
      </div>
    </div>
  );
}

export default AgencyRegister;

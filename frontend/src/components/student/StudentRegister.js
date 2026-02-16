import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/main.css';
import { FaCheckCircle, FaTimesCircle, FaEye, FaEyeSlash } from 'react-icons/fa';

function StudentRegister() {
  const navigate = useNavigate();
  const [form, setForm] = React.useState({
    student_id: '',
    student_gender: '',
    student_name: '',
    student_fac: '',
    student_major: '',
    student_class: '',
    student_year: '',
    student_semester: '',
    student_email: '',
    student_tel: '',
    student_address: '',
    student_advisor: '',
    student_sick: '',
    image_path: '',
    password: '',
    confirmPassword: ''
  });

  const [alert, setAlert] = React.useState(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setAlert(null);
    if (form.password !== form.confirmPassword) {
      setAlert({ type: 'error', message: 'รหัสผ่านไม่ตรงกัน' });
      return;
    }
    const formData = new FormData();
    Object.keys(form).forEach(key => {
      if (key !== 'confirmPassword' && key !== 'image_path') {
        formData.append(key, form[key]);
      }
    });
    try {
      const res = await fetch('http://localhost:5000/api/register/student', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('student_id', form.student_id);
        setAlert({ type: 'success', message: 'ลงทะเบียนสำเร็จ' });
        setTimeout(() => navigate('/'), 1800);
      } else {
        setAlert({ type: 'error', message: data.error || 'เกิดข้อผิดพลาด' });
      }
    } catch {
      setAlert({ type: 'error', message: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' });
    }
  };

  return (
    <div className="register-container styled-bg" style={{
      minHeight:'100vh',
      background:'#fff',
      display:'flex',
      alignItems:'center',
      justifyContent:'center' // เปลี่ยนจาก flex-start เป็น center
    }}>
      <div style={{
        background:'#fff',
        borderRadius:'22px',
        boxShadow:'0 2px 24px rgba(44,62,80,0.13)',
        padding:'2.5rem 2.5rem 2rem 2.5rem',
        width:'100vw',
        maxWidth:'500px',
        minWidth:'500px',
        display:'flex',
        flexDirection:'column',
        alignItems:'center'
      }}>
        <h2 className="register-title" style={{marginBottom:'1.5rem',color:'#2979ff',fontWeight:'bold',fontSize:'1.35rem'}}>ลงทะเบียนนักศึกษา</h2>
        {alert && (
          <div style={{
            position:'fixed',
            top:'2.5rem',
            right:'2.5rem',
            zIndex:9999,
            background: alert.type === 'success' ? 'linear-gradient(90deg,#16a085 80%,#1abc9c 100%)' : 'linear-gradient(90deg,#e74c3c 80%,#c0392b 100%)',
            color:'#fff',
            borderRadius:'14px',
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
          <input
            name="student_id"
            type="text"
            placeholder="รหัสนักศึกษา (ชื่อผู้ใช้)"
            value={form.student_id}
            onChange={e => {
              const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 12);
              setForm(f => ({ ...f, student_id: val }));
            }}
            required
            maxLength={12}
            pattern="[0-9]{12}"
            title="กรุณากรอกรหัสนักศึกษาเป็นตัวเลข 12 หลัก"
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
          {/* ช่องกรอกคู่กัน */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
            <select name="student_gender" value={form.student_gender} onChange={handleChange} required style={{
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
            <input name="student_name" type="text" placeholder="ชื่อนามสกุล" value={form.student_name} onChange={handleChange} required style={{
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
            <select name="student_fac" value={form.student_fac} onChange={handleChange} required style={{
              width:'100%',
              padding:'0.7rem',
              borderRadius:'10px',
              border:'1.5px solid #e0e0e0',
              fontSize:'1rem',
              background:'#f7faff',
              boxSizing:'border-box'
            }}>
              <option value="">เลือกคณะ</option>
              <option value="เทคโนโลยีสารสนเทศ">เทคโนโลยีสารสนเทศ</option>
            </select>
            <select name="student_major" value={form.student_major} onChange={handleChange} required style={{
              width:'100%',
              padding:'0.7rem',
              borderRadius:'10px',
              border:'1.5px solid #e0e0e0',
              fontSize:'1rem',
              background:'#f7faff',
              boxSizing:'border-box'
            }}>
              <option value="">เลือกสาขา</option>
              <option value="เทคโนโลยีสารสนเทศ">เทคโนโลยีสารสนเทศ</option>
            </select>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
            <select name="student_class" value={form.student_class} onChange={handleChange} required style={{
              width:'100%',
              padding:'0.7rem',
              borderRadius:'10px',
              border:'1.5px solid #e0e0e0',
              fontSize:'1rem',
              background:'#f7faff',
              boxSizing:'border-box'
            }}>
              <option value="">เลือกหมู่เรียน</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
            <select name="student_semester" value={form.student_semester} onChange={handleChange} required style={{
              width:'100%',
              padding:'0.7rem',
              borderRadius:'10px',
              border:'1.5px solid #e0e0e0',
              fontSize:'1rem',
              background:'#f7faff',
              boxSizing:'border-box'
            }}>
              <option value="">เลือกภาคเรียน</option>
              <option value="1">1</option>
              <option value="2">2</option>
            </select>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
            <select name="student_year" value={form.student_year} onChange={handleChange} required style={{
              width:'100%',
              padding:'0.7rem',
              borderRadius:'10px',
              border:'1.5px solid #e0e0e0',
              fontSize:'1rem',
              background:'#f7faff',
              boxSizing:'border-box'
            }}>
              <option value="">เลือกปีการศึกษา</option>
              <option value="2566">2566</option>
              <option value="2567">2567</option>
              <option value="2568">2568</option>
            </select>
            <input name="student_email" type="email" placeholder="อีเมล" value={form.student_email} onChange={handleChange} required style={{
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
              name="student_tel"
              type="text"
              placeholder="เบอร์โทร"
              value={form.student_tel}
              onChange={e => {
                const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                setForm(f => ({ ...f, student_tel: val }));
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
            <input name="student_address" type="text" placeholder="ที่อยู่" value={form.student_address} onChange={handleChange} required style={{
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
            <input name="student_advisor" type="text" placeholder="อาจารย์ที่ปรึกษา" value={form.student_advisor} onChange={handleChange} required style={{
              width:'100%',
              padding:'0.7rem',
              borderRadius:'10px',
              border:'1.5px solid #e0e0e0',
              fontSize:'1rem',
              background:'#f7faff',
              boxSizing:'border-box'
            }} />
            <input name="student_sick" type="text" placeholder="โรคประจำตัว" value={form.student_sick} onChange={handleChange} style={{
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
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="รหัสผ่าน"
                value={form.password}
                onChange={e => {
                  const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 12);
                  setForm(f => ({ ...f, password: val }));
                }}
                required
                maxLength={12}
                pattern="[0-9]{1,12}"
                title="กรุณากรอกรหัสผ่านเป็นตัวเลข ไม่เกิน 12 หลัก"
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
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="ยืนยันรหัสผ่าน"
                value={form.confirmPassword}
                onChange={e => {
                  const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 12);
                  setForm(f => ({ ...f, confirmPassword: val }));
                }}
                required
                maxLength={12}
                pattern="[0-9]{1,12}"
                title="กรุณากรอกรหัสผ่านเป็นตัวเลข ไม่เกิน 12 หลัก"
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

export default StudentRegister;

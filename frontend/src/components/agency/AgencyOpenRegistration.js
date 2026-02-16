import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaBuilding, FaUsers, FaMapMarkerAlt, FaPhoneAlt, FaSave, FaEdit } from 'react-icons/fa';

function AgencyOpenRegistration() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    status: '1',
    agency_name: '',
    capacity: '',
    address: '', // เปลี่ยนจาก location เป็น address
    phone_number: '',
    student_semester: '',
    student_year: ''
  });
  const [agencies, setAgencies] = useState([]);
  const [error, setError] = useState(null);
  const [editingIdx, setEditingIdx] = useState(null);
  const [selectedYear, setSelectedYear] = useState('ทั้งหมด');

  const supervisor_id = localStorage.getItem('supervisor_id');

  // ฟังก์ชันแปลงวันที่ created_at เป็นรูปแบบ พ.ศ.
  function formatThaiDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d)) return '-';
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear() + 543;
    return `${day}/${month}/${year}`;
  }

  // ดึงข้อมูลหน่วยงานที่เปิดรับ เฉพาะของผู้ใช้งาน
  const fetchAgencies = () => {
    const agency_Name = localStorage.getItem('agency_name');
    if (!agency_Name) return setAgencies([]);
    let url = `http://localhost:5000/api/register/agency/open-for-students?username=${encodeURIComponent(localStorage.getItem('username'))}`;
    fetch(url)
      .then(res => res.json())
      .then(data => setAgencies(Array.isArray(data) ? data : []))
      .catch(() => setAgencies([]));
  };

  // เพิ่ม state สำหรับข้อมูล supervisor
  const [supervisorInfo, setSupervisorInfo] = useState({ agency_name: '', phone_number: '', address: '' });

  useEffect(() => {
    const username = localStorage.getItem('username');
    if (username) {
      fetch(`http://localhost:5000/api/register/agency/supervisor-info?username=${encodeURIComponent(username)}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.agency_name) {
            setSupervisorInfo({
              agency_name: data.agency_name || '',
              phone_number: data.phone_number || '',
              address: data.address || ''
            });
            setForm(f => ({
              ...f,
              agency_name: data.agency_name || '',
              phone_number: data.phone_number || '',
              address: data.address || '' // เพิ่มตรงนี้
            }));
          }
        })
        .catch(() => {});
    }
    fetchAgencies();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = idx => {
    setEditingIdx(idx);
    const a = agencies[idx];
    setForm({
      status: a.status,
      agency_name: a.agency_name,
      capacity: a.capacity,
      address: a.address, // เปลี่ยนจาก location เป็น address
      phone_number: a.phone_number,
      student_semester: a.student_semester || '',
      student_year: a.student_year || ''
    });
    setShowForm(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const payload = {
        agency_name: form.agency_name,
        capacity: form.capacity,
        address: form.address, // เปลี่ยนจาก location เป็น address
        phone_number: form.phone_number,
        status: String(form.status),
        student_semester: form.student_semester,
        student_year: form.student_year
      };
      let url = 'http://localhost:5000/api/register/agency/open-for-students';
      let method = 'POST';
      // ถ้าแก้ไข ให้ใช้ PATCH
      if (editingIdx !== null && agencies[editingIdx]?.open_id) {
        url += `/${agencies[editingIdx].open_id}`;
        method = 'PATCH';
      }
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (res.ok) {
        // อัปเดตข้อมูลใน state โดยไม่เพิ่มแถวใหม่
        if (editingIdx !== null && agencies[editingIdx]?.open_id) {
          // แก้ไขข้อมูลในแถวเดิม
          setAgencies(ags => ags.map((a, idx) =>
            idx === editingIdx
              ? { ...a, ...payload }
              : a
          ));
        } else {
          // เพิ่มข้อมูลใหม่
          fetchAgencies();
        }
        setForm({ status: '1', agency_name: '', capacity: '', address: '', phone_number: '', student_semester: '', student_year: '' });
        setError(null);
        setEditingIdx(null);
        setShowForm(false);
      } else {
        setError(result.error ? `บันทึกข้อมูลไม่สำเร็จ: ${result.error}` : 'บันทึกข้อมูลไม่สำเร็จ');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการส่งข้อมูล');
      console.error('Form submit error:', err);
    }
  };

  // ฟิลเตอร์ข้อมูลตามปีที่เลือก
  const filteredAgencies = selectedYear === 'ทั้งหมด'
    ? agencies
    : agencies.filter(a => a.student_year === selectedYear);

  return (
    <div style={{padding: '2rem', background: '#f8f9fa', minHeight: '100vh'}}>
      <h2 style={{color:'#16a085',marginBottom:'1.5rem',display:'flex',alignItems:'center',gap:'0.7rem'}}>
        <FaBuilding style={{marginRight:6}}/> เปิดรับนักศึกษา
      </h2>
      <div style={{display:'flex',justifyContent:'flex-end',marginBottom:'1.5rem'}}>
        <button
          style={{background:'#16a085',color:'#fff',border:'none',borderRadius:'8px',padding:'0.7rem 1.5rem',fontWeight:'500',fontSize:'1.08rem',cursor:'pointer',boxShadow:'0 2px 8px rgba(44,62,80,0.08)',display:'flex',alignItems:'center',gap:'0.7rem'}}
          onClick={()=>setShowForm(true)}
        >
          <span style={{fontSize:'1.3rem',marginRight:8}}>+</span> เปิดรับนักศึกษา
        </button>
      </div>
      {/* ย้ายช่องเลือกปีการศึกษา: มาอยู่ด้านล่างปุ่ม + เปิดรับนักศึกษา */}
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
      {showForm && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(44,62,80,0.15)',zIndex:999}} onClick={()=>setShowForm(false)}></div>
      )}
      {showForm && (
        <form onSubmit={e=>{handleSubmit(e);setShowForm(false);}} style={{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',zIndex:1000,background:'#fff',borderRadius:'16px',boxShadow:'0 2px 16px rgba(44,62,80,0.18)',padding:'2.5rem 2rem 2rem 2rem',maxWidth:'480px',width:'90vw',display:'flex',flexDirection:'column',alignItems:'center'}}>
          <div style={{marginBottom:'1.2rem',textAlign:'center'}}>
            <FaCheckCircle style={{fontSize:'2rem',color:'#16a085',marginBottom:'0.5rem'}}/>
            <h3 style={{margin:'0.5rem 0',color:'#16a085'}}>ฟอร์มเปิดรับนักศึกษา</h3>
            <div style={{color:'#555',fontSize:'1rem'}}>
              <b>ชื่อหน่วยงาน:</b> {supervisorInfo.agency_name || '-'}<br/>
              <b>เบอร์โทร:</b> {supervisorInfo.phone_number || '-'}
            </div>
            <div style={{color:'#555',fontSize:'1rem',marginTop:'0.5rem'}}>กรุณากรอกข้อมูลเพื่อเปิดรับนักศึกษาฝึกงานในหน่วยงานของคุณ</div>
          </div>
          <div style={{width:'100%',display:'flex',flexDirection:'column',gap:'1rem'}}>
            <label style={{fontWeight:'bold',color:'#16a085',display:'flex',alignItems:'center',gap:'0.5rem',width:'100%'}}>
              <FaCheckCircle/> สถานะ:
              <select name="status" value={form.status} onChange={handleChange} style={{padding:'0.7rem',borderRadius:'8px',border:'2px solid #16a085',fontWeight:'500',marginLeft:'1rem',flex:1,width:'100%',minWidth:'220px',maxWidth:'100%'}}>
                <option value="1">เปิดรับ</option>
                <option value="0">ไม่เปิดรับ</option>
              </select>
            </label>
            <label style={{fontWeight:'bold',color:'#2980b9',display:'flex',alignItems:'center',gap:'0.5rem',width:'100%'}}>
              <FaBuilding/> ชื่อหน่วยงาน:
              <input type="text" name="agency_name" value={form.agency_name} onChange={handleChange} required style={{padding:'0.7rem',borderRadius:'8px',border:'2px solid #2980b9',marginLeft:'1rem',flex:1,width:'100%',minWidth:'220px',maxWidth:'100%'}}/>
            </label>
            <label style={{fontWeight:'bold',color:'#27ae60',display:'flex',alignItems:'center',gap:'0.5rem',width:'100%'}}>
              <FaUsers/> จำนวนรับฝึกงาน:
              <input type="number" name="capacity" value={form.capacity} onChange={handleChange} required style={{padding:'0.7rem',borderRadius:'8px',border:'2px solid #27ae60',marginLeft:'1rem',flex:1,width:'100%',minWidth:'220px',maxWidth:'100%'}}/>
            </label>
            <label style={{fontWeight:'bold',color:'#e74c3c',display:'flex',alignItems:'center',gap:'0.5rem',width:'100%'}}>
              <FaMapMarkerAlt/> ที่อยู่:
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                style={{padding:'0.7rem',borderRadius:'8px',border:'2px solid #e74c3c',marginLeft:'1rem',flex:1,width:'100%',minWidth:'220px',maxWidth:'100%'}}
                placeholder={supervisorInfo.address || 'กรอกที่อยู่'}
              />
            </label>
            <label style={{fontWeight:'bold',color:'#f39c12',display:'flex',alignItems:'center',gap:'0.5rem',width:'100%'}}>
              <FaPhoneAlt/> เบอร์โทร:
              <input type="text" name="phone_number" value={form.phone_number} onChange={handleChange} required style={{padding:'0.7rem',borderRadius:'8px',border:'2px solid #f39c12',marginLeft:'1rem',flex:1,width:'100%',minWidth:'220px',maxWidth:'100%'}}/>
            </label>
            <label style={{fontWeight:'bold',color:'#8e44ad',display:'flex',alignItems:'center',gap:'0.5rem',width:'100%'}}>
              ภาคเรียน:
              <select
                name="student_semester"
                value={form.student_semester}
                onChange={handleChange}
                required
                style={{padding:'0.7rem',borderRadius:'8px',border:'2px solid #8e44ad',marginLeft:'1rem',flex:1,width:'100%',minWidth:'120px',maxWidth:'100%'}}
              >
                <option value="">-- เลือกภาคเรียน --</option>
                <option value="1">1</option>
                <option value="2">2</option>
              </select>
            </label>
            <label style={{fontWeight:'bold',color:'#2c3e50',display:'flex',alignItems:'center',gap:'0.5rem',width:'100%'}}>
              ปีการศึกษา:
              <select
                name="student_year"
                value={form.student_year}
                onChange={handleChange}
                required
                style={{padding:'0.7rem',borderRadius:'8px',border:'2px solid #2c3e50',marginLeft:'1rem',flex:1,width:'100%',minWidth:'120px',maxWidth:'100%'}}
              >
                <option value="">-- ปีการศึกษา --</option>
                <option value="2566">2566</option>
                <option value="2567">2567</option>
                <option value="2568">2568</option>
                <option value="2569">2569</option>
              </select>
            </label>
            <button type="submit" style={{background:'#16a085',color:'#fff',border:'none',borderRadius:'8px',padding:'0.7rem 1.5rem',fontWeight:'500',fontSize:'1.08rem',cursor:'pointer',boxShadow:'0 2px 8px rgba(44,62,80,0.08)',display:'flex',alignItems:'center',gap:'0.7rem',marginTop:'1rem',justifyContent:'center'}}>
              <FaSave style={{marginRight:8}}/> {editingIdx !== null ? 'บันทึกการแก้ไข' : 'ส่งบันทึกข้อมูล'}
            </button>
          </div>
          {error && <div style={{color:'red',marginTop:'1rem',textAlign:'center'}}>{error}</div>}
        </form>
      )}
      <div style={{margin:'2.5rem auto',maxWidth:'1400px'}}>
        <table style={{width:'100%',background:'#fff',borderRadius:'12px',boxShadow:'0 50px 50px rgba(44,62,80,0.08)',overflow:'hidden',fontSize:'1rem'}}>
          <thead style={{background:'#16a085',color:'#fff'}}>
            <tr>
              <th style={{textAlign:'center'}}><FaCheckCircle style={{marginRight:4}}/> เปิดรับ</th>
              <th style={{textAlign:'center'}}><FaBuilding style={{marginRight:4}}/> ชื่อหน่วยงาน</th>
              <th style={{textAlign:'center'}}>ภาคเรียน</th>
              <th style={{textAlign:'center'}}>ปีการศึกษา</th>
              <th style={{textAlign:'center'}}><FaUsers style={{marginRight:4}}/> จำนวนรับฝึกงาน</th>
              <th style={{textAlign:'center'}}><FaMapMarkerAlt style={{marginRight:4}}/> ที่อยู่</th>
              <th style={{textAlign:'center'}}><FaPhoneAlt style={{marginRight:4}}/> เบอร์โทร</th>
              <th style={{textAlign:'center'}}>วันที่สร้าง</th>
              <th style={{textAlign:'center'}}>แก้ไข</th>
            </tr>
          </thead>
          <tbody>
            {filteredAgencies.map((a, idx) => (
              <tr key={a.open_id ? a.open_id : `row-${idx}`} style={{background:'#f4f8fb'}}>
                <td style={{textAlign:'center',fontWeight:'bold',color:a.status==='1'?'#16a085':'#bdc3c7'}}>
                  {a.status === '1' ? <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'0.3rem'}}><FaCheckCircle/> เปิดรับ</span> : <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'0.3rem'}}>ไม่เปิดรับ</span>}
                </td>
                <td style={{textAlign:'center'}}>{a.agency_name}</td>
                <td style={{textAlign:'center'}}>{a.student_semester}</td>
                <td style={{textAlign:'center'}}>{a.student_year}</td>
                <td style={{textAlign:'center'}}>{a.capacity}</td>
                <td style={{textAlign:'center'}}>{a.address}</td>
                <td style={{textAlign:'center'}}>{a.phone_number}</td>
                <td style={{textAlign:'center'}}>
                  {a.created_at ? formatThaiDate(a.created_at) : '-'}
                </td>
                <td style={{textAlign:'center'}}>
                  <button
                    style={{background:'#f39c12',color:'#fff',border:'none',borderRadius:'8px',padding:'0.3rem 1rem',fontWeight:'bold',cursor:'pointer',display:'flex',alignItems:'center',gap:'0.4rem'}}
                    onClick={()=>handleEdit(idx)}
                  >
                    <FaEdit/> แก้ไข
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AgencyOpenRegistration;
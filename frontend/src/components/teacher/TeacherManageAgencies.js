// ฟังก์ชันแปลงเพศเป็นภาษาไทย
  const getGenderThai = (gender) => {
    if (!gender) return '';
    const g = gender.toLowerCase();
    if (g === 'female' || g === 'femal') return 'หญิง';
    if (g === 'male') return 'ชาย';
    return gender;
  };
import React, { useState } from 'react';
import { FaUserTie, FaUser, FaVenusMars, FaBuilding, FaBriefcase, FaPhoneAlt, FaCalendarAlt, FaEye, FaEdit, FaTrash, FaMapMarkerAlt } from 'react-icons/fa';

function TeacherManageAgencies() {
  // ดึงข้อมูลหน่วยงานที่ลงทะเบียนจาก backend
  const [agencies, setAgencies] = useState([]);
  React.useEffect(() => {
    fetch('http://localhost:5000/api/register/teacher/all-supervisors')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAgencies(data);
        } else {
          setAgencies([]);
        }
      })
      .catch(() => setAgencies([]));
  }, []);
  const [detailIdx, setDetailIdx] = useState(null);
  const [editIdx, setEditIdx] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [searchAgencyName, setSearchAgencyName] = useState('');
  const [alert, setAlert] = useState({ show: false, message: '' });

  const handleDelete = async (supervisor_id) => {
    if (!window.confirm('คุณต้องการลบหัวหน้าหน่วยงานนี้ใช่หรือไม่?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/register/teacher/supervisor/${supervisor_id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setAgencies(agencies.filter(a => a.supervisor_id !== supervisor_id));
        alert('ลบข้อมูลสำเร็จ');
      } else {
        alert('เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  const handleEdit = async (supervisor_id, updatedData) => {
    try {
      const res = await fetch(`http://localhost:5000/api/register/teacher/supervisor/${supervisor_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      if (res.ok) {
        setAgencies(agencies.map(a => a.supervisor_id === supervisor_id ? { ...a, ...updatedData } : a));
        setAlert({ show: true, message: 'แก้ไขข้อมูลสำเร็จ' }); // ใช้แจ้งเตือนสีเขียว
        setEditIdx(null);
      } else {
        setAlert({ show: true, message: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล' });
      }
    } catch (err) {
      setAlert({ show: true, message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' });
    }
  };

  // ฟิลเตอร์ข้อมูลตามชื่อหน่วยงาน
  const filteredAgencies = agencies.filter(a =>
    !searchAgencyName || a.agency_name?.toLowerCase().includes(searchAgencyName.toLowerCase())
  );

  return (
    <div className="teacher-manage-agencies" style={{background:'#f8f9fa',padding:'2rem',borderRadius:'16px',boxShadow:'0 2px 12px rgba(44,62,80,0.08)',maxWidth:'1400px',margin:'2rem auto'}}>
      <h2 style={{marginBottom:'1.5rem',color:'#16a085',display:'flex',alignItems:'center',gap:'0.7rem'}}><FaBuilding style={{marginRight:6}}/> จัดการหน่วยงาน</h2>
      {/* ช่องค้นหาชื่อหน่วยงานอยู่ด้านล่างข้อความจัดการหน่วยงาน */}
      <div style={{marginBottom:'1.5rem',display:'flex',alignItems:'center',gap:'1rem'}}>
        <input
          type="text"
          placeholder="ค้นหาชื่อหน่วยงาน"
          value={searchAgencyName}
          onChange={e => setSearchAgencyName(e.target.value)}
          style={{padding:'0.4rem 1.2rem',borderRadius:'8px',border:'1.5px solid #000000ff',fontSize:'1.08rem',minWidth:'220px'}}
        />
      </div>
      <table style={{width:'100%',background:'#fff',borderRadius:'12px',boxShadow:'0 2px 8px rgba(44,62,80,0.08)',overflow:'hidden',fontSize:'1rem'}}>
        <thead style={{background:'#2979ff',color:'#fff'}}>
          <tr>
            <th style={{textAlign:'center'}}><FaUser style={{marginRight:4}}/> ชื่อนามสกุล</th>
            <th style={{textAlign:'center'}}><FaVenusMars style={{marginRight:4}}/> เพศ</th>
            <th style={{textAlign:'center'}}><FaBuilding style={{marginRight:4}}/> ชื่อหน่วยงาน</th>
            <th style={{textAlign:'center'}}><FaBriefcase style={{marginRight:4}}/> ตำแหน่ง</th>
            <th style={{textAlign:'center'}}><FaPhoneAlt style={{marginRight:4}}/> เบอร์โทร</th>
            <th style={{textAlign:'center'}}><FaMapMarkerAlt style={{marginRight:4}}/> ที่อยู่</th>
            <th style={{textAlign:'center'}}><FaCalendarAlt style={{marginRight:4}}/> วันที่สมัคร</th>
            <th style={{textAlign:'center'}}>การดำเนินการ</th>
          </tr>
        </thead>
        <tbody>
          {filteredAgencies.map((a,idx)=>(
            <tr key={a.supervisor_id || idx} style={{background:idx%2===0?'#f4f8fb':'#fff'}}>
              <td style={{textAlign:'center'}}>{a.supervisor_name}</td>
              <td style={{textAlign:'center'}}>{getGenderThai(a.gender)}</td>
              <td style={{textAlign:'center'}}>{a.agency_name}</td>
              <td style={{textAlign:'center'}}>{a.position}</td>
              <td style={{textAlign:'center'}}>{a.phone_number}</td>
              <td style={{textAlign:'center'}}>{a.address}</td>
              <td style={{textAlign:'center'}}>{a.created_at ? new Date(a.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'numeric', year: 'numeric' }) : '-'}</td>
              <td style={{textAlign:'center'}}>
                <button onClick={()=>setDetailIdx(idx)} style={{background:'#2979ff',color:'#fff',border:'none',borderRadius:'8px',padding:'0.4rem 1rem',fontWeight:'500',fontSize:'0.95rem',cursor:'pointer',marginRight:'0.5rem',display:'flex',alignItems:'center',gap:'0.5rem'}}><FaEye /> ดูรายละเอียด</button>
                <button onClick={()=>{
                  setEditIdx(idx);
                  setEditForm({...agencies[idx]});
                }} style={{background:'#16a085',color:'#fff',border:'none',borderRadius:'8px',padding:'0.4rem 1rem',fontWeight:'500',fontSize:'0.95rem',cursor:'pointer',marginRight:'0.5rem',display:'flex',alignItems:'center',gap:'0.5rem'}}><FaEdit /> แก้ไข</button>
                <button onClick={() => handleDelete(a.supervisor_id)} style={{background:'#e74c3c',color:'#fff',border:'none',borderRadius:'8px',padding:'0.4rem 1rem',fontWeight:'500',fontSize:'0.95rem',cursor:'pointer',display:'flex',alignItems:'center',gap:'0.5rem'}}><FaTrash /> ลบ</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {detailIdx!==null && (
        <div style={{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',zIndex:1000,background:'#fff',borderRadius:'12px',boxShadow:'0 2px 16px rgba(44,62,80,0.18)',padding:'2rem',maxWidth:'600px',width:'95vw',maxHeight:'90vh',overflow:'auto'}}>
          <h3 style={{marginBottom:'1rem',color:'#2979ff',textAlign:'center'}}><FaEye style={{marginRight:6}}/> รายละเอียดหน่วยงาน</h3>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
            <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><FaUser /> <span>ชื่อนามสกุล:</span></div>
            <div style={{fontWeight:'bold'}}>{agencies[detailIdx].supervisor_name}</div>
            <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><FaVenusMars /> <span>เพศ:</span></div>
            <div style={{fontWeight:'bold'}}>{getGenderThai(agencies[detailIdx].gender)}</div>
            <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><FaBuilding /> <span>ชื่อหน่วยงาน:</span></div>
            <div style={{fontWeight:'bold'}}>{agencies[detailIdx].agency_name}</div>
            <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><FaBriefcase /> <span>ตำแหน่ง:</span></div>
            <div style={{fontWeight:'bold'}}>{agencies[detailIdx].position}</div>
            <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><FaPhoneAlt /> <span>เบอร์โทร:</span></div>
            <div style={{fontWeight:'bold'}}>{agencies[detailIdx].phone_number}</div>
            <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><FaMapMarkerAlt /> <span>ที่อยู่:</span></div>
            <div style={{fontWeight:'bold'}}>{agencies[detailIdx].address}</div> {/* แสดงข้อมูลที่อยู่ */}
            <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><FaCalendarAlt /> <span>วันที่สมัคร:</span></div>
            <div style={{fontWeight:'bold'}}>{agencies[detailIdx].created_at ? new Date(agencies[detailIdx].created_at).toLocaleString('th-TH') : '-'}</div>
          </div>
          <div style={{display:'flex',gap:'1rem',marginTop:'1.5rem',justifyContent:'center'}}>
            <button onClick={()=>setDetailIdx(null)} style={{background:'#bdc3c7',color:'#2c3e50',border:'none',borderRadius:'8px',padding:'0.7rem 1.5rem',fontWeight:'500',fontSize:'1rem',cursor:'pointer'}}>ปิด</button>
          </div>
        </div>
      )}
      {detailIdx!==null && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(44,62,80,0.15)',zIndex:999}} onClick={()=>setDetailIdx(null)}></div>
      )}

      {editIdx!==null && (
        <div style={{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',zIndex:1001,background:'#fff',borderRadius:'12px',boxShadow:'0 2px 16px rgba(44,62,80,0.18)',padding:'2rem',maxWidth:'500px',width:'95vw',maxHeight:'90vh',overflow:'auto'}}>
          <h3 style={{marginBottom:'1rem',color:'#16a085',textAlign:'center'}}><FaEdit style={{marginRight:6}}/> แก้ไขข้อมูลหัวหน้าหน่วยงาน</h3>
          <form onSubmit={e => {
            e.preventDefault();
            handleEdit(editForm.supervisor_id, editForm);
          }}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
              <label>ชื่อนามสกุล
                <input type="text" value={editForm.supervisor_name||''} onChange={e=>setEditForm(f=>({...f,supervisor_name:e.target.value}))} style={{width:'100%',padding:'0.4rem'}} required />
              </label>
              <label>เพศ
                <input type="text" value={editForm.gender||''} onChange={e=>setEditForm(f=>({...f,gender:e.target.value}))} style={{width:'100%',padding:'0.4rem'}} />
              </label>
              <label>ชื่อหน่วยงาน
                <input type="text" value={editForm.agency_name||''} onChange={e=>setEditForm(f=>({...f,agency_name:e.target.value}))} style={{width:'100%',padding:'0.4rem'}} />
              </label>
              <label>ตำแหน่ง
                <input type="text" value={editForm.position||''} onChange={e=>setEditForm(f=>({...f,position:e.target.value}))} style={{width:'100%',padding:'0.4rem'}} />
              </label>
              <label>เบอร์โทร
                <input type="text" value={editForm.phone_number||''} onChange={e=>setEditForm(f=>({...f,phone_number:e.target.value}))} style={{width:'100%',padding:'0.4rem'}} />
              </label>
              <label>ที่อยู่
                <input type="text" value={editForm.address||''} onChange={e=>setEditForm(f=>({...f,address:e.target.value}))} style={{width:'100%',padding:'0.4rem'}} />
              </label>
            </div>
            <div style={{display:'flex',gap:'1rem',marginTop:'1.5rem',justifyContent:'center'}}>
              <button type="submit" style={{background:'#16a085',color:'#fff',border:'none',borderRadius:'8px',padding:'0.7rem 1.5rem',fontWeight:'500',fontSize:'1rem',cursor:'pointer'}}>บันทึก</button>
              <button type="button" onClick={()=>setEditIdx(null)} style={{background:'#bdc3c7',color:'#2c3e50',border:'none',borderRadius:'8px',padding:'0.7rem 1.5rem',fontWeight:'500',fontSize:'1rem',cursor:'pointer'}}>ยกเลิก</button>
            </div>
          </form>
        </div>
      )}
      {editIdx!==null && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(44,62,80,0.15)',zIndex:1000}} onClick={()=>setEditIdx(null)}></div>
      )}

      {/* แจ้งเตือนผลลัพธ์ */}
      {alert.show && (
        <div style={{
          position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(44,62,80,0.18)',zIndex:10000,
          display:'flex',alignItems:'center',justifyContent:'center'
        }}>
          <div style={{
            background:'#fff',
            borderRadius:'16px',
            boxShadow:'0 2px 16px rgba(44,62,80,0.18)',
            padding:'2rem 2.5rem',
            minWidth:'320px',
            maxWidth:'90vw',
            textAlign:'center',
            position:'relative'
          }}>
            <FaEdit
              size={38}
              style={{
                color: alert.message === 'แก้ไขข้อมูลสำเร็จ' ? '#16a085' : '#e74c3c',
                marginBottom:'1rem'
              }}
            />
            <div style={{
              fontSize:'1.15rem',
              fontWeight:'500',
              marginBottom:'1.5rem',
              color: alert.message === 'แก้ไขข้อมูลสำเร็จ' ? '#16a085' : '#e74c3c'
            }}>
              {alert.message}
            </div>
            <button
              onClick={() => setAlert({ show: false, message: '' })}
              style={{
                background: alert.message === 'แก้ไขข้อมูลสำเร็จ' ? '#16a085' : '#e74c3c',
                color:'#fff',
                border:'none',
                borderRadius:'8px',
                padding:'0.7rem 1.5rem',
                fontWeight:'500',
                fontSize:'1rem',
                cursor:'pointer'
              }}
            >ปิด</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherManageAgencies;

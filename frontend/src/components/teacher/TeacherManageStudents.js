import React, { useState } from 'react';
import { FaUserGraduate, FaUniversity, FaBookOpen, FaEnvelope, FaPhoneAlt, FaCalendarAlt, FaEye, FaEdit, FaTrash, FaVenusMars, FaHome, FaSearch, FaExclamationCircle } from 'react-icons/fa';

function TeacherManageStudents() {
  // ดึงข้อมูลนักศึกษาที่ลงทะเบียนจาก backend
  const [students, setStudents] = useState([]);
  // state สำหรับช่องค้นหา
  const [searchClass, setSearchClass] = useState('');
  const [searchId, setSearchId] = useState('');
  const [searchName, setSearchName] = useState('');
  React.useEffect(() => {
    fetch('http://localhost:5000/api/register/teacher/students')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setStudents(data);
        } else {
          setStudents([]);
        }
      })
      .catch(() => setStudents([]));
  }, []);
  // สำหรับปุ่มค้นหา (UX)
  const [searchClicked, setSearchClicked] = useState(false);
  const [detailIdx, setDetailIdx] = useState(null);
  const [editIdx, setEditIdx] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deleteIdx, setDeleteIdx] = useState(null); // เพิ่ม state สำหรับ modal ลบ
  const [deleteLoading, setDeleteLoading] = useState(false);
  // เพิ่ม state สำหรับแจ้งเตือน error
  const [alert, setAlert] = useState({ show: false, message: '' });

  // ฟังก์ชันแปลงวันที่และเวลาเป็นรูปแบบ 2025-09-02 14:11:12
  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const pad = n => n.toString().padStart(2, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hour = pad(d.getHours());
    const min = pad(d.getMinutes());
    const sec = pad(d.getSeconds());
    return `${year}-${month}-${day} ${hour}:${min}:${sec}`;
  };

  // ฟังก์ชันลบข้อมูล
  const handleDelete = async (student_id) => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/register/teacher/students/${student_id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setStudents(students.filter(s => s.student_id !== student_id));
        setDeleteIdx(null);
      } else {
        setAlert({ show: true, message: 'เกิดข้อผิดพลาดในการลบข้อมูล' });
      }
    } catch (err) {
      setAlert({ show: true, message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' });
    }
    setDeleteLoading(false);
  };

  // เพิ่ม state สำหรับปี พ.ศ.
  const [selectedYear, setSelectedYear] = useState('');
  // ฟังก์ชันกรองข้อมูล
  const filteredStudents = students.filter(s => {
    const classMatch = searchClass ? (s.student_class||'').toLowerCase().includes(searchClass.toLowerCase()) : true;
    const idMatch = searchId ? (s.student_id||'').toString().includes(searchId) : true;
    const nameMatch = searchName ? (s.student_name||'').toLowerCase().includes(searchName.toLowerCase()) : true;
    const yearMatch = selectedYear ? (s.student_year?.toString() === selectedYear) : true;
    return classMatch && idMatch && nameMatch && yearMatch;
  });

  // เพิ่มฟังก์ชัน handleEdit สำหรับแก้ไขข้อมูลนักศึกษา
  const handleEdit = async (student_id, editForm) => {
    try {
      const res = await fetch(`http://localhost:5000/api/register/teacher/students/${student_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        const updated = await res.json();
        setStudents(students =>
          students.map(s => s.student_id === student_id ? { ...s, ...editForm } : s)
        );
        setEditIdx(null);
        setAlert({ show: true, message: 'บันทึกข้อมูลสำเร็จ' });
      } else {
        setAlert({ show: true, message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
      }
    } catch (err) {
      setAlert({ show: true, message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' });
    }
  };

  return (
    <div className="teacher-manage-students" style={{background:'#f8f9fa',padding:'2rem',borderRadius:'16px',boxShadow:'0 2px 12px rgba(44,62,80,0.08)',maxWidth:'1400px',margin:'2rem auto'}}>
      <h2 style={{marginBottom:'1.5rem',color:'#16a085',display:'flex',alignItems:'center',gap:'0.7rem'}}><FaUserGraduate style={{marginRight:6}}/> จัดการนักศึกษา</h2>
      {/* ช่องค้นหา */}
      <div style={{display:'flex',gap:'1.5rem',marginBottom:'1.5rem',flexWrap:'wrap',alignItems:'flex-end'}}>
        <div style={{display:'flex',flexDirection:'column'}}>
          <label htmlFor="searchClass" style={{fontWeight:'500',marginBottom:'0.3rem'}}>ค้นหาหมู่เรียน</label>
          <input id="searchClass" type="text" value={searchClass} onChange={e=>setSearchClass(e.target.value)} placeholder="กรอกหมู่เรียน" style={{padding:'0.5rem',borderRadius:'8px',border:'1px solid #ccc',minWidth:'180px'}} />
        </div>
        <div style={{display:'flex',flexDirection:'column'}}>
          <label htmlFor="searchId" style={{fontWeight:'500',marginBottom:'0.3rem'}}>ค้นหารหัสนักศึกษา</label>
          <input id="searchId" type="text" value={searchId} onChange={e=>setSearchId(e.target.value)} placeholder="กรอกรหัสนักศึกษา" style={{padding:'0.5rem',borderRadius:'8px',border:'1px solid #ccc',minWidth:'180px'}} />
        </div>
        <div style={{display:'flex',flexDirection:'column'}}>
          <label htmlFor="searchName" style={{fontWeight:'500',marginBottom:'0.3rem'}}>ค้นหาชื่อนักศึกษา</label>
          <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
            <input id="searchName" type="text" value={searchName} onChange={e=>setSearchName(e.target.value)} placeholder="กรอกชื่อหรือสกุล" style={{padding:'0.5rem',borderRadius:'8px',border:'1px solid #ccc',minWidth:'180px'}} />
            <button type="button" onClick={()=>setSearchClicked(sc=>!sc)} style={{background:'#2979ff',color:'#fff',border:'none',borderRadius:'8px',padding:'0.5rem 1.2rem',display:'flex',alignItems:'center',gap:'0.5rem',fontWeight:'500',fontSize:'1rem',cursor:'pointer'}}>
              <FaSearch /> ค้นหา
            </button>
          </div>
        </div>
      </div>
      <div style={{display:'flex',justifyContent:'flex-end',alignItems:'center',marginBottom:'0.5rem'}}>
        <label htmlFor="yearDropdown" style={{marginRight:'0.7rem',fontWeight:'500'}}></label>
        <select
          id="yearDropdown"
          value={selectedYear}
          onChange={e => setSelectedYear(e.target.value)}
          style={{padding:'0.5rem 1rem',borderRadius:'8px',border:'1.5px solid #000000ff',fontSize:'1rem',minWidth:'120px'}}
        >
          <option value="2566">2566</option>
          <option value="2567">2567</option>
          <option value="2568">2568</option>
        </select>
      </div>
      <table style={{width:'100%',background:'#fff',borderRadius:'12px',boxShadow:'0 2px 8px rgba(44,62,80,0.08)',overflow:'hidden',fontSize:'1rem'}}>
        <thead style={{background:'#2979ff',color:'#fff'}}>
          <tr>
            <th style={{textAlign:'center'}}><FaUserGraduate style={{marginRight:4}}/> รหัสนักศึกษา</th>
            <th style={{textAlign:'center'}}><FaUserGraduate style={{marginRight:4}}/> ชื่อนามสกุล</th>
            <th style={{textAlign:'center'}}><FaUniversity style={{marginRight:4}}/> คณะ</th>
            <th style={{textAlign:'center'}}><FaBookOpen style={{marginRight:4}}/> สาขา</th>
            <th style={{textAlign:'center'}}>หมู่เรียน</th>
            <th style={{textAlign:'center'}}>ภาคเรียน</th>
            <th style={{textAlign:'center'}}>ปีการศึกษา</th>
            <th style={{textAlign:'center'}}><FaPhoneAlt style={{marginRight:4}}/> เบอร์โทร</th>
            <th style={{textAlign:'center'}}><FaUserGraduate style={{marginRight:4}}/> อาจารย์ที่ปรึกษา</th>
            <th style={{textAlign:'center'}}>การดำเนินการ</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map((s,idx)=>(
            <tr key={s.student_id} style={{background:idx%2===0?'#f4f8fb':'#fff'}}>
              <td style={{textAlign:'center'}}>{s.student_id}</td>
              <td style={{textAlign:'center'}}>{s.student_name}</td>
              <td style={{textAlign:'center'}}>{s.student_fac}</td>
              <td style={{textAlign:'center'}}>{s.student_major}</td>
              <td style={{textAlign:'center'}}>{s.student_class}</td>
              <td style={{textAlign:'center'}}>{s.student_semester}</td>
              <td style={{textAlign:'center'}}>{s.student_year}</td>
              <td style={{textAlign:'center'}}>{s.student_tel}</td>
              <td style={{textAlign:'center'}}>{s.student_advisor}</td>
              <td style={{textAlign:'center'}}>
                <button onClick={()=>setDetailIdx(idx)} style={{background:'#2979ff',color:'#fff',border:'none',borderRadius:'8px',padding:'0.4rem 1rem',fontWeight:'500',fontSize:'0.95rem',cursor:'pointer',marginRight:'0.5rem',display:'flex',alignItems:'center',gap:'0.5rem'}}><FaEye /> ดูรายละเอียด</button>
                <button onClick={()=>{
                  setEditIdx(idx);
                  setEditForm({...students[idx]});
                }} style={{background:'#16a085',color:'#fff',border:'none',borderRadius:'8px',padding:'0.4rem 1rem',fontWeight:'500',fontSize:'0.95rem',cursor:'pointer',marginRight:'0.5rem',display:'flex',alignItems:'center',gap:'0.5rem'}}><FaEdit /> แก้ไข</button>
                <button onClick={() => setDeleteIdx(idx)} style={{background:'#e74c3c',color:'#fff',border:'none',borderRadius:'8px',padding:'0.4rem 1rem',fontWeight:'500',fontSize:'0.95rem',cursor:'pointer',display:'flex',alignItems:'center',gap:'0.5rem'}}><FaTrash /> ลบ</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {detailIdx!==null && (
        <div style={{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',zIndex:1000,background:'#fff',borderRadius:'12px',boxShadow:'0 2px 16px rgba(44,62,80,0.18)',padding:'2rem',maxWidth:'400px',width:'95vw',maxHeight:'90vh',overflow:'auto'}}>
          <h3 style={{marginBottom:'1rem',color:'#2979ff',textAlign:'center'}}><FaEye style={{marginRight:6}}/> รายละเอียดนักศึกษา</h3>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginBottom:'1.2rem'}}>
            <img src={students[detailIdx].image_path || '/profile.jpg'} alt="profile" width={100} height={100} style={{borderRadius:'50%',objectFit:'cover',boxShadow:'0 2px 8px rgba(44,62,80,0.12)'}} />
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
            <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><FaUserGraduate /> <span>รหัสนักศึกษา:</span></div>
            <div style={{fontWeight:'bold'}}>{students[detailIdx].student_id}</div>
            <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><FaUserGraduate /> <span>ชื่อนามสกุล:</span></div>
            <div style={{fontWeight:'bold'}}>{students[detailIdx].student_name}</div>
            <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><FaVenusMars /> <span>เพศ:</span></div>
            <div style={{fontWeight:'bold'}}>{students[detailIdx].student_gender}</div>
            <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><FaUniversity /> <span>คณะ:</span></div>
            <div style={{fontWeight:'bold'}}>{students[detailIdx].student_fac}</div>
            <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><FaBookOpen /> <span>สาขา:</span></div>
            <div style={{fontWeight:'bold'}}>{students[detailIdx].student_major}</div>
            <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><FaUserGraduate /> <span>หมู่เรียน:</span></div>
            <div style={{fontWeight:'bold'}}>{students[detailIdx].student_class}</div>
            <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><FaCalendarAlt /> <span>ภาคเรียน:</span></div>
            <div style={{fontWeight:'bold'}}>{students[detailIdx].student_semester}</div>
            <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><FaCalendarAlt /> <span>ปีการศึกษา:</span></div>
            <div style={{fontWeight:'bold'}}>{students[detailIdx].student_year}</div>
            <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><FaEnvelope /> <span>อีเมล:</span></div>
            <div style={{fontWeight:'bold'}}>{students[detailIdx].student_email}</div>
            <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><FaPhoneAlt /> <span>เบอร์โทร:</span></div>
            <div style={{fontWeight:'bold'}}>{students[detailIdx].student_tel}</div>
            <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><FaHome /> <span>ที่อยู่:</span></div>
            <div style={{fontWeight:'bold'}}>{students[detailIdx].student_address}</div>
            <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><FaUserGraduate /> <span>อาจารย์ที่ปรึกษา:</span></div>
            <div style={{fontWeight:'bold'}}>{students[detailIdx].student_advisor}</div>
            <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><FaVenusMars /> <span>โรคประจำตัว:</span></div>
            <div style={{fontWeight:'bold'}}>{students[detailIdx].student_sick}</div>
            <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><FaCalendarAlt /> <span>วันที่สร้าง:</span></div>
            <div style={{fontWeight:'bold'}}>{students[detailIdx].created_at ? new Date(students[detailIdx].created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'numeric', year: 'numeric' }) : '-'}</div>
            <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><FaCalendarAlt /> <span>อัปเดตล่าสุด:</span></div>
            <div style={{fontWeight:'bold'}}>{students[detailIdx].updated_at ? new Date(students[detailIdx].updated_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'numeric', year: 'numeric' }) : '-'}</div>
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
          <h3 style={{marginBottom:'1rem',color:'#16a085',textAlign:'center'}}><FaEdit style={{marginRight:6}}/> แก้ไขข้อมูลนักศึกษา</h3>
          <form onSubmit={e => {
            e.preventDefault();
            handleEdit(editForm.student_id, editForm);
          }}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
              <label>ชื่อนามสกุล
                <input type="text" value={editForm.student_name||''} onChange={e=>setEditForm(f=>({...f,student_name:e.target.value}))} style={{width:'100%',padding:'0.4rem'}} required />
              </label>
              <label>เพศ
                <input type="text" value={editForm.student_gender||''} onChange={e=>setEditForm(f=>({...f,student_gender:e.target.value}))} style={{width:'100%',padding:'0.4rem'}} />
              </label>
              <label>คณะ
                <input
                  type="text"
                  value={editForm.student_fac || ''}
                  onChange={e => setEditForm(f => ({ ...f, student_fac: e.target.value }))}
                  style={{ width: '100%', padding: '0.4rem' }}
                />
              </label>
              <label>สาขา
                <input type="text" value={editForm.student_major||''} onChange={e=>setEditForm(f=>({...f,student_major:e.target.value}))} style={{width:'100%',padding:'0.4rem'}} />
              </label>
              <label>อีเมล
                <input type="email" value={editForm.student_email||''} onChange={e=>setEditForm(f=>({...f,student_email:e.target.value}))} style={{width:'100%',padding:'0.4rem'}} />
              </label>
              <label>เบอร์โทร
                <input type="text" value={editForm.student_tel||''} onChange={e=>setEditForm(f=>({...f,student_tel:e.target.value}))} style={{width:'100%',padding:'0.4rem'}} />
              </label>
              <label>ที่อยู่
                <input
                  type="text"
                  value={editForm.student_address || ''}
                  onChange={e => setEditForm(f => ({ ...f, student_address: e.target.value }))}
                  style={{ width: '100%', padding: '0.4rem' }}
                />
              </label>
              <label>อาจารย์ที่ปรึกษา
                <input
                  type="text"
                  value={editForm.student_advisor || ''}
                  onChange={e => setEditForm(f => ({ ...f, student_advisor: e.target.value }))}
                  style={{ width: '100%', padding: '0.4rem' }}
                />
              </label>
              <label>โรคประจำตัว
                <input
                  type="text"
                  value={editForm.student_sick || ''}
                  onChange={e => setEditForm(f => ({ ...f, student_sick: e.target.value }))}
                  style={{ width: '100%', padding: '0.4rem' }}
                />
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

      {/* Modal แจ้งเตือนลบข้อมูล */}
      {deleteIdx !== null && (
        <div style={{
          position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(44,62,80,0.18)',zIndex:9999,
          display:'flex',alignItems:'center',justifyContent:'center'
        }}>
          <div style={{
            background:'#fff',borderRadius:'16px',boxShadow:'0 2px 16px rgba(44,62,80,0.18)',padding:'2rem 2.5rem',
            minWidth:'320px',maxWidth:'90vw',textAlign:'center',position:'relative'
          }}>
            <FaExclamationCircle size={38} style={{color:'#e74c3c',marginBottom:'1rem'}} />
            <div style={{fontSize:'1.15rem',fontWeight:'500',marginBottom:'1.5rem',color:'#2c3e50'}}>
              คุณต้องการลบนักศึกษาคนนี้ใช่หรือไม่?
            </div>
            <div style={{display:'flex',gap:'1rem',justifyContent:'center'}}>
              <button
                onClick={() => handleDelete(students[deleteIdx].student_id)}
                style={{background:'#e74c3c',color:'#fff',border:'none',borderRadius:'8px',padding:'0.7rem 1.5rem',fontWeight:'500',fontSize:'1rem',cursor:'pointer'}}
                disabled={deleteLoading}
              >ตกลง</button>
              <button
                onClick={() => setDeleteIdx(null)}
                style={{background:'#bdc3c7',color:'#2c3e50',border:'none',borderRadius:'8px',padding:'0.7rem 1.5rem',fontWeight:'500',fontSize:'1rem',cursor:'pointer'}}
                disabled={deleteLoading}
              >ยกเลิก</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal แจ้งเตือน error/สำเร็จ สวยงาม */}
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
            <FaExclamationCircle
              size={38}
              style={{
                color: alert.message === 'บันทึกข้อมูลสำเร็จ' ? '#16a085' : '#e74c3c',
                marginBottom:'1rem'
              }}
            />
            <div style={{
              fontSize:'1.15rem',
              fontWeight:'500',
              marginBottom:'1.5rem',
              color: alert.message === 'บันทึกข้อมูลสำเร็จ' ? '#16a085' : '#e74c3c'
            }}>
              {alert.message}
            </div>
            <button
              onClick={() => setAlert({ show: false, message: '' })}
              style={{
                background: alert.message === 'บันทึกข้อมูลสำเร็จ' ? '#16a085' : '#e74c3c',
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

export default TeacherManageStudents;

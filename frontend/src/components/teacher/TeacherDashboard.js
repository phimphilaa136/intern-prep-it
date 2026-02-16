import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FaUserGraduate, FaBuilding, FaListAlt, FaClipboardList, FaCheckCircle, FaFileAlt, FaStar, FaChartBar, FaSignOutAlt, FaHome, FaGraduationCap, FaUsers } from 'react-icons/fa';
import { FaClipboardCheck } from 'react-icons/fa';
import '../../styles/main.css';



function TeacherDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [summary, setSummary] = useState({
    studentCount: 0,
    agencyCount: 0,
    openAgencyCount: 0,
    requestStudentCount: 0
  });

  useEffect(() => {
    if (location.pathname === '/teacher' || location.pathname === '/teacher/') {
      fetch('http://localhost:5000/api/summary/teacher-dashboard')
        .then(res => res.json())
        .then(data => {
          setSummary({
            studentCount: data.studentCount || 0,
            agencyCount: data.agencyCount || 0,
            openAgencyCount: data.openAgencyCount || 0,
            requestStudentCount: data.requestStudentCount || 0
          });
        })
        .catch(() => setSummary({
          studentCount: 0,
          agencyCount: 0,
          openAgencyCount: 0,
          requestStudentCount: 0
        }));
    }
  }, [location.pathname]);

  const handleLogout = () => {
    // เพิ่ม logic ออกจากระบบถ้าต้องการ
    navigate('/');
  };

  // ตรวจสอบว่าอยู่หน้าแรกของแดชบอร์ด (path ตรงกับ /teacher หรือ /teacher/)
  const isHome = location.pathname === '/teacher' || location.pathname === '/teacher/';

  return (
    <div className="dashboard">
      <aside className="sidebar teacher-sidebar">
        <h3 className="sidebar-title">อาจารย์ฝ่ายสหกิจ</h3>
        <ul className="sidebar-menu">
          <li><Link to="."><span style={{display:'flex',alignItems:'center',gap:'0.7rem'}}><FaHome className="sidebar-icon" /><span>หน้าหลัก</span></span></Link></li>
          <li><Link to="manage-students"><span style={{display:'flex',alignItems:'center',gap:'0.7rem'}}><FaUserGraduate className="sidebar-icon" /><span>จัดการนักศึกษา</span></span></Link></li>
          <li><Link to="manage-agencies"><span style={{display:'flex',alignItems:'center',gap:'0.7rem'}}><FaBuilding className="sidebar-icon" /><span>จัดการหน่วยงาน</span></span></Link></li>
          <li><Link to="agency-list"><span style={{display:'flex',alignItems:'center',gap:'0.7rem'}}><FaListAlt className="sidebar-icon" /><span>รายชื่อหน่วยงานที่เปิดรับ</span></span></Link></li>
          <li><Link to="student-requests"><span style={{display:'flex',alignItems:'center',gap:'0.7rem'}}><FaClipboardList className="sidebar-icon" /><span>รายชื่อนักศึกษาขอเข้าฝึก</span></span></Link></li>
          <li><Link to="check-worklog"><span style={{display:'flex',alignItems:'center',gap:'0.7rem'}}><FaCheckCircle className="sidebar-icon" /><span>ตรวจสอบการปฏิบัติงานของนักศึกษา</span></span></Link></li>
          <li><Link to="check-report"><span style={{display:'flex',alignItems:'center',gap:'0.7rem'}}><FaFileAlt className="sidebar-icon" /><span>ตรวจสอบเล่มรายงาน</span></span></Link></li>
          <li><Link to="evaluation"><span style={{display:'flex',alignItems:'center',gap:'0.7rem'}}><FaStar className="sidebar-icon" /><span>ประเมินผล</span></span></Link></li>
          <li><Link to="agency-evaluation-report"><span style={{display:'flex',alignItems:'center',gap:'0.7rem'}}><FaClipboardCheck className="sidebar-icon" /><span>รายงานประเมินผลของหัวหน้างาน</span></span></Link></li>
          <li><Link to="report-summary"><span style={{display:'flex',alignItems:'center',gap:'0.7rem'}}><FaChartBar className="sidebar-icon" /><span>รายงานผล</span></span></Link></li>
        </ul>
        <button className="logout-btn" onClick={handleLogout}><FaSignOutAlt style={{marginRight:8}} /> ออกจากระบบ</button>
      </aside>
      <main className="main-content">
        {isHome ? (
          <>
            <div style={{
              background: '#1476fe',
              color: 'white',
              borderRadius: '8px',
              padding: '4rem 0',
              marginBottom: '2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(20,118,254,0.08)'
            }}>
              <FaGraduationCap size={64} style={{marginBottom: '1.5rem'}} />
              <h2 style={{fontWeight: 700, fontSize: '2rem', marginBottom: '0.5rem'}}>ยินดีต้อนรับสู่ระบบสหกิจศึกษา</h2>
              <div style={{fontSize: '1.1rem', fontWeight: 400}}>จัดการและติดตามการฝึกงานของนักศึกษาอย่างมีประสิทธิภาพ</div>
            </div>
            <div style={{
              display: 'flex',
              gap: '2rem',
              marginBottom: '2rem',
              justifyContent: 'center',
              flexWrap: 'nowrap',
              flexDirection: 'row',
              overflowX: 'auto',
              alignItems: 'stretch'
            }}>
              {/* นักศึกษาทั้งหมด (tb_student) */}
              <div style={{flex:'0 0 260px',background:'#fff',borderRadius:'12px',boxShadow:'0 2px 8px rgba(44,62,80,0.06)',padding:'2.2rem 0',display:'flex',flexDirection:'column',alignItems:'center',marginBottom:'1rem',minWidth:'260px',maxWidth:'320px'}}>
                <FaUsers size={40} color="#1476fe" style={{marginBottom:'0.7rem'}} />
                <div style={{fontSize:'2.3rem',fontWeight:700,color:'#1476fe',marginBottom:'0.2rem'}}>{summary.studentCount}</div>
                <div style={{fontWeight:600,fontSize:'1.08rem',marginBottom:'0.2rem',color:'#222'}}>นักศึกษาทั้งหมด</div>
                <div style={{fontSize:'1rem',color:'#666'}}>จากฐานข้อมูลนักศึกษา</div>
              </div>
              {/* หน่วยงานทั้งหมด (tb_supervisor) */}
              <div style={{flex:'0 0 260px',background:'#fff',borderRadius:'12px',boxShadow:'0 2px 8px rgba(44,62,80,0.06)',padding:'2.2rem 0',display:'flex',flexDirection:'column',alignItems:'center',marginBottom:'1rem',minWidth:'260px',maxWidth:'320px'}}>
                <FaBuilding size={40} color="#1b8752" style={{marginBottom:'0.7rem'}} />
                <div style={{fontSize:'2.3rem',fontWeight:700,color:'#1b8752',marginBottom:'0.2rem'}}>{summary.agencyCount}</div>
                <div style={{fontWeight:600,fontSize:'1.08rem',marginBottom:'0.2rem',color:'#222'}}>หน่วยงานทั้งหมด</div>
                <div style={{fontSize:'1rem',color:'#666'}}>จากฐานข้อมูลหน่วยงาน</div>
              </div>
              {/* หน่วยงานที่เปิดรับทั้งหมด (tb_open_for_students) */}
              <div style={{flex:'0 0 260px',background:'#fff',borderRadius:'12px',boxShadow:'0 2px 8px rgba(44,62,80,0.06)',padding:'2.2rem 0',display:'flex',flexDirection:'column',alignItems:'center',marginBottom:'1rem',minWidth:'260px',maxWidth:'320px'}}>
                <FaListAlt size={40} color="#1b8752" style={{marginBottom:'0.7rem'}} />
                <div style={{fontSize:'2.3rem',fontWeight:700,color:'#1b8752',marginBottom:'0.2rem'}}>{summary.openAgencyCount}</div>
                <div style={{fontWeight:600,fontSize:'1.08rem',marginBottom:'0.2rem',color:'#222'}}>หน่วยงานที่เปิดรับทั้งหมด</div>
                <div style={{fontSize:'1rem',color:'#666'}}>จากฐานข้อมูลเปิดรับนักศึกษา</div>
              </div>
              {/* นักศึกษาขอเข้าฝึกทั้งหมด (tb_internship_enrollment) */}
              <div style={{flex:'0 0 260px',background:'#fff',borderRadius:'12px',boxShadow:'0 2px 8px rgba(44,62,80,0.06)',padding:'2.2rem 0',display:'flex',flexDirection:'column',alignItems:'center',marginBottom:'1rem',minWidth:'260px',maxWidth:'320px'}}>
                <FaClipboardList size={40} color="#1476fe" style={{marginBottom:'0.7rem'}} />
                <div style={{fontSize:'2.3rem',fontWeight:700,color:'#1476fe',marginBottom:'0.2rem'}}>{summary.requestStudentCount}</div>
                <div style={{fontWeight:600,fontSize:'1.08rem',marginBottom:'0.2rem',color:'#222'}}>นักศึกษาขอเข้าฝึกทั้งหมด</div>
                <div style={{fontSize:'1rem',color:'#666'}}>จากฐานข้อมูลคำขอฝึกงาน</div>
              </div>
            </div>
          </>
        ) : <Outlet />}
      </main>
    </div>
  );
}

export default TeacherDashboard;

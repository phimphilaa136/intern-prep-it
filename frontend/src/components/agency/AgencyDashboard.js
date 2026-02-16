import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FaUserTie, FaUsers, FaClipboardCheck, FaStar, FaSignOutAlt, FaBuilding, FaHome } from 'react-icons/fa';
import '../../styles/main.css';

function AgencyDashboard() {
  const [supervisor, setSupervisor] = useState({ supervisor_name: '-', agency_name: '-' });
  const navigate = useNavigate();

  useEffect(() => {
    const supervisor_id = localStorage.getItem('supervisor_id');
    if (supervisor_id) {
      fetch(`http://localhost:5000/api/register/agency/supervisor-info?supervisor_id=${supervisor_id}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.supervisor_name && data.agency_name) {
            setSupervisor({
              supervisor_name: data.supervisor_name,
              agency_name: data.agency_name
            });
          } else {
            setSupervisor({ supervisor_name: '-', agency_name: '-' });
          }
        })
        .catch(() => setSupervisor({ supervisor_name: '-', agency_name: '-' }));
    } else {
      setSupervisor({ supervisor_name: '-', agency_name: '-' });
    }
  }, []);

  const location = useLocation();
  const handleLogout = () => {
    localStorage.removeItem('supervisor_id');
    localStorage.removeItem('supervisor_name');
    localStorage.removeItem('agency_name');
    navigate('/');
  };

  const isHome = location.pathname === '/agency' || location.pathname === '/agency/';

  return (
    <div className="dashboard">
      <aside className="sidebar agency-sidebar">
        <h3 className="sidebar-title">หน่วยงาน</h3>
        <ul className="sidebar-menu">
          <li><Link to="."><span style={{display:'flex',alignItems:'center',gap:'0.7rem'}}><FaHome className="sidebar-icon" /><span>หน้าหลัก</span></span></Link></li>
          <li><Link to="open-registration"><span style={{display:'flex',alignItems:'center',gap:'0.7rem'}}><FaUserTie className="sidebar-icon" /><span>เปิดรับนักศึกษา</span></span></Link></li>
          <li><Link to="student-list"><span style={{display:'flex',alignItems:'center',gap:'0.7rem'}}><FaUsers className="sidebar-icon" /><span>รายชื่อนักศึกษาที่เข้าฝึกกับหน่วยงาน</span></span></Link></li>
          <li><Link to="confirm-worklog"><span style={{display:'flex',alignItems:'center',gap:'0.7rem'}}><FaClipboardCheck className="sidebar-icon" /><span>ยืนยันการปฏิบัติงานของนักศึกษา</span></span></Link></li>
          <li><Link to="evaluation"><span style={{display:'flex',alignItems:'center',gap:'0.7rem'}}><FaStar className="sidebar-icon" /><span>ประเมินผล</span></span></Link></li>
        </ul>
        <button className="logout-btn" onClick={handleLogout}><FaSignOutAlt style={{marginRight:8}} /> ออกจากระบบ</button>
      </aside>
      <main className="main-content">
        {isHome ? (
          <>
            <div style={{
              background: '#1b8752',
              color: 'white',
              borderRadius: '8px',
              padding: '4rem 0',
              marginBottom: '2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(27,135,82,0.08)'
            }}>
              <FaBuilding size={64} style={{marginBottom: '1.5rem'}} />
              <h2 style={{fontWeight: 700, fontSize: '2rem', marginBottom: '0.5rem'}}>ยินดีต้อนรับสู่ระบบจัดการนักศึกษาฝึกงาน</h2>
              <div style={{fontSize: '1.1rem', fontWeight: 400}}>จัดการและติดตามการฝึกงานของนักศึกษาอย่างมีประสิทธิภาพ</div>
            </div>
            {/* ประกาศกิจกรรม/กำหนดการนักศึกษาฝึกงาน */}
            <div style={{background:'#fff',borderRadius:'8px',boxShadow:'0 2px 8px rgba(44,62,80,0.06)',padding:'2rem',marginBottom:'2rem',maxWidth:'900px',margin:'0 auto'}}>
              <h3 style={{fontWeight:700,fontSize:'1.3rem',marginBottom:'1.2rem',color:'#1b8752'}}>ประกาศกิจกรรมและกำหนดการนักศึกษาฝึกงาน</h3>
              <table style={{width:'100%',borderCollapse:'collapse',background:'#f9f9f9',borderRadius:'8px'}}>
                <thead>
                  <tr style={{background:'#eaf6fb'}}>
                    <th style={{padding:'0.7rem',fontWeight:600}}>กิจกรรม</th>
                    <th style={{padding:'0.7rem',fontWeight:600}}>วัน / เดือน / ปี</th>
                    <th style={{padding:'0.7rem',fontWeight:600}}>หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td style={{padding:'0.7rem'}}>นัดหมายประชุมชี้แจงรายละเอียดการเตรียมความพร้อมสหกิจศึกษา (CWIE)</td><td style={{padding:'0.7rem'}}>15 ม.ค. 2568</td><td style={{padding:'0.7rem'}}></td></tr>
                  <tr><td style={{padding:'0.7rem'}}>นักศึกษาสำรวจข้อมูลเตรียมฝึกฯ เพื่อขอเข้าฝึกตามหน่วยงานภายในมหาวิทยาลัย/บริษัท/ราชการ/เอกชน</td><td style={{padding:'0.7rem'}}>16 ม.ค. 2568</td><td style={{padding:'0.7rem'}}></td></tr>
                  <tr><td style={{padding:'0.7rem'}}>อาจารย์ที่ปรึกษาตอบ เลือกหน่วยงานเตรียมฝึกฯ ให้กับนักศึกษา</td><td style={{padding:'0.7rem'}}>17 ม.ค. 2568</td><td style={{padding:'0.7rem'}}></td></tr>
                  <tr><td style={{padding:'0.7rem'}}>คณะดำเนินการออกหนังสือส่งตัวนักศึกษาเตรียมฝึกฯ ไปยังหน่วยงาน</td><td style={{padding:'0.7rem'}}>20 ม.ค. 2568</td><td style={{padding:'0.7rem'}}></td></tr>
                  <tr><td style={{padding:'0.7rem'}}>ปฐมนิเทศเตรียมฝึกฯ พร้อมนักศึกษารับเอกสาร<br/>1. คู่มือเตรียมความพร้อมสหกิจศึกษา (CWIE)<br/>2. หนังสือส่งตัวนักศึกษาออกเตรียมฝึกฯ</td><td style={{padding:'0.7rem'}}>21 ม.ค. 2568</td><td style={{padding:'0.7rem'}}></td></tr>
                  <tr><td style={{padding:'0.7rem'}}>นักศึกษารับปฏิบัติงานเตรียมฝึกฯ ตามหน่วยงานต่างๆ และนักศึกษาต้องรายงานความก้าวหน้า/ระเบียบการเตรียมฝึกฯ <b>โดยเคร่งครัด</b> และอาจารย์ที่ปรึกษาตรวจสอบการปฏิบัติงานต่างๆ และลงชื่อรับรองให้ครบถ้วน</td><td style={{padding:'0.7rem'}}>21 ม.ค. 2568 - 30 เม.ย. 2568</td><td style={{padding:'0.7rem'}}>ชั่วโมงการฝึกต้องรวมแล้วไม่น้อยกว่า 90 ชม.</td></tr>
                  <tr><td style={{padding:'0.7rem'}}>นักศึกษาส่งรายงานเทคนิคเตรียมฝึกฯ ตามหน่วยงาน</td><td style={{padding:'0.7rem'}}>17-21 ก.พ. 2568</td><td style={{padding:'0.7rem'}}></td></tr>
                  <tr><td style={{padding:'0.7rem'}}>อาจารย์กำหนดเวลารายงานเตรียมฝึกฯ หน่วยงานทำหนังสือส่งตัวนักศึกษา<br/>หมายเหตุ: <b>นักศึกษาจะต้องส่งหนังสือส่งตัวกลับ</b> ยื่นที่สาขาวิชา</td><td style={{padding:'0.7rem'}}>5-9 พ.ค. 2568</td><td style={{padding:'0.7rem'}}>ส่งเอกสารที่สาขาวิชา</td></tr>
                  <tr><td style={{padding:'0.7rem'}}>ส่งข้อมูลสรุปฝึกฯ (ที่กรอกข้อมูลและแบบประเมินเรียบร้อย) พร้อมด้วยหนังสือรับรองการฝึกงาน</td><td style={{padding:'0.7rem'}}>12-16 พ.ค. 2568</td><td style={{padding:'0.7rem'}}></td></tr>
                  <tr><td style={{padding:'0.7rem'}}>นักศึกษาจัดทำ/ส่งปลายทางสรุปผลการออกเตรียมฝึกฯ</td><td style={{padding:'0.7rem'}}>19-23 พ.ค. 2568</td><td style={{padding:'0.7rem'}}></td></tr>
                </tbody>
              </table>
            </div>
          </>
        ) : <Outlet />}
      </main>
    </div>
  );
}

export default AgencyDashboard;

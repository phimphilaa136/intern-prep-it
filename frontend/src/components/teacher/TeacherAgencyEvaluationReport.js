import React, { useEffect, useState } from 'react';
import { FaUserGraduate, FaBuilding, FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaCalendarAlt, FaStar } from 'react-icons/fa';

function formatThaiDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d)) return '-';
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear() + 543;
  return `${day}/${month}/${year}`;
}

const criteria = [
  "ความถูกต้องและคุณภาพของงาน",
  "ความรับผิดชอบต่องานที่ได้รับมอบหมาย",
  "การใช้ความคิดริเริ่มสร้างสรรค์",
  "การรับรู้และความเข้าใจในการปฏิบัติงาน",
  "มนุษยสัมพันธ์",
  "การแต่งกาย",
  "ไหวพริบปฏิภาณในการแก้ปัญหา",
  "กิริยา มารยาท",
  "ความซื่อสัตย์",
  "การแสวงหาความรู้ใหม่ๆ และนำมาใช้ในงาน"
];

function StarBar({ score }) {
  // แสดงดาวเต็ม 5 ดวง
  return (
    <span>
      {[...Array(5)].map((_, i) =>
        <FaStar key={i} style={{color: i < score ? '#fbc02d' : '#e0e0e0', marginRight:2}} />
      )}
      <span style={{marginLeft:8, fontWeight:'bold', color:'#2979ff'}}>{score ?? '-'}/5</span>
    </span>
  );
}

function TeacherAgencyEvaluationReport() {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchStudentId, setSearchStudentId] = useState('');
  const [searchStudentName, setSearchStudentName] = useState('');
  const [searchAgency, setSearchAgency] = useState('');
  const [selectedYear, setSelectedYear] = useState('ทั้งหมด');
  const [showModalIdx, setShowModalIdx] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch('/api/register/teacher/agency-evaluations')
      .then(res => res.json())
      .then(data => setEvaluations(Array.isArray(data) ? data : []))
      .catch(() => setError('ไม่สามารถดึงข้อมูลได้'))
      .finally(() => setLoading(false));
  }, []);

  // ฟิลเตอร์ข้อมูลตามช่องค้นหาและปี
  const filteredEvaluations = evaluations.filter(e =>
    (!searchStudentId || e.student_id?.toString().includes(searchStudentId)) &&
    (!searchStudentName || e.student_name?.toLowerCase().includes(searchStudentName.toLowerCase())) &&
    (!searchAgency || e.agency_name?.toLowerCase().includes(searchAgency.toLowerCase())) &&
    (selectedYear === 'ทั้งหมด' || (e.evaluated_at && (new Date(e.evaluated_at).getFullYear() + 543).toString() === selectedYear))
  );

  return (
    <div style={{background:'#f8f9fa',padding:'2rem',borderRadius:'16px',boxShadow:'0 2px 12px rgba(44,62,80,0.08)',maxWidth:'1400px',margin:'2rem auto'}}>
      <h2 style={{marginBottom:'2rem',color:'#16a085',display:'flex',alignItems:'center',gap:'0.7rem'}}>
        <FaBuilding style={{marginRight:6}}/> รายงานประเมินผลของหัวหน้างาน
      </h2>
      {/* ช่องค้นหาและช่องเลือกปีอยู่แถวเดียวกัน ด้านขวา */}
      <div style={{
        display:'flex',
        justifyContent:'space-between',
        alignItems:'center',
        marginBottom:'1.5rem',
        flexWrap:'wrap'
      }}>
        <div style={{display:'flex',gap:'1rem',flexWrap:'wrap'}}>
          <input
            type="text"
            placeholder="ค้นหารหัสนักศึกษา"
            value={searchStudentId}
            onChange={e => setSearchStudentId(e.target.value)}
            style={{padding:'0.7rem 1.2rem',borderRadius:'8px',border:'1.5px solid #000000ff',fontSize:'1.08rem',minWidth:'160px'}}
          />
          <input
            type="text"
            placeholder="ค้นหาชื่อนามสกุล"
            value={searchStudentName}
            onChange={e => setSearchStudentName(e.target.value)}
            style={{padding:'0.7rem 1.2rem',borderRadius:'8px',border:'1.5px solid #000000ff',fontSize:'1.08rem',minWidth:'160px'}}
          />
          <input
            type="text"
            placeholder="ค้นหาหน่วยงาน"
            value={searchAgency}
            onChange={e => setSearchAgency(e.target.value)}
            style={{padding:'0.4rem 1.2rem',borderRadius:'8px',border:'1.5px solid #000000ff',fontSize:'1.08rem',minWidth:'160px'}}
          />
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'0.7rem'}}>
          <label htmlFor="year-select" style={{fontWeight:'bold',color:'#000000ff'}}></label>
          <select
            id="year-select"
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            style={{padding:'0.4rem 1.2rem',borderRadius:'8px',border:'1.5px solid #000000ff',fontSize:'1.08rem'}}
          >
            <option value="ทั้งหมด">ทั้งหมด</option>
            <option value="2566">2566</option>
            <option value="2567">2567</option>
            <option value="2568">2568</option>
            <option value="2569">2569</option>
          </select>
        </div>
      </div>
      {error && <div style={{color:'#e74c3c',marginBottom:'1rem'}}>{error}</div>}
      {loading && <div style={{color:'#16a085',marginBottom:'1rem'}}>กำลังโหลดข้อมูล...</div>}
      <table style={{width:'100%',background:'#fff',borderRadius:'12px',boxShadow:'0 2px 8px rgba(44,62,80,0.08)',overflow:'hidden',fontSize:'1rem'}}>
        <thead style={{background:'#2979ff',color:'#fff'}}>
          <tr>
            <th style={{textAlign:'center'}}><FaCalendarAlt style={{marginRight:4}}/> วันที่</th>
            <th style={{textAlign:'center'}}>รหัสนักศึกษา</th>
            <th style={{textAlign:'center'}}>ชื่อนามสกุล</th>
            <th style={{textAlign:'center'}}>คณะ</th>
            <th style={{textAlign:'center'}}>สาขา</th>
            <th style={{textAlign:'center'}}>ชื่อนามสกุลหัวหน้างาน</th>
            <th style={{textAlign:'center'}}>ชื่อหน่วยงาน</th>
            <th style={{textAlign:'center'}}>ผลประเมิน</th>
          </tr>
        </thead>
        <tbody>
          {filteredEvaluations.map((e,idx) => (
            <tr key={e.evaluation_id || idx} style={{background:idx%2===0?'#f4f8fb':'#fff'}}>
              <td style={{textAlign:'center'}}>{e.evaluated_at ? formatThaiDate(e.evaluated_at) : '-'}</td>
              <td style={{textAlign:'center'}}>{e.student_id}</td>
              <td style={{textAlign:'center'}}>{e.student_name}</td>
              <td style={{textAlign:'center'}}>{e.student_fac || '-'}</td>
              <td style={{textAlign:'center'}}>{e.student_major || '-'}</td>
              <td style={{textAlign:'center'}}>{e.supervisor_name || '-'}</td>
              <td style={{textAlign:'center'}}>{e.agency_name}</td>
              <td style={{textAlign:'center'}}>
                <button
                  style={{
                    background:'#2979ff',
                    color:'#fff',
                    border:'none',
                    borderRadius:'8px',
                    padding:'0.5rem 1.2rem',
                    fontWeight:'bold',
                    fontSize:'1rem',
                    cursor:'pointer',
                    boxShadow:'0 2px 8px rgba(44,62,80,0.10)'
                  }}
                  onClick={()=>setShowModalIdx(idx)}
                >
                  ดูผลประเมิน
                </button>
                {showModalIdx === idx && (
                  <div style={{
                    position:'fixed',
                    top:'50%',
                    left:'50%',
                    transform:'translate(-50%,-50%)',
                    zIndex:1000,
                    background:'#fff',
                    borderRadius:'14px',
                    boxShadow:'0 2px 16px rgba(44,62,80,0.18)',
                    padding:'2rem',
                    maxWidth:'480px',
                    width:'95vw',
                    maxHeight:'90vh',
                    overflow:'auto'
                  }}>
                    <h3 style={{marginBottom:'1rem',color:'#2979ff',textAlign:'center'}}>ผลประเมินของหัวหน้างาน</h3>
                    <div style={{marginBottom:'1rem',fontWeight:'bold',fontSize:'1.08rem'}}>
                      คะแนนรวม: <span style={{color:'#16a085'}}>{e.total_score ?? '-'}</span>
                    </div>
                    <div style={{marginBottom:'1rem',fontWeight:'bold',fontSize:'1.08rem'}}>คะแนนแต่ละข้อ (เต็ม 5):</div>
                    <table style={{width:'100%',marginBottom:'1rem',borderCollapse:'collapse'}}>
                      <tbody>
                        {criteria.map((c, i) => (
                          <tr key={i} style={{borderBottom:'1px solid #eee'}}>
                            <td style={{padding:'0.5rem 0.5rem',verticalAlign:'top',textAlign:'left'}}>{i+1}. {c}</td>
                            <td style={{padding:'0.5rem 0.5rem',textAlign:'right'}}>
                              <StarBar score={e[`score_${i+1}`]} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{marginBottom:'1rem',fontWeight:'bold',fontSize:'1.08rem',textAlign:'left'}}>
                      ความคิดเห็น: <span style={{color:'#2c3e50'}}>{e.comment ?? '-'}</span>
                    </div>
                    <div style={{textAlign:'center'}}>
                      <button
                        style={{
                          background:'#bdc3c7',
                          color:'#2c3e50',
                          border:'none',
                          borderRadius:'8px',
                          padding:'0.7rem 1.5rem',
                          fontWeight:'500',
                          fontSize:'1rem',
                          cursor:'pointer',
                          marginTop:'1rem'
                        }}
                        onClick={()=>setShowModalIdx(null)}
                      >
                        ปิด
                      </button>
                    </div>
                  </div>
                )}
                {showModalIdx === idx && (
                  <div style={{
                    position:'fixed',
                    top:0,
                    left:0,
                    width:'100vw',
                    height:'100vh',
                    background:'rgba(44,62,80,0.15)',
                    zIndex:999
                  }} onClick={()=>setShowModalIdx(null)}></div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TeacherAgencyEvaluationReport;

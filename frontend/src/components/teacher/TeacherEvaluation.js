import React, { useState, useEffect } from 'react';
import { FaUserGraduate, FaBuilding, FaStar, FaCheckCircle, FaEdit, FaClipboardList, FaCommentDots, FaCalendarAlt, FaEye } from 'react-icons/fa';

function TeacherEvaluation() {
  // ดึงข้อมูลนักศึกษาจาก tb_internship_enrollment สำหรับหน้าประเมินผล
  const [students, setStudents] = useState([]);
  const [evaluated, setEvaluated] = useState([]);
  const [searchStudentId, setSearchStudentId] = useState('');
  const [searchStudentName, setSearchStudentName] = useState('');
  const [searchAgency, setSearchAgency] = useState('');
  const [selectedYear, setSelectedYear] = useState('ทั้งหมด');
  useEffect(() => {
    fetch('/api/register/teacher/students-for-evaluation-simple')
      .then(res => res.json())
      .then(data => {
        setStudents(Array.isArray(data) ? data : []);
      });
    fetch('/api/register/teacher/evaluated-students')
      .then(res => res.json())
      .then(data => {
        setEvaluated(Array.isArray(data) ? data : []);
      });
  }, []);
  const [evalIdx, setEvalIdx] = useState(null);
  const [form, setForm] = useState({
    scores: Array(10).fill(null),
    comment: '',
  });

  const criteria = [
    'ความเข้าใจในการทำงาน',
    'เวลาในการปฏิบัติงาน',
    'การนำความรู้มาใช้ในหน่วยงาน',
    'การแต่งกาย',
    'รูปเล่มรายงาน',
    'การนำเสนอประสบการณ์หลังออกเตรียมฝึก',
    'เข้าร่วมกิจกรรมเตรียมความพร้อม',
    'จิตพิสัย',
    'ความมีน้ำใจ',
    'การสื่อสารและการทำงานเป็นทีม',
  ];
  const total = form.scores.reduce((sum, v) => sum + (v || 0), 0);
  const canSubmit = form.scores.every(v => v !== null);

  // ฟิลเตอร์ข้อมูล
  const filteredStudents = students.filter(s => {
    // ปี พ.ศ.
    if (selectedYear !== 'ทั้งหมด') {
      const year = s.created_at ? new Date(s.created_at).getFullYear() + 543 : '';
      if (year.toString() !== selectedYear) return false;
    }
    // รหัสนักศึกษา
    if (searchStudentId && !s.student_id?.toString().includes(searchStudentId)) return false;
    // ชื่อนามสกุล
    if (searchStudentName && !s.student_name?.toLowerCase().includes(searchStudentName.toLowerCase())) return false;
    // หน่วยงาน
    if (searchAgency && !s.agency_name?.toLowerCase().includes(searchAgency.toLowerCase())) return false;
    return true;
  });

  const handleScore = (idx, val) => {
    setForm(f => ({ ...f, scores: f.scores.map((v,i)=>i===idx?val:v) }));
  };
  const handleComment = e => {
    setForm(f => ({ ...f, comment: e.target.value }));
  };
  const handleSubmit = async e => {
    e.preventDefault();
    const student = students[evalIdx];
    const payload = {
      student_id: student.student_id,
      student_name: student.student_name,
      agency_name: student.agency_name,
      scores: form.scores,
      total_score: total,
      comment: form.comment
    };
    await fetch('/api/register/teacher/evaluation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    // รีเฟรชข้อมูลหลังบันทึก
    fetch('/api/register/teacher/students-for-evaluation-simple')
      .then(res => res.json())
      .then(data => setStudents(Array.isArray(data) ? data : []));
    fetch('/api/register/teacher/evaluated-students')
      .then(res => res.json())
      .then(data => setEvaluated(Array.isArray(data) ? data : []));
    setEvalIdx(null);
    setForm({ scores: Array(10).fill(null), comment: '' });
  };

  // ตัวอย่างฟังก์ชันแปลงวันที่ evaluated_at เป็นรูปแบบ พ.ศ.
  function formatThaiDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d)) return '-';
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear() + 543;
    return `${day}/${month}/${year}`;
  }

  // สำหรับ modal ดูผลประเมิน
  const [viewIdx, setViewIdx] = useState(null);

  // สร้างตัวแปรสำหรับ modal ดูผลประเมิน
  let viewModal = null;
  if (viewIdx !== null) {
    const s = filteredStudents[viewIdx];
    const evalResult = evaluated.find(e => e.student_id === s.student_id);

    const criteriaHead = [
      'ความเข้าใจในการทำงาน',
      'เวลาในการปฏิบัติงาน',
      'การนำความรู้มาใช้ในหน่วยงาน',
      'การแต่งกาย',
      'รูปเล่มรายงาน',
      'การนำเสนอประสบการณ์หลังออกเตรียมฝึก',
      'เข้าร่วมกิจกรรมเตรียมความพร้อม',
      'จิตพิสัย',
      'ความมีน้ำใจ',
      'การสื่อสารและการทำงานเป็นทีม'
    ];

    viewModal = (
      <div style={{
        position:'fixed',
        top:'50%',
        left:'50%',
        transform:'translate(-50%,-50%)',
        zIndex:1000,
        background:'#fff',
        borderRadius:'16px',
        boxShadow:'0 4px 24px rgba(44,62,80,0.22)',
        padding:'2.5rem',
        maxWidth:'650px',
        width:'97vw',
        maxHeight:'95vh',
        overflow:'auto',
        border:'2px solid #e0e0e0'
      }}>
        <h3 style={{marginBottom:'1rem',color:'#2979ff',textAlign:'center',fontWeight:'bold',fontSize:'1.3rem'}}>ผลการประเมิน</h3>
        <div style={{marginBottom:'1.2rem',fontWeight:'bold',color:'#222',textAlign:'center',fontSize:'1.08rem'}}>
          รหัสนักศึกษา: {s.student_id} | ชื่อนามสกุล: {s.student_name} | หน่วยงาน: {s.agency_name}
        </div>
        <div style={{marginBottom:'0.7rem',textAlign:'center',fontWeight:'bold',fontSize:'1.08rem'}}>
          คะแนนรวม: <span style={{color:'#16a085'}}>{evalResult ? evalResult.total_score : '-'}</span>
        </div>
        <div style={{marginBottom:'0.7rem',textAlign:'center',fontWeight:'bold',fontSize:'1.08rem'}}>
          คะแนนแต่ละข้อ (เต็ม 5):
        </div>
        <table style={{width:'100%',background:'none',borderRadius:'8px',marginBottom:'1.2rem',fontSize:'1rem',borderCollapse:'collapse'}}>
          <tbody>
            {criteriaHead.map((c,i)=>(
              <tr key={i}>
                <td style={{padding:'0.4rem 0.2rem',fontWeight:'500',color:'#222',fontSize:'1rem',width:'44%'}}>{i+1}. {c}</td>
                <td style={{padding:'0.4rem 0.2rem',width:'28%',textAlign:'center'}}>
                  {[...Array(5)].map((_,starIdx) => (
                    <FaStar
                      key={starIdx}
                      color={
                        evalResult && Array.isArray(evalResult.scores) && evalResult.scores[i] > 0
                          ? (starIdx < evalResult.scores[i] ? "#fbc02d" : "#e0e0e0")
                          : "#e0e0e0"
                      }
                      style={{marginRight:2,fontSize:'1.15rem',verticalAlign:'middle'}}
                    />
                  ))}
                </td>
                <td style={{padding:'0.4rem 0.2rem',width:'18%',textAlign:'right',fontWeight:'bold',color:'#2979ff'}}>
                  {evalResult && Array.isArray(evalResult.scores) && typeof evalResult.scores[i] === 'number'
                    ? `${evalResult.scores[i]}/5`
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{marginBottom:'1.2rem',color:'#222',fontWeight:'bold'}}>ความคิดเห็น:</div>
        <div style={{
          width:'100%',
          borderRadius:'8px',
          border:'1px solid #e0e0e0',
          padding:'0.7rem',
          fontSize:'1rem',
          background:'#f9f9fa',
          color:'#222',
          marginBottom:'1.2rem'
        }}>
          {evalResult ? evalResult.comment : '-'}
        </div>
        <div style={{marginTop:'1.2rem',display:'flex',justifyContent:'center'}}>
          <button type="button" onClick={()=>setViewIdx(null)} style={{
            background:'#bdc3c7',
            color:'#2c3e50',
            border:'none',
            borderRadius:'8px',
            padding:'0.7rem 1.5rem',
            fontWeight:'500',
            fontSize:'1rem',
            cursor:'pointer'
          }}>ปิด</button>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-evaluation" style={{background:'#f8f9fa',padding:'2rem',borderRadius:'16px',boxShadow:'0 2px 12px rgba(44,62,80,0.08)',maxWidth:'1400px',margin:'2rem auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:'1.5rem'}}>
        <div>
          <h2 style={{color:'#16a085',display:'flex',alignItems:'center',gap:'0.7rem',marginBottom:'1rem'}}><FaClipboardList style={{marginRight:6}}/> ประเมินผลการฝึก</h2>
          {/* ช่องค้นหาอยู่ด้านซ้ายล่างข้อความ */}
          <div style={{display:'flex',gap:'1rem',flexWrap:'wrap',marginTop:'0.5rem'}}>
            <input
              type="text"
              placeholder="ค้นหารหัสนักศึกษา"
              value={searchStudentId}
              onChange={e => setSearchStudentId(e.target.value)}
              style={{padding:'0.4rem 1.2rem',borderRadius:'8px',border:'1.5px solid #000000ff',fontSize:'1.08rem',minWidth:'160px'}}
            />
            <input
              type="text"
              placeholder="ค้นหาชื่อนามสกุล"
              value={searchStudentName}
              onChange={e => setSearchStudentName(e.target.value)}
              style={{padding:'0.4rem 1.2rem',borderRadius:'8px',border:'1.5px solid #000000ff',fontSize:'1.08rem',minWidth:'160px'}}
            />
            <input
              type="text"
              placeholder="ค้นหาหน่วยงาน"
              value={searchAgency}
              onChange={e => setSearchAgency(e.target.value)}
              style={{padding:'0.4rem 1.2rem',borderRadius:'8px',border:'1.5px solid #000000ff',fontSize:'1.08rem',minWidth:'160px'}}
            />
          </div>
        </div>
        {/* ช่องเลือกปีอยู่ด้านขวาของหน้าจอ */}
        <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end'}}>
          <label htmlFor="year-select" style={{fontWeight:'bold',color:'#000000ff',marginBottom:'0.4rem'}}></label>
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
          </select>
        </div>
      </div>
      <table style={{width:'100%',background:'#fff',borderRadius:'12px',boxShadow:'0 2px 8px rgba(12, 124, 236, 0.08)',overflow:'hidden',fontSize:'1rem',marginBottom:'2rem'}}>
        <thead style={{background:'#2979ff',color:'#fff'}}>
          <tr>
            <th style={{textAlign:'center'}}><FaCalendarAlt style={{marginRight:4}}/> วันที่</th>
            <th style={{textAlign:'center'}}><FaUserGraduate style={{marginRight:4}}/> รหัสนักศึกษา</th>
            <th style={{textAlign:'center'}}><FaUserGraduate style={{marginRight:4}}/> ชื่อนามสกุล</th>
            <th style={{textAlign:'center'}}><FaBuilding style={{marginRight:4}}/> ชื่อหน่วยงาน</th>
            <th style={{textAlign:'center'}}>การดำเนินการ</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map((s,idx)=>{
            const evalResult = evaluated.find(e => e.student_id === s.student_id);
            const isEvaluated = !!evalResult;
            return (
              <tr key={s.student_id} style={{background:idx%2===0?'#f4f8fb':'#fff'}}>
                <td style={{textAlign:'center'}}>
                  {evalResult && evalResult.evaluated_at
                    ? new Date(evalResult.evaluated_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'numeric', year: 'numeric' })
                    : '-'}
                </td>
                <td style={{textAlign:'center'}}>{s.student_id}</td>
                <td style={{textAlign:'center'}}>{s.student_name}</td>
                <td style={{textAlign:'center'}}>{s.agency_name}</td>
                <td style={{textAlign:'center',verticalAlign:'middle'}}>
                  {isEvaluated ? (
                    <button
                      onClick={()=>setViewIdx(idx)}
                      style={{
                        background:'#2979ff',
                        color:'#fff',
                        border:'none',
                        borderRadius:'8px',
                        padding:'0.4rem 1rem',
                        fontWeight:'500',
                        fontSize:'0.95rem',
                        cursor:'pointer',
                        display:'flex',
                        alignItems:'center',
                        gap:'0.5rem'
                      }}
                    >
                      <FaEye /> ดูผลประเมิน
                    </button>
                  ) : (
                    <button
                      onClick={()=>setEvalIdx(idx)}
                      style={{
                        background:'#2979ff',
                        color:'#fff',
                        border:'none',
                        borderRadius:'8px',
                        padding:'0.4rem 1rem',
                        fontWeight:'500',
                        fontSize:'0.95rem',
                        cursor:'pointer',
                        display:'flex',
                        alignItems:'center',
                        gap:'0.5rem'
                      }}
                    >
                      <FaEdit /> ประเมิน
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* Modal ประเมินผล */}
      {evalIdx!==null && (
        <div style={{
          position:'fixed',
          top:'50%',
          left:'50%',
          transform:'translate(-50%,-50%)',
          zIndex:1000,
          background:'#f4f8fb',
          borderRadius:'16px',
          boxShadow:'0 4px 24px rgba(44,62,80,0.22)',
          padding:'2.5rem',
          maxWidth:'800px',
          width:'97vw',
          maxHeight:'95vh',
          overflow:'auto',
          border:'2px solid #2979ff'
        }}>
          <h3 style={{marginBottom:'1rem',color:'#2979ff',textAlign:'center'}}><FaEdit style={{marginRight:6}}/> แบบฟอร์มประเมินผล</h3>
          <form onSubmit={handleSubmit}>
            <div style={{marginBottom:'1.2rem',fontWeight:'bold',color:'#000000ff',textAlign:'center'}}>
              รหัสนักศึกษา: {students[evalIdx].student_id} | ชื่อนามสกุล: {students[evalIdx].student_name} | หน่วยงาน: {students[evalIdx].agency_name}
            </div>
            <table style={{width:'100%',background:'#f9f9fa',borderRadius:'8px',boxShadow:'0 2px 8px rgba(44,62,80,0.08)',marginBottom:'1.5rem',fontSize:'1rem'}}>
              <thead style={{background:'#2979ff',color:'#fff'}}>
                <tr>
                  <th style={{textAlign:'center',padding:'0.5rem'}}>ลำดับ</th>
                  <th style={{textAlign:'center',padding:'0.5rem'}}>หัวข้อประเมิน</th>
                  <th style={{textAlign:'center',padding:'0.5rem'}}>คะแนนเต็ม</th>
                  <th style={{textAlign:'center',padding:'0.5rem'}}>คะแนนที่ได้</th>
                </tr>
              </thead>
              <tbody>
                {criteria.map((c,i)=>(
                  <tr key={i}>
                    <td style={{textAlign:'center',padding:'0.5rem',fontWeight:'bold',color:'#2979ff',fontSize:'1.1rem'}}>{i+1}</td>
                    <td style={{padding:'0.5rem'}}>{c}</td>
                    <td style={{textAlign:'center',padding:'0.5rem'}}>5</td>
                    <td style={{textAlign:'center',padding:'0.5rem'}}>
                      <div style={{display:'flex',gap:'0.7rem',justifyContent:'center'}}>
                        {[1,2,3,4,5].map(v=>(
                          <label key={v} style={{display:'flex',flexDirection:'column',alignItems:'center',cursor:'pointer'}}>
                            <input type="radio" name={`score${i}`} value={v} checked={form.scores[i]===v} onChange={()=>handleScore(i,v)} style={{width:0,height:0,position:'absolute',opacity:0}} />
                            <span style={{
                              display:'flex',alignItems:'center',justifyContent:'center',width:'32px',height:'32px',borderRadius:'50%',
                              background: form.scores[i]===v ? '#2979ff' : '#fff',
                              color: form.scores[i]===v ? '#fff' : '#34495e',
                              fontWeight:'bold',fontSize:'1.1rem',boxShadow:'0 2px 8px rgba(44,62,80,0.10)',
                              border: form.scores[i]===v ? '2px solid #2979ff' : '2px solid #bdc3c7',
                              cursor:'pointer',transition:'all 0.2s'
                            }}
                            onClick={()=>handleScore(i,v)}>{v}</span>
                          </label>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{marginBottom:'1.2rem'}}>
              <label style={{fontWeight:'500',color:'#34495e',marginBottom:'0.5rem',display:'block'}}><FaCommentDots style={{marginRight:6}}/> ความคิดเห็นเพิ่มเติม</label>
              <textarea rows={3} value={form.comment} onChange={handleComment} style={{width:'100%',borderRadius:'8px',border:'1px solid #bdc3c7',padding:'0.7rem',fontSize:'1rem'}} placeholder="กรอกความคิดเห็นเพิ่มเติม"></textarea>
            </div>
            <div style={{marginBottom:'1.2rem',textAlign:'right',fontWeight:'bold',color:'#2980b9'}}>รวมคะแนน: {total} / 50</div>
            <div style={{display:'flex',gap:'1rem',justifyContent:'flex-end'}}>
              <button type="button" onClick={()=>setEvalIdx(null)} style={{background:'#bdc3c7',color:'#2c3e50',border:'none',borderRadius:'8px',padding:'0.7rem 1.5rem',fontWeight:'500',fontSize:'1rem',cursor:'pointer'}}>ยกเลิก</button>
              <button type="submit" disabled={!canSubmit} style={{background:canSubmit?'#2979ff':'#bdc3c7',color:'#fff',border:'none',borderRadius:'8px',padding:'0.7rem 1.5rem',fontWeight:'500',fontSize:'1rem',cursor:canSubmit?'pointer':'not-allowed',display:'flex',alignItems:'center',gap:'0.5rem'}}><FaCheckCircle /> บันทึกผล</button>
            </div>
          </form>
        </div>
      )}
      {/* Modal ดูผลประเมิน */}
      {viewModal}
      {/* Overlay สำหรับ modal */}
      {(evalIdx!==null || viewIdx!==null) && (
        <div
          style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(44,62,80,0.15)',zIndex:999}}
          onClick={()=>{
            setEvalIdx(null);
            setViewIdx(null);
          }}
        />
      )}
    </div>
  );
}

export default TeacherEvaluation;

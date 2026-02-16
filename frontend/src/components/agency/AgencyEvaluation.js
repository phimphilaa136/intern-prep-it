import React, { useState } from 'react';
import { FaUserGraduate, FaUniversity, FaBookOpen, FaStar, FaCheckCircle, FaHourglassHalf } from 'react-icons/fa';

function formatThaiDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d)) return '-';
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear() + 543;
  return `${day}/${month}/${year}`;
}

function AgencyEvaluation() {
  const [students, setStudents] = useState([]);
  const [supervisorInfo, setSupervisorInfo] = useState({ supervisor_name: '', agency_name: '' });
  const [alert, setAlert] = useState(null);

  React.useEffect(() => {
    const username = localStorage.getItem('username');
    if (!username) return;
    fetch(`http://localhost:5000/api/agency/students-for-evaluation?username=${encodeURIComponent(username)}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          fetch(`http://localhost:5000/api/agency/student-evaluations?username=${encodeURIComponent(username)}`)
            .then(res2 => res2.json())
            .then(evals => {
              const evalMap = {};
              if (Array.isArray(evals)) {
                evals.forEach(e => {
                  evalMap[e.student_id] = {
                    total_score: e.total_score,
                    evaluated_at: e.evaluated_at,
                    comment: e.comment // เพิ่ม comment
                  };
                });
              }
              setStudents(data.map(s => ({
                ...s,
                score: evalMap[s.student_id]?.total_score ?? null,
                evaluated_at: evalMap[s.student_id]?.evaluated_at ?? null,
                comment: evalMap[s.student_id]?.comment ?? '',
                status: evalMap[s.student_id] ? 'ประเมินแล้ว' : 'รอประเมิน'
              })));
            });
        }
      });
  }, []);
  const [selected, setSelected] = useState(null);
  const [selectedYear, setSelectedYear] = useState('ทั้งหมด');
  // Supervisor evaluation criteria
  const criteria = [
    { id: 1, name: "ความถูกต้องและคุณภาพของงาน" },
    { id: 2, name: "ความรับผิดชอบต่องานที่ได้รับมอบหมาย" },
    { id: 3, name: "การใช้ความคิดริเริ่มสร้างสรรค์" },
    { id: 4, name: "การรับรู้และความเข้าใจในการปฏิบัติงาน" },
    { id: 5, name: "มนุษยสัมพันธ์" },
    { id: 6, name: "การแต่งกาย" },
    { id: 7, name: "ไหวพริบปฏิภาณในการแก้ปัญหา" },
    { id: 8, name: "กิริยา มารยาท" },
    { id: 9, name: "ความซื่อสัตย์" },
    { id: 10, name: "การแสวงหาความรู้ใหม่ๆ และนำมาใช้ในงาน" },
  ];
  const [scores, setScores] = useState(Array(criteria.length).fill(0));
  const [comment, setComment] = useState('');
  const [score, setScore] = useState(0); // legacy, not used

  const handleEvaluate = idx => {
    setSelected(idx);
    setScores(Array(criteria.length).fill(0));
    setComment('');
  };

  const handleScoreChange = (index, value) => {
    const newScores = [...scores];
    newScores[index] = value;
    setScores(newScores);
  };

  const total = scores.reduce((a, b) => a + b, 0);

  const handleSubmit = async e => {
    e.preventDefault();
    const student = students[selected];
    const payload = {
      student_id: student.student_id,
      student_name: student.student_name,
      supervisor_name: student.supervisor_name,
      agency_name: student.agency_name,
      total_score: total,
      comment: comment,
      score_1: scores[0],
      score_2: scores[1],
      score_3: scores[2],
      score_4: scores[3],
      score_5: scores[4],
      score_6: scores[5],
      score_7: scores[6],
      score_8: scores[7],
      score_9: scores[8],
      score_10: scores[9]
    };
    try {
      const res = await fetch('http://localhost:5000/api/agency/save-evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (res.ok) {
        const newStudents = [...students];
        newStudents[selected].score = total;
        newStudents[selected].status = 'ประเมินแล้ว';
        newStudents[selected].comment = comment;
        setStudents(newStudents);
        setSelected(null);
        setAlert({ type: 'success', message: 'บันทึกผลการประเมินสำเร็จ' });
        setTimeout(() => setAlert(null), 2500);
      } else {
        setAlert({ type: 'error', message: result.error || 'เกิดข้อผิดพลาด' });
        setTimeout(() => setAlert(null), 2500);
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์' });
      setTimeout(() => setAlert(null), 2500);
    }
  };

  // ฟิลเตอร์ข้อมูลตามปีที่เลือก
  const filteredStudents = selectedYear === 'ทั้งหมด'
    ? students
    : students.filter(s => {
        // สมมติว่ามี field student_year ใน students
        return s.student_year === selectedYear;
      });

  return (
    <div className="agency-evaluation" style={{background:'#f8f9fa',padding:'2rem',borderRadius:'16px',boxShadow:'0 2px 12px rgba(44,62,80,0.08)'}}>
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
            : <FaHourglassHalf size={22} style={{marginRight:8}}/>
          }
          {alert.message}
        </div>
      )}
      <h2 style={{marginBottom:'1.5rem',color:'#16a085',display:'flex',alignItems:'center',gap:'0.7rem'}}><FaStar style={{marginRight:6}}/> ประเมินผลการฝึก</h2>
      {/* ช่องเลือกปีอยู่ด้านขวาบนตารางคอลัมน์การดำเนินการ */}
      <div style={{display:'flex',justifyContent:'flex-end',alignItems:'center',marginBottom:'1rem'}}>
        <label htmlFor="year-select" style={{fontWeight:'bold',color:'#16a085',marginRight:'0.7rem'}}>ปีการศึกษา:</label>
        <select
          id="year-select"
          value={selectedYear}
          onChange={e => setSelectedYear(e.target.value)}
          style={{padding:'0.7rem 1.2rem',borderRadius:'8px',border:'1.5px solid #16a085',fontSize:'1.08rem'}}
        >
          <option value="ทั้งหมด">ทั้งหมด</option>
          <option value="2566">2566</option>
          <option value="2567">2567</option>
          <option value="2568">2568</option>
          <option value="2569">2569</option>
        </select>
      </div>
      <table style={{width:'100%',background:'#fff',borderRadius:'12px',boxShadow:'0 2px 8px rgba(44,62,80,0.08)',overflow:'hidden',fontSize:'1rem',marginBottom:'2rem'}}>
        <thead style={{background:'#16a085',color:'#fff'}}>
          <tr>
            <th style={{textAlign:'center'}}>วันที่</th>
            <th style={{textAlign:'center'}}><FaUserGraduate style={{marginRight:4}}/> รหัสนักศึกษา</th>
            <th style={{textAlign:'center'}}><FaUserGraduate style={{marginRight:4}}/> ชื่อนามสกุล</th>
            <th style={{textAlign:'center'}}><FaUniversity style={{marginRight:4}}/> คณะ</th>
            <th style={{textAlign:'center'}}><FaBookOpen style={{marginRight:4}}/> สาขา</th>
            <th style={{textAlign:'center'}}>ชื่อนามสกุลหัวหน้างาน</th>
            <th style={{textAlign:'center'}}>ชื่อหน่วยงาน</th>
            <th style={{textAlign:'center'}}>คะแนน</th>
            <th style={{textAlign:'center'}}>ความคิดเห็น</th>
            <th style={{textAlign:'center'}}>สถานะ</th>
            <th style={{textAlign:'center'}}>การดำเนินการ</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map((s,idx) => (
            <tr key={s.student_id} style={{background:idx%2===0?'#f4f8fb':'#fff'}}>
              <td style={{textAlign:'center'}}>{s.evaluated_at ? formatThaiDate(s.evaluated_at) : '-'}</td>
              <td style={{textAlign:'center'}}>{s.student_id}</td>
              <td style={{textAlign:'center'}}>{s.student_name}</td>
              <td style={{textAlign:'center'}}>{s.student_major}</td>
              <td style={{textAlign:'center'}}>{s.student_fac}</td>
              <td style={{textAlign:'center'}}>{s.supervisor_name}</td>
              <td style={{textAlign:'center'}}>{s.agency_name}</td>
              <td style={{fontWeight:'bold',color:s.score!==null?'#16a085':'#f39c12',textAlign:'center'}}>{s.score!==null?s.score:'ยังไม่ประเมิน'}</td>
              <td style={{textAlign:'center'}}>{s.comment || '-'}</td>
              <td style={{fontWeight:'bold',color:s.status==='ประเมินแล้ว'?'#16a085':'#f39c12',textAlign:'center'}}>
  {s.status==='ประเมินแล้ว'?<FaCheckCircle style={{marginRight:4}}/>:<FaHourglassHalf style={{marginRight:4}}/>}{s.status}
</td>
              <td style={{textAlign:'center'}}>
                {s.status === 'ประเมินแล้ว'
                  ? <span style={{fontWeight:'bold',color:'#bdc3c7',fontSize:'1.2rem'}}>-</span>
                  : <button
                      style={{background:'#2979ff',color:'#fff',border:'none',borderRadius:'8px',padding:'0.5rem 1rem',fontWeight:'500',fontSize:'0.95rem',cursor:'pointer'}}
                      onClick={()=>handleEvaluate(idx)}
                    >ประเมิน</button>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selected!==null && (
        <form onSubmit={handleSubmit} style={{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',zIndex:1000,background:'#fff',borderRadius:'12px',boxShadow:'0 2px 16px rgba(44,62,80,0.18)',padding:'2rem',maxWidth:'500px',width:'95vw',maxHeight:'90vh',overflow:'auto'}}>
          <h3 style={{marginBottom:'1rem',color:'#2979ff',textAlign:'center'}}><FaStar style={{marginRight:6}}/> แบบประเมินผลของหัวหน้างาน</h3>
          <div style={{marginBottom:'1.2rem',fontWeight:'bold',color:'#16a085'}}>นักศึกษา: {students[selected].student_name}</div>
          <table style={{width:'100%',marginBottom:'1.2rem',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'#f4f8fb'}}>
                <th style={{padding:'0.5rem',border:'1px solid #e0e0e0'}}>ลำดับ</th>
                <th style={{padding:'0.5rem',border:'1px solid #e0e0e0'}}>หัวข้อประเมิน</th>
                <th style={{padding:'0.5rem',border:'1px solid #e0e0e0'}}>คะแนนเต็ม</th>
                <th style={{padding:'0.5rem',border:'1px solid #e0e0e0'}}>คะแนนที่ได้</th>
              </tr>
            </thead>
            <tbody>
              {criteria.map((item, i) => (
                <tr key={item.id}>
                  <td style={{padding:'0.5rem',border:'1px solid #e0e0e0',textAlign:'center'}}>{item.id}</td>
                  <td style={{padding:'0.5rem',border:'1px solid #e0e0e0'}}>{item.name}</td>
                  <td style={{padding:'0.5rem',border:'1px solid #e0e0e0',textAlign:'center'}}>5</td>
                  <td style={{padding:'0.5rem',border:'1px solid #e0e0e0',textAlign:'center'}}>
                    <div style={{display:'flex',gap:'0.5rem',justifyContent:'center'}}>
                      {[1,2,3,4,5].map(val=>(
                        <button
                          type="button"
                          key={val}
                          onClick={()=>handleScoreChange(i,val)}
                          style={{background:scores[i]===val?'#2979ff':'#e0e0e0',color:scores[i]===val?'#fff':'#2c3e50',border:'none',borderRadius:'50%',width:'32px',height:'32px',fontWeight:'bold',fontSize:'1rem',cursor:'pointer',boxShadow:scores[i]===val?'0 2px 8px rgba(44,62,80,0.18)':'none'}}
                        >{val}</button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{marginBottom:'1.2rem',textAlign:'right',fontWeight:'bold',color:'#2979ff'}}>รวมคะแนน: {total} / 50</div>
          <div style={{marginBottom:'1.2rem'}}>
            <label style={{fontWeight:'bold',marginBottom:'0.5rem',display:'block'}}>ความคิดเห็นเพิ่มเติม:</label>
            <textarea value={comment} onChange={e=>setComment(e.target.value)} rows={3} style={{width:'100%',borderRadius:'8px',border:'2px solid #2979ff',padding:'0.5rem'}}></textarea>
          </div>
          <div style={{display:'flex',gap:'1rem',marginTop:'1rem',justifyContent:'flex-end'}}>
            <button type="submit" style={{background:'#2979ff',color:'#fff',border:'none',borderRadius:'8px',padding:'0.7rem 1.2rem',fontWeight:'500',fontSize:'1rem',cursor:'pointer'}} disabled={total===0}>บันทึกผล</button>
            <button type="button" onClick={()=>setSelected(null)} style={{background:'#bdc3c7',color:'#2c3e50',border:'none',borderRadius:'8px',padding:'0.7rem 1.2rem',fontWeight:'500',fontSize:'1rem',cursor:'pointer'}}>ยกเลิก</button>
          </div>
        </form>
      )}
      {selected!==null && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(44,62,80,0.15)',zIndex:999}} onClick={()=>setSelected(null)}></div>
      )}
    </div>
  );
}

export default AgencyEvaluation;

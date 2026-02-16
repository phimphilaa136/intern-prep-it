import React, { useState, useEffect } from 'react';
import { FaTable, FaCalendarAlt, FaUsers, FaUserCheck, FaStar, FaCheckCircle, FaFileAlt } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register required Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function TeacherReportSummary() {
  const [year, setYear] = useState('2568');
  const years = ['2566','2567','2568'];
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError('');
      try {
  const res = await fetch(`/api/teacher/report-summary?year=${year}`);
        if (!res.ok) throw new Error('ไม่สามารถดึงข้อมูลรายงานผล');
        const data = await res.json();
        setReports(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };
    fetchSummary();
  }, [year]);

  const chartData = {
    labels: ['หน่วยงาน', 'นักศึกษาออกฝึก', 'ส่งเล่มรายงาน', 'ประเมินผล'],
    datasets: [
      {
        label: `ปี ${year}`,
        data: [
          Array.isArray(reports[0]?.agencies) ? reports[0].agencies.length : 0,
          reports[0]?.total_students ?? 0,
          reports[0]?.report_submitted ?? 0,
          reports[0]?.evaluation_done ?? 0
        ],
        backgroundColor: ['#2980b9', '#16a085', '#e67e22', '#8e44ad']
      }
    ]
  };

  return (
    <div className="teacher-report-summary" style={{background:'#f8f9fa',padding:'2rem',borderRadius:'16px',boxShadow:'0 2px 12px rgba(44,62,80,0.08)',maxWidth:'1400px',margin:'2rem auto',position:'relative'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
        <h2 style={{color:'#16a085',display:'flex',alignItems:'center',gap:'0.7rem'}}><FaTable style={{marginRight:6}}/> รายงานผล</h2>
        <div style={{display:'flex',alignItems:'center',gap:'0.7rem'}}>
          <label htmlFor="year-select" style={{fontWeight:'500',color:'#34495e'}}></label>
          <select id="year-select" value={year} onChange={e=>setYear(e.target.value)} style={{borderRadius:'8px',border:'1px solid #bdc3c7',padding:'0.5rem 1.2rem',fontSize:'1rem',background:'#fff',color:'#000000ff',fontWeight:'bold'}}>
            {years.map(y=>(<option key={y} value={y}>{y}</option>))}
          </select>
        </div>
      </div>
      {error && <div style={{color:'#e74c3c',marginBottom:'1rem'}}>{error}</div>}
      {loading ? (
        <div style={{textAlign:'center',color:'#2980b9',fontWeight:'bold',margin:'2rem'}}>กำลังโหลดข้อมูล...</div>
      ) : (
        <table style={{width:'100%',background:'#fff',borderRadius:'12px',boxShadow:'0 2px 8px rgba(44,62,80,0.08)',overflow:'hidden',fontSize:'1rem'}}>
          <thead style={{background:'#2979ff',color:'#fff'}}>
            <tr>
              <th style={{textAlign:'center'}}><FaUsers style={{marginRight:4}}/> จำนวนหน่วยงานที่เปิดรับ</th>
              <th style={{textAlign:'center'}}><FaUsers style={{marginRight:4}}/> จำนวนนักศึกษาที่ออกฝึก</th>
              <th style={{textAlign:'center'}}><FaFileAlt style={{marginRight:4}}/> ส่งเล่มรายงาน</th>
              <th style={{textAlign:'center'}}><FaCheckCircle style={{marginRight:4}}/> ประเมินผลการฝึก</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 || (
              reports[0]?.total_students === 0 &&
              reports[0]?.completed_students === 0 &&
              (Array.isArray(reports[0]?.agencies) ? reports[0].agencies.length : 0) === 0 &&
              reports[0]?.report_submitted === 0 &&
              reports[0]?.evaluation_done === 0
            ) ? (
              <tr><td colSpan={5} style={{textAlign:'center',padding:'2rem',color:'#bdc3c7'}}>ไม่มีข้อมูลรายงานผล</td></tr>
            ) : (
              reports.map((r,idx)=>(
                <tr key={idx} style={{background:idx%2===0?'#f4f8fb':'#fff'}}>
                  <td style={{textAlign:'center'}}>{Array.isArray(r.agencies) ? r.agencies.length : (r.agencies ? 1 : 0)}</td>
                  <td style={{textAlign:'center'}}>{r.total_students ?? 0}</td>
                  <td style={{textAlign:'center'}}>{r.report_submitted ?? 0}</td>
                  <td style={{textAlign:'center'}}>{r.evaluation_done ?? 0}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
      <div style={{marginTop:'2rem', width:'100%', maxWidth:'700px', marginLeft:'auto', marginRight:'auto'}}>
        <Bar
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'top' },
              title: { display: true, text: `สรุปรายงานผลการฝึกงาน ปี ${year}` }
            },
            scales: {
              y: { beginAtZero: true }
            }
          }}
          style={{ width: '100%', height: '350px' }}
          height={350}
        />
      </div>
    </div>
  );
}

export default TeacherReportSummary;

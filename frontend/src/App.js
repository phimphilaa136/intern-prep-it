import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentRegister from './components/student/StudentRegister';
import TeacherRegister from './components/teacher/TeacherRegister';
import AgencyRegister from './components/agency/AgencyRegister';
import StudentDashboard from './components/student/StudentDashboard';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import AgencyDashboard from './components/agency/AgencyDashboard';
import StudentProfile from './components/student/StudentProfile';
import StudentPreparation from './components/student/StudentPreparation';
import StudentWorkLog from './components/student/StudentWorkLog';
import StudentReport from './components/student/StudentReport';

import TeacherManageStudents from './components/teacher/TeacherManageStudents';
import TeacherManageAgencies from './components/teacher/TeacherManageAgencies';
import TeacherAgencyList from './components/teacher/TeacherAgencyList';
import TeacherStudentRequests from './components/teacher/TeacherStudentRequests';
import TeacherCheckWorkLog from './components/teacher/TeacherCheckWorkLog';
import TeacherCheckReport from './components/teacher/TeacherCheckReport';
import TeacherEvaluation from './components/teacher/TeacherEvaluation';
import TeacherReportSummary from './components/teacher/TeacherReportSummary';
import TeacherAgencyEvaluationReport from './components/teacher/TeacherAgencyEvaluationReport';
import AgencyOpenRegistration from './components/agency/AgencyOpenRegistration';
import AgencyStudentList from './components/agency/AgencyStudentList';
import AgencyConfirmWorkLog from './components/agency/AgencyConfirmWorkLog';
import AgencyEvaluation from './components/agency/AgencyEvaluation';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/student" element={<StudentRegister />} />
        <Route path="/register/teacher" element={<TeacherRegister />} />
        <Route path="/register/agency" element={<AgencyRegister />} />
        <Route path="/student" element={<StudentDashboard />}>
          <Route path="profile" element={<StudentProfile />} />
          <Route path="preparation" element={<StudentPreparation />} />
          <Route path="worklog" element={<StudentWorkLog />} />
          <Route path="report" element={<StudentReport />} />
        </Route>
        <Route path="/teacher" element={<TeacherDashboard />}>
          <Route path="manage-students" element={<TeacherManageStudents />} />
          <Route path="manage-agencies" element={<TeacherManageAgencies />} />
          <Route path="agency-list" element={<TeacherAgencyList />} />
          <Route path="student-requests" element={<TeacherStudentRequests />} />
          <Route path="check-worklog" element={<TeacherCheckWorkLog />} />
          <Route path="check-report" element={<TeacherCheckReport />} />
          <Route path="evaluation" element={<TeacherEvaluation />} />
          <Route path="agency-evaluation-report" element={<TeacherAgencyEvaluationReport />} />
          <Route path="report-summary" element={<TeacherReportSummary />} />
        </Route>
        <Route path="/agency" element={<AgencyDashboard />}>
          <Route path="open-registration" element={<AgencyOpenRegistration />} />
          <Route path="student-list" element={<AgencyStudentList />} />
          <Route path="confirm-worklog" element={<AgencyConfirmWorkLog />} />
          <Route path="evaluation" element={<AgencyEvaluation />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

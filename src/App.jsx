import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LoginPage from "./authentication/LoginPage";
import TutorMain from "./TutorManagement/TutorMain";
import AdminDashboard from "./AdminManagement/AdminDashboard";
import StudentDashboard from "./StudentManagement/StudentDashboard";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage onLogin={() => {}} />} />

        <Route path="/tutor/*" element={<TutorMain />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/student" element={<StudentDashboard />} />
      </Routes>
    </Router>
  );
}
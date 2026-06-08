import { Routes, Route, Navigate } from "react-router-dom";
import TutorNavbar from "./components/TutorNavbar";
import TutorSidebar from "./components/TutorSidebar";
import TutorDashboard from "./pages/TutorDashboard";
import Courses from "./pages/Courses";
import CreateCourse from "./pages/CreateCourse";
import TutorProfile from "./pages/TutorProfile";
import CreateQuiz from "./pages/CreateQuiz";
import StudentMonitoring from "./pages/StudentMonitoring";
import ChangePassword from "./pages/ChangePassword";
import NotificationSettings from "./pages/NotificationSettings";
import Availability from "./pages/Availability";
import HelpSupport from "./pages/HelpSupport";
import ProfileEdit from "./pages/ProfileEdit";

const Placeholder = ({ title }) => (
  <div className="rounded-3xl border border-cyan-300/50 bg-[#041225]/80 p-10 shadow-[0_0_25px_rgba(34,211,238,0.45)] text-center">
    <h2 className="text-3xl font-semibold text-white">{title}</h2>
    <p className="mt-4 text-slate-300">This page is coming soon.</p>
  </div>
);

const TutorMain = () => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-[#0f172a] to-[#020617] text-white">
      <TutorSidebar />

      <div className="flex-1 flex flex-col">
        <TutorNavbar />

        <div className="p-6 overflow-y-auto">
          <Routes>
            <Route index element={<TutorDashboard />} />
            <Route path="courses" element={<Courses />} />
            <Route path="create-course" element={<CreateCourse />} />
            <Route path="profile" element={<TutorProfile />} />
            <Route path="profile/edit" element={<ProfileEdit />} />
            <Route path="change-password" element={<ChangePassword />} />
            <Route path="notifications" element={<NotificationSettings />} />
            <Route path="availability" element={<Availability />} />
            <Route path="help" element={<HelpSupport />} />
            <Route path="create-quiz" element={<CreateQuiz />} />
            <Route path="student-monitoring" element={<StudentMonitoring />} />
            <Route path="analytics" element={<Placeholder title="Analytics" />} />
            <Route path="attendance" element={<Placeholder title="Attendance" />} />
            <Route path="*" element={<Navigate to="." replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default TutorMain;
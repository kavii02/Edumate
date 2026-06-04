import { Routes, Route } from "react-router-dom";
import TutorNavbar from "./Components/TutorNavbar";
import TutorSidebar from "./Components/TutorSiderbar";
import TutorDashboard from "./pages/TutorDashboard";
import Courses from "./pages/Courses";
import CreateCourse from "./pages/CreateCourse";
import TutorProfile from "./pages/TutorProfile";
import CreateQuiz from "./pages/CreateQuiz";

const TutorMain = () => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-[#0f172a] to-[#020617] text-white">
      <TutorSidebar />

      <div className="flex-1 flex flex-col">
        <TutorNavbar />

        <div className="p-6 overflow-y-auto">
          <Routes>
            <Route path="/" element={<TutorDashboard />} />
            <Route path="courses" element={<Courses />} />
            <Route path="create-course" element={<CreateCourse />} />
            <Route path="profile" element={<TutorProfile />} />
            <Route path="create-quiz" element={<CreateQuiz />} />
            
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default TutorMain;
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import TutorMain from "./TutorManagement/TutorMain";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/tutor/*" element={<TutorMain />} />
        <Route path="*" element={<Navigate to="/tutor" replace />} />
      </Routes>
    </Router>
  );
}
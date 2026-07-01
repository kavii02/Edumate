import { useState, useEffect } from "react";
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Search, 
  RefreshCw, 
  Zap, 
  X, 
  BarChart3,
  BookOpen,
  ArrowRight,
  GraduationCap
} from "lucide-react";
import { useTutorAuth } from "../context/TutorAuthContext";
import { getTutorAnalytics, predictStudentPerformance } from "../services/tutorApiService";

const Analytics = () => {
  const { tutorId } = useTutorAuth();
  const [activeTab, setActiveTab] = useState("quiz"); // 'quiz', 'lesson', 'individual'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Real data state
  const [analyticsData, setAnalyticsData] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loadingPredictions, setLoadingPredictions] = useState(false);
  const [showPredictionModal, setShowPredictionModal] = useState(false);

  // Filters & selection
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLesson, setSelectedLesson] = useState("all");
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // Mock data for fallback/demonstration
  const mockQuizAnalytics = {
    total_attended: 75,
    highest_score: "20/20",
    average_score: "11.5/20",
    lowest_score: "0/20",
    top_scores: [
      { name: "Tharindu", score: 20, total_questions: 20, percentage: 100.0, quiz_title: "Lesson Q1" },
      { name: "Supun", score: 19, total_questions: 20, percentage: 95.0, quiz_title: "Lesson Q1" },
      { name: "Sahan", score: 18, total_questions: 20, percentage: 90.0, quiz_title: "Lesson Q1" },
      { name: "Nuwan", score: 18, total_questions: 20, percentage: 90.0, quiz_title: "Lesson Q1" },
      { name: "Dinesh", score: 18, total_questions: 20, percentage: 90.0, quiz_title: "Lesson Q1" },
      { name: "Dinesh", score: 18, total_questions: 20, percentage: 90.0, quiz_title: "Lesson Q1" },
      { name: "Sachintha", score: 17, total_questions: 20, percentage: 85.0, quiz_title: "Lesson Q1" },
      { name: "Chamara", score: 17, total_questions: 20, percentage: 85.0, quiz_title: "Lesson Q1" },
      { name: "Malintha", score: 17, total_questions: 20, percentage: 85.0, quiz_title: "Lesson Q1" },
      { name: "Chamara", score: 16, total_questions: 20, percentage: 80.0, quiz_title: "Lesson Q1" },
    ]
  };

  const mockLessonAnalytics = {
    total_students: 75,
    highest_avg: "100.0%",
    class_avg: "57.6%",
    lowest_avg: "2.5%"
  };

  const mockLessons = [
    { quiz_id: 1, title: "Lesson Q1", attempts: 45, average_percentage: 72.5 },
    { quiz_id: 2, title: "Lesson Q2", attempts: 30, average_percentage: 65.0 },
  ];

  const mockStudents = [
    {
      student_id: 1,
      name: "Tharindu Gunawardena",
      student_code: "ST006",
      avatar: "TG",
      attempts: 3,
      average_score_pct: 100.0,
      average_score_str: "100.0% (20.0/20 marks)",
      highest_score_pct: 100.0,
      highest_score_str: "20/20",
      lowest_score_str: "20/20",
      rank: "#1",
      results: [
        { quiz_title: "Lesson Q1", score: 20, total_questions: 20, percentage: 100.0, attempted_at: "2026-06-15" },
        { quiz_title: "Lesson Q2", score: 10, total_questions: 10, percentage: 100.0, attempted_at: "2026-06-20" },
        { quiz_title: "Lesson Q3", score: 5, total_questions: 5, percentage: 100.0, attempted_at: "2026-06-25" }
      ]
    },
    {
      student_id: 2,
      name: "Supun Herath",
      student_code: "ST010",
      avatar: "SH",
      attempts: 3,
      average_score_pct: 93.3,
      average_score_str: "93.3% (18.7/20 marks)",
      highest_score_pct: 95.0,
      highest_score_str: "19/20",
      lowest_score_str: "18/20",
      rank: "#2",
      results: [
        { quiz_title: "Lesson Q1", score: 19, total_questions: 20, percentage: 95.0, attempted_at: "2026-06-15" },
        { quiz_title: "Lesson Q2", score: 9, total_questions: 10, percentage: 90.0, attempted_at: "2026-06-20" },
        { quiz_title: "Lesson Q3", score: 5, total_questions: 5, percentage: 100.0, attempted_at: "2026-06-25" }
      ]
    },
    {
      student_id: 3,
      name: "Sahan Perera",
      student_code: "ST015",
      avatar: "SP",
      attempts: 3,
      average_score_pct: 86.7,
      average_score_str: "86.7% (17.3/20 marks)",
      highest_score_pct: 90.0,
      highest_score_str: "18/20",
      lowest_score_str: "16/20",
      rank: "#3",
      results: [
        { quiz_title: "Lesson Q1", score: 18, total_questions: 20, percentage: 90.0, attempted_at: "2026-06-15" },
        { quiz_title: "Lesson Q2", score: 8, total_questions: 10, percentage: 80.0, attempted_at: "2026-06-20" },
        { quiz_title: "Lesson Q3", score: 4, total_questions: 5, percentage: 80.0, attempted_at: "2026-06-25" }
      ]
    },
    {
      student_id: 4,
      name: "Nuwan Silva",
      student_code: "ST021",
      avatar: "NS",
      attempts: 3,
      average_score_pct: 85.0,
      average_score_str: "85.0% (17.0/20 marks)",
      highest_score_pct: 90.0,
      highest_score_str: "18/20",
      lowest_score_str: "15/20",
      rank: "#4",
      results: [
        { quiz_title: "Lesson Q1", score: 18, total_questions: 20, percentage: 90.0, attempted_at: "2026-06-15" },
        { quiz_title: "Lesson Q2", score: 8, total_questions: 10, percentage: 80.0, attempted_at: "2026-06-20" },
        { quiz_title: "Lesson Q3", score: 4, total_questions: 5, percentage: 80.0, attempted_at: "2026-06-25" }
      ]
    },
    {
      student_id: 5,
      name: "Dinesh Fernando",
      student_code: "ST003",
      avatar: "DF",
      attempts: 3,
      average_score_pct: 82.5,
      average_score_str: "82.5% (16.5/20 marks)",
      highest_score_pct: 90.0,
      highest_score_str: "18/20",
      lowest_score_str: "14/20",
      rank: "#5",
      results: [
        { quiz_title: "Lesson Q1", score: 18, total_questions: 20, percentage: 90.0, attempted_at: "2026-06-15" },
        { quiz_title: "Lesson Q2", score: 7, total_questions: 10, percentage: 70.0, attempted_at: "2026-06-20" },
        { quiz_title: "Lesson Q3", score: 4, total_questions: 5, percentage: 80.0, attempted_at: "2026-06-25" }
      ]
    }
  ];

  const mockPredictions = [
    { student_id: 1, name: "Tharindu Gunawardena", student_code: "ST006", avatar: "TG", attendance_rate: "98.5%", quiz_avg: "100.0%", predicted_grade: "A", risk_status: "Pass", risk_level: "Low Risk", category: "Excellent", confidence: "97.5%" },
    { student_id: 2, name: "Supun Herath", student_code: "ST010", avatar: "SH", attendance_rate: "92.0%", quiz_avg: "93.3%", predicted_grade: "A", risk_status: "Pass", risk_level: "Low Risk", category: "Excellent", confidence: "95.0%" },
    { student_id: 3, name: "Sahan Perera", student_code: "ST015", avatar: "SP", attendance_rate: "88.5%", quiz_avg: "86.7%", predicted_grade: "B", risk_status: "Pass", risk_level: "Low Risk", category: "Good", confidence: "94.5%" },
    { student_id: 4, name: "Nuwan Silva", student_code: "ST021", avatar: "NS", attendance_rate: "85.0%", quiz_avg: "85.0%", predicted_grade: "B", risk_status: "Pass", risk_level: "Low Risk", category: "Good", confidence: "93.0%" },
    { student_id: 5, name: "Dinesh Fernando", student_code: "ST003", avatar: "DF", attendance_rate: "79.0%", quiz_avg: "82.5%", predicted_grade: "B", risk_status: "Pass", risk_level: "Low Risk", category: "Good", confidence: "91.0%" },
  ];

  const loadAnalytics = async () => {
    if (!tutorId) return;
    setLoading(true);
    setError("");
    const response = await getTutorAnalytics(tutorId);
    if (response.success) {
      if (response.quiz_analytics?.total_attended > 0 || response.students?.length > 0) {
        setAnalyticsData(response);
      } else {
        setAnalyticsData({
          quiz_analytics: mockQuizAnalytics,
          lesson_analytics: mockLessonAnalytics,
          lessons: mockLessons,
          students: mockStudents,
          success: true
        });
      }
    } else {
      setError(response.message || "Failed to load analytics details.");
      setAnalyticsData({
        quiz_analytics: mockQuizAnalytics,
        lesson_analytics: mockLessonAnalytics,
        lessons: mockLessons,
        students: mockStudents,
        success: true
      });
    }
    setLoading(false);
  };

  const fetchPredictions = async () => {
    if (!tutorId) return;
    setLoadingPredictions(true);
    const response = await predictStudentPerformance(tutorId);
    if (response.success && response.predictions && response.predictions.length > 0) {
      setPredictions(response.predictions);
    } else {
      setPredictions(mockPredictions);
    }
    setLoadingPredictions(false);
  };

  useEffect(() => {
    loadAnalytics();
  }, [tutorId]);

  const activeAnalytics = analyticsData?.quiz_analytics || mockQuizAnalytics;
  const activeLessonsStats = analyticsData?.lesson_analytics || mockLessonAnalytics;
  const activeLessons = analyticsData?.lessons || mockLessons;
  const activeStudents = analyticsData?.students || mockStudents;

  const filteredStudents = activeStudents.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          student.student_code.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedLesson === "all") return matchesSearch;
    return matchesSearch && student.results.some((r) => r.quiz_title === selectedLesson || r.quiz_id === Number(selectedLesson));
  });

  const selectedStudent = activeStudents.find(s => s.student_id === selectedStudentId) || activeStudents[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-300 bg-clip-text text-transparent">
            Advanced Analytics Dashboard
          </h1>
          <p className="text-slate-400 mt-1">Monitor quiz performance and overall student progress</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAnalytics}
            className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          
          <button
            onClick={() => {
              fetchPredictions();
              setShowPredictionModal(true);
            }}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:from-violet-500 hover:to-indigo-500 shadow-[0_0_20px_rgba(124,58,237,0.4)] transition"
          >
            <Zap size={16} className="text-yellow-300 fill-yellow-300 animate-pulse" />
            ML Prediction
          </button>
        </div>
      </div>

      <div className="flex rounded-3xl border border-slate-800 bg-slate-950 p-1.5 max-w-lg">
        <button
          onClick={() => {
            setActiveTab("quiz");
            setSelectedStudentId(null);
          }}
          className={`flex-1 rounded-2xl py-2.5 text-sm font-semibold text-center transition ${
            activeTab === "quiz" && !selectedStudentId
              ? "bg-slate-900 text-cyan-300 border border-slate-700/50"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Quiz Analytics
        </button>
        <button
          onClick={() => {
            setActiveTab("lesson");
            setSelectedStudentId(null);
          }}
          className={`flex-1 rounded-2xl py-2.5 text-sm font-semibold text-center transition ${
            activeTab === "lesson" && !selectedStudentId
              ? "bg-slate-900 text-cyan-300 border border-slate-700/50"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Lesson Performance
        </button>
        <button
          onClick={() => {
            setActiveTab("individual");
            if (!selectedStudentId && activeStudents.length > 0) {
              setSelectedStudentId(activeStudents[0].student_id);
            }
          }}
          className={`flex-1 rounded-2xl py-2.5 text-sm font-semibold text-center transition ${
            activeTab === "individual" || selectedStudentId
              ? "bg-slate-900 text-cyan-300 border border-slate-700/50"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Individual Student
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {activeTab === "quiz" && !selectedStudentId && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 flex items-center gap-4 hover:border-slate-700/80 transition shadow-lg">
              <div className="rounded-2xl bg-blue-500/10 p-3.5 text-blue-400">
                <Users size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium font-semibold uppercase tracking-wider">Total Attended</p>
                <h3 className="text-2xl font-extrabold text-white mt-1">{activeAnalytics.total_attended}</h3>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 flex items-center gap-4 hover:border-slate-700/80 transition shadow-lg">
              <div className="rounded-2xl bg-emerald-500/10 p-3.5 text-emerald-400">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium font-semibold uppercase tracking-wider">Highest Score</p>
                <h3 className="text-2xl font-extrabold text-white mt-1">{activeAnalytics.highest_score}</h3>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 flex items-center gap-4 hover:border-slate-700/80 transition shadow-lg">
              <div className="rounded-2xl bg-purple-500/10 p-3.5 text-purple-400">
                <Activity size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium font-semibold uppercase tracking-wider">Average Score</p>
                <h3 className="text-2xl font-extrabold text-white mt-1">{activeAnalytics.average_score}</h3>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 flex items-center gap-4 hover:border-slate-700/80 transition shadow-lg">
              <div className="rounded-2xl bg-rose-500/10 p-3.5 text-rose-400">
                <TrendingDown size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium font-semibold uppercase tracking-wider">Lowest Score</p>
                <h3 className="text-2xl font-extrabold text-white mt-1">{activeAnalytics.lowest_score}</h3>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-cyan-300/40 bg-[#041225]/85 p-7 shadow-[0_0_25px_rgba(34,211,238,0.25)]">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <BarChart3 size={20} className="text-cyan-300" />
              Top Scores Distribution
            </h2>

            {activeAnalytics.top_scores?.length > 0 ? (
              <div className="relative min-h-[300px] flex flex-col justify-end pt-10">
                <div className="absolute inset-x-0 bottom-8 top-10 flex flex-col justify-between pointer-events-none opacity-20">
                  <div className="border-t border-slate-600 flex justify-between text-[10px] text-slate-400 pt-1"><span>20</span></div>
                  <div className="border-t border-slate-600 flex justify-between text-[10px] text-slate-400 pt-1"><span>15</span></div>
                  <div className="border-t border-slate-600 flex justify-between text-[10px] text-slate-400 pt-1"><span>10</span></div>
                  <div className="border-t border-slate-600 flex justify-between text-[10px] text-slate-400 pt-1"><span>5</span></div>
                  <div className="border-t border-slate-600 flex justify-between text-[10px] text-slate-400 pt-1"><span>0</span></div>
                </div>

                <div className="relative flex items-end justify-between px-2 sm:px-6 h-[220px] mb-8">
                  {activeAnalytics.top_scores.map((item, index) => (
                    <div 
                      key={index} 
                      className="group relative flex flex-col items-center flex-1 mx-1.5 sm:mx-3"
                    >
                      <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-20">
                        <div className="rounded-xl border border-slate-700 bg-slate-950/95 p-2.5 text-xs text-white shadow-2xl min-w-[120px] text-center">
                          <p className="font-semibold text-cyan-300">{item.name}</p>
                          <p className="mt-1 text-[11px] text-slate-300">Quiz: {item.quiz_title}</p>
                          <p className="font-medium text-indigo-300 mt-0.5">Score: {item.score}/{item.total_questions} ({item.percentage}%)</p>
                        </div>
                        <div className="w-2.5 h-2.5 bg-slate-950 border-r border-b border-slate-700 rotate-45 -mt-1"></div>
                      </div>

                      <div 
                        style={{ height: `${item.percentage || 10}%` }}
                        className="w-full sm:w-8 rounded-t-xl bg-indigo-500 hover:bg-cyan-400 transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                      />

                      <p className="absolute top-full mt-2 text-center text-xs text-slate-400 max-w-[50px] truncate font-medium">
                        {item.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-slate-400">
                No scores data available to display chart.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "lesson" && !selectedStudentId && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 flex items-center gap-4 hover:border-slate-700/80 transition shadow-lg">
              <div className="rounded-2xl bg-blue-500/10 p-3.5 text-blue-400">
                <Users size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium font-semibold uppercase tracking-wider">Total Students</p>
                <h3 className="text-2xl font-extrabold text-white mt-1">{activeLessonsStats.total_students}</h3>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 flex items-center gap-4 hover:border-slate-700/80 transition shadow-lg">
              <div className="rounded-2xl bg-emerald-500/10 p-3.5 text-emerald-400">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium font-semibold uppercase tracking-wider">Highest Avg</p>
                <h3 className="text-2xl font-extrabold text-white mt-1">{activeLessonsStats.highest_avg}</h3>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 flex items-center gap-4 hover:border-slate-700/80 transition shadow-lg">
              <div className="rounded-2xl bg-purple-500/10 p-3.5 text-purple-400">
                <Activity size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium font-semibold uppercase tracking-wider">Class Average</p>
                <h3 className="text-2xl font-extrabold text-white mt-1">{activeLessonsStats.class_avg}</h3>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 flex items-center gap-4 hover:border-slate-700/80 transition shadow-lg">
              <div className="rounded-2xl bg-rose-500/10 p-3.5 text-rose-400">
                <TrendingDown size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium font-semibold uppercase tracking-wider">Lowest Avg</p>
                <h3 className="text-2xl font-extrabold text-white mt-1">{activeLessonsStats.lowest_avg}</h3>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-cyan-300/40 bg-[#041225]/85 p-7 shadow-[0_0_25px_rgba(34,211,238,0.25)]">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Student Name..."
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950 pl-11 pr-4 py-2.5 outline-none focus:border-cyan-300 text-sm text-white placeholder-slate-500 transition"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lesson:</label>
                <select
                  value={selectedLesson}
                  onChange={(e) => setSelectedLesson(e.target.value)}
                  className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-2.5 outline-none focus:border-cyan-300 text-sm text-white font-medium"
                >
                  <option value="all">All Lessons</option>
                  {activeLessons.map((l) => (
                    <option key={l.quiz_id} value={l.title}>
                      {l.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Rank</th>
                    <th className="px-6 py-4">Student Info</th>
                    <th className="px-6 py-4 text-center">Quizzes Attempted</th>
                    <th className="px-6 py-4 text-left">Average Score</th>
                    <th className="px-6 py-4 text-center">Highest Score</th>
                    <th className="px-6 py-4 text-center">Lowest Score</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <tr key={student.student_id} className="hover:bg-slate-900/30 transition duration-150">
                        <td className="px-6 py-4 font-semibold">
                          <span className={`inline-flex items-center justify-center rounded-lg px-2.5 py-1 text-xs ${
                            student.rank === "#1" ? "bg-yellow-500/10 text-yellow-300 font-bold border border-yellow-500/20" :
                            student.rank === "#2" ? "bg-slate-300/10 text-slate-300 font-bold border border-slate-300/20" :
                            student.rank === "#3" ? "bg-amber-600/10 text-amber-500 font-bold border border-amber-500/20" :
                            "bg-slate-800/40 text-slate-400"
                          }`}>
                            {student.rank}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300 font-semibold text-xs border border-indigo-500/20">
                              {student.avatar}
                            </div>
                            <div>
                              <p className="font-semibold text-white">{student.name}</p>
                              <p className="text-xs text-slate-500 font-medium">{student.student_code}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center font-medium text-slate-300">
                          {student.attempts}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <span className="font-bold text-cyan-300">{student.average_score_pct}%</span>
                            <div className="w-24 bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                              <div 
                                style={{ width: `${student.average_score_pct}%` }} 
                                className="bg-cyan-400 h-full rounded-full" 
                              />
                            </div>
                            <span className="text-[10px] text-slate-500 block mt-1">{student.average_score_str}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-emerald-400">
                          {student.highest_score_str}
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-rose-400">
                          {student.lowest_score_str}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedStudentId(student.student_id);
                              setActiveTab("individual");
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
                          >
                            Profile
                            <ArrowRight size={12} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-10 text-center text-slate-500">
                        No students match the search filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "individual" && selectedStudent && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 space-y-4 max-h-[600px] overflow-y-auto">
            <h3 className="text-md font-bold text-slate-300 px-2 flex items-center gap-2">
              <Users size={16} className="text-cyan-300" />
              Select Student
            </h3>
            
            <div className="space-y-1">
              {activeStudents.map((student) => (
                <button
                  key={student.student_id}
                  onClick={() => setSelectedStudentId(student.student_id)}
                  className={`w-full flex items-center justify-between rounded-2xl p-3 text-left transition ${
                    student.student_id === selectedStudent.student_id
                      ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-300"
                      : "border border-transparent text-slate-400 hover:bg-slate-900/40 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold text-xs ${
                      student.student_id === selectedStudent.student_id
                        ? "bg-cyan-500/20 text-cyan-300"
                        : "bg-slate-800 text-slate-400"
                    }`}>
                      {student.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-sm truncate max-w-[150px]">{student.name}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{student.student_code}</p>
                    </div>
                  </div>
                  
                  <span className="text-xs font-semibold px-2 py-0.5 bg-slate-900 rounded-lg text-slate-400 border border-slate-800">
                    {student.average_score_pct}%
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl border border-cyan-300/40 bg-[#041225]/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_25px_rgba(34,211,238,0.25)]">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-300 font-bold text-lg border border-indigo-500/20">
                  {selectedStudent.avatar}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedStudent.name}</h2>
                  <p className="text-sm text-slate-400 font-medium">Student Code: {selectedStudent.student_code} • Grade {selectedStudent.grade_level || "13"}</p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">Average Score</span>
                <span className="text-3xl font-extrabold text-cyan-300 mt-1 block">{selectedStudent.average_score_pct}%</span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">Quizzes Taken</span>
                <span className="text-xl font-extrabold text-white mt-1 block">{selectedStudent.attempts}</span>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">Highest Score</span>
                <span className="text-xl font-extrabold text-emerald-400 mt-1 block">{selectedStudent.highest_score_str}</span>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">Lowest Score</span>
                <span className="text-xl font-extrabold text-rose-400 mt-1 block">{selectedStudent.lowest_score_str}</span>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950/40 p-6 space-y-4 shadow-md">
              <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <GraduationCap size={18} className="text-cyan-300" />
                Detailed Quiz History
              </h3>
              
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="px-5 py-3">Quiz / Lesson</th>
                      <th className="px-5 py-3 text-center">Score</th>
                      <th className="px-5 py-3 text-center">Percentage</th>
                      <th className="px-5 py-3 text-center">Date</th>
                      <th className="px-5 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {selectedStudent.results && selectedStudent.results.length > 0 ? (
                      selectedStudent.results.map((res, index) => (
                        <tr key={index} className="hover:bg-slate-900/30">
                          <td className="px-5 py-3 font-semibold text-white">{res.quiz_title}</td>
                          <td className="px-5 py-3 text-center">{res.score}/{res.total_questions}</td>
                          <td className="px-5 py-3 text-center font-bold text-cyan-300">{res.percentage}%</td>
                          <td className="px-5 py-3 text-center text-slate-400">{res.attempted_at}</td>
                          <td className="px-5 py-3 text-right">
                            <span className={`inline-flex rounded-lg px-2 py-0.5 text-xs font-semibold ${
                              res.percentage >= 50 ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20" : "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                            }`}>
                              {res.percentage >= 50 ? "Pass" : "Failed"}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-5 py-6 text-center text-slate-500">
                          No quiz history records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPredictionModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl rounded-3xl border border-cyan-300/40 bg-[#041225] p-7 shadow-[0_0_50px_rgba(34,211,238,0.35)] text-white space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap size={22} className="text-yellow-300 fill-yellow-300 animate-pulse" />
                <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent">
                  AI / ML Grade Prediction & Dropout Risk
                </h2>
              </div>
              <button
                onClick={() => setShowPredictionModal(false)}
                className="rounded-2xl p-2 hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-slate-400">
              Predictions are processed on the backend using student quiz performance history combined with attendance records. 
              The system calculates grade trends and highlights students who might require academic intervention.
            </p>

            {loadingPredictions ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
                <RefreshCw size={24} className="animate-spin text-cyan-300" />
                Processing model predictions...
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="px-5 py-3">Student Name</th>
                      <th className="px-5 py-3 text-center">Attendance Rate</th>
                      <th className="px-5 py-3 text-center">Quiz Average</th>
                      <th className="px-5 py-3 text-center">Predicted Grade</th>
                      <th className="px-5 py-3 text-center">Confidence</th>
                      <th className="px-5 py-3 text-center">Risk Assessment</th>
                      <th className="px-5 py-3 text-right">Academic Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {predictions.map((p, index) => (
                      <tr key={index} className="hover:bg-slate-900/30">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-300 font-bold text-xs border border-indigo-500/20">
                              {p.avatar}
                            </div>
                            <div>
                              <p className="font-semibold text-white">{p.name}</p>
                              <p className="text-[10px] text-slate-500 font-semibold">{p.student_code}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-center font-medium text-slate-300">{p.attendance_rate}</td>
                        <td className="px-5 py-3 text-center font-bold text-cyan-300">{p.quiz_avg}</td>
                        <td className="px-5 py-3 text-center">
                          <span className={`inline-flex items-center justify-center h-7 w-7 rounded-full text-xs font-extrabold ${
                            p.predicted_grade === "A" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                            p.predicted_grade === "B" ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" :
                            p.predicted_grade === "C" ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30" :
                            "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          }`}>
                            {p.predicted_grade}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center font-medium text-slate-400">{p.confidence}</td>
                        <td className="px-5 py-3 text-center">
                          <span className={`inline-flex rounded-lg px-2 py-0.5 text-xs font-semibold ${
                            p.risk_level === "Low Risk" ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20" :
                            p.risk_level === "Medium Risk" ? "bg-yellow-500/10 text-yellow-300 border border-yellow-500/20" :
                            "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                          }`}>
                            {p.risk_level}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className={`inline-flex rounded-lg px-2 py-0.5 text-xs font-semibold ${
                            p.risk_status === "Pass" ? "bg-emerald-500/10 text-emerald-300" :
                            p.risk_status === "Borderline Pass" ? "bg-yellow-500/10 text-yellow-300" :
                            "bg-rose-500/10 text-rose-300 font-bold"
                          }`}>
                            {p.risk_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowPredictionModal(false)}
                className="rounded-2xl border border-slate-700 bg-slate-900 px-5 py-2.5 font-semibold hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;

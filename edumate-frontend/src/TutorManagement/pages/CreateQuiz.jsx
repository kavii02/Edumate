import { useEffect, useState } from "react";
import { Plus, Trash2, Save, RefreshCw, CheckCircle2, Clock3 } from "lucide-react";
import { createQuiz, getTutorQuizzes, publishQuiz } from "../services/tutorApiService";
import { useTutorAuth } from "../context/TutorAuthContext";

const CreateQuiz = () => {
  const { tutorId } = useTutorAuth();
  const [quizTitle, setQuizTitle] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState("Easy");
  const [durationMinutes, setDurationMinutes] = useState(20);
  const [publishing, setPublishing] = useState(false);
  const [questions, setQuestions] = useState([
    {
      id: Date.now(),
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      marks: 1,
    },
  ]);
  const [savedQuizzes, setSavedQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadQuizzes = async () => {
    if (!tutorId) {
      setSavedQuizzes([]);
      return;
    }

    setLoadingQuizzes(true);
    const response = await getTutorQuizzes(tutorId);

    if (response.success) {
      setSavedQuizzes(response.quizzes || []);
    } else {
      setError(response.message || "Failed to load quizzes.");
    }

    setLoadingQuizzes(false);
  };

  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!tutorId) {
        setSavedQuizzes([]);
        return;
      }

      setLoadingQuizzes(true);
      const response = await getTutorQuizzes(tutorId);

      if (response.success) {
        setSavedQuizzes(response.quizzes || []);
      } else {
        setError(response.message || "Failed to load quizzes.");
      }

      setLoadingQuizzes(false);
    };

    fetchQuizzes();
  }, [tutorId]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now(),
        question: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        marks: 1,
      },
    ]);
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const updateQuestion = (id, value) => {
    setQuestions(
      questions.map((q) =>
        q.id === id ? { ...q, question: value } : q
      )
    );
  };

  const updateOption = (questionId, optionIndex, value) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((opt, index) =>
                index === optionIndex ? value : opt
              ),
            }
          : q
      )
    );
  };

  const updateCorrectAnswer = (id, value) => {
    setQuestions(
      questions.map((q) =>
        q.id === id ? { ...q, correctAnswer: value } : q
      )
    );
  };

  const handleSaveQuiz = async (e) => {
    e.preventDefault();

    if (!tutorId) {
      setError("Tutor session not found. Please log in again.");
      return;
    }

    if (!quizTitle.trim()) {
      setError("Quiz title is required.");
      return;
    }

    const cleanedQuestions = questions
      .map((question) => ({
        question: question.question.trim(),
        options: question.options.map((option) => option.trim()),
        correct_answer: question.correctAnswer.trim(),
        marks: Number(question.marks) || 1,
      }))
      .filter((question) => question.question);

    if (cleanedQuestions.length === 0) {
      setError("Add at least one question.");
      return;
    }

    if (cleanedQuestions.some((question) => question.options.some((option) => !option))) {
      setError("Each question must have all four options filled.");
      return;
    }

    if (cleanedQuestions.some((question) => !question.correct_answer)) {
      setError("Select a correct answer for every question.");
      return;
    }

    setSubmitting(true);
    setError("");
    setMessage("");

    const quizData = {
      title: quizTitle.trim(),
      difficulty_level: difficultyLevel,
      duration_minutes: Number(durationMinutes) || 20,
      is_published: publishing,
      questions: cleanedQuestions,
    };

    const response = await createQuiz(tutorId, quizData);

    if (response.success) {
      setMessage("Quiz saved successfully.");
      setQuizTitle("");
      setDifficultyLevel("Easy");
      setDurationMinutes(20);
      setPublishing(false);
      setQuestions([
        {
          id: Date.now(),
          question: "",
          options: ["", "", "", ""],
          correctAnswer: "",
          marks: 1,
        },
      ]);
      await loadQuizzes();
    } else {
      setError(response.message || "Failed to save quiz.");
    }

    setSubmitting(false);
  };

  const handlePublishQuiz = async (quizId) => {
    setError("");
    const response = await publishQuiz(quizId);

    if (response.success) {
      setMessage("Quiz published and available to students.");
      await loadQuizzes();
    } else {
      setError(response.message || "Failed to publish quiz.");
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_30%),linear-gradient(135deg,#03111f,#020617)] text-white px-6 py-7">
      <div className="mb-7">
        <h1 className="text-3xl font-bold">Create Quiz</h1>
        <p className="mt-2 text-slate-400">
          Create MCQ quizzes, save the questions to the database, and publish them for students.
        </p>
      </div>

      <form onSubmit={handleSaveQuiz} className="space-y-6">
        <div className="rounded-3xl border border-cyan-300/50 bg-[#041225]/80 p-7 shadow-[0_0_25px_rgba(34,211,238,0.45)]">
          <h2 className="text-2xl font-semibold mb-5">Quiz Details</h2>

          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Quiz Title
              </label>
              <input
                type="text"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                placeholder="Example: Programming Basics Quiz"
                className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-300"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Difficulty</label>
              <select
                value={difficultyLevel}
                onChange={(e) => setDifficultyLevel(e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-300"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Duration (minutes)</label>
              <input
                type="number"
                min="1"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-300"
              />
            </div>
          </div>

          <label className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-200">
            <input
              type="checkbox"
              checked={publishing}
              onChange={(e) => setPublishing(e.target.checked)}
              className="h-4 w-4 rounded border-slate-500 bg-slate-900 text-cyan-400"
            />
            Publish immediately after saving
          </label>
        </div>

        {questions.map((q, qIndex) => (
          <div
            key={q.id}
            className="rounded-3xl border border-cyan-300/50 bg-[#041225]/80 p-7 shadow-[0_0_25px_rgba(34,211,238,0.35)]"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold">
                Question {qIndex + 1}
              </h2>

              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(q.id)}
                  className="flex items-center gap-2 rounded-xl bg-red-500/20 px-4 py-2 text-red-300 hover:bg-red-500/30"
                >
                  <Trash2 size={18} />
                  Remove
                </button>
              )}
            </div>

            <div className="mb-5">
              <label className="block text-sm text-slate-400 mb-2">
                Question
              </label>
              <textarea
                value={q.question}
                onChange={(e) => updateQuestion(q.id, e.target.value)}
                placeholder="Enter your question here"
                className="w-full min-h-25 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-300"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {q.options.map((option, index) => (
                <div key={index}>
                  <label className="block text-sm text-slate-400 mb-2">
                    Option {String.fromCharCode(65 + index)}
                  </label>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) =>
                      updateOption(q.id, index, e.target.value)
                    }
                    placeholder={`Enter option ${String.fromCharCode(
                      65 + index
                    )}`}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-300"
                  />
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Correct Answer
                </label>
                <select
                  value={q.correctAnswer}
                  onChange={(e) =>
                    updateCorrectAnswer(q.id, e.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-300"
                >
                  <option value="">Select correct answer</option>
                  {q.options.map((option, index) => (
                    <option key={index} value={option}>
                      Option {String.fromCharCode(65 + index)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Marks
                </label>
                <input
                  type="number"
                  min="1"
                  value={q.marks}
                  onChange={(e) =>
                    setQuestions(
                      questions.map((item) =>
                        item.id === q.id
                          ? { ...item, marks: e.target.value }
                          : item
                      )
                    )
                  }
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-300"
                />
              </div>
            </div>
          </div>
        ))}

        <div className="flex flex-wrap gap-4">
          <button
            type="button"
            onClick={addQuestion}
            className="flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400"
          >
            <Plus size={20} />
            Add Question
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Save size={20} />
            {submitting ? "Saving..." : "Save Quiz"}
          </button>
        </div>
      </form>

      <div className="mt-10 rounded-3xl border border-cyan-300/40 bg-[#041225]/80 p-7 shadow-[0_0_25px_rgba(34,211,238,0.25)]">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Created Quizzes</h2>
            <p className="mt-1 text-slate-400">Quizzes saved by this tutor appear here.</p>
          </div>

          <button
            type="button"
            onClick={loadQuizzes}
            className="flex items-center gap-2 rounded-2xl border border-cyan-300/40 bg-slate-950 px-4 py-2 text-sm font-semibold text-cyan-200 hover:bg-slate-900"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {message && (
          <div className="mb-4 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-emerald-200">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-rose-200">
            {error}
          </div>
        )}

        {loadingQuizzes ? (
          <p className="text-slate-400">Loading quizzes...</p>
        ) : savedQuizzes.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {savedQuizzes.map((quiz) => (
              <div key={quiz.quiz_id} className="rounded-3xl border border-slate-700 bg-slate-950/70 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{quiz.title}</h3>
                    <p className="mt-1 text-sm text-slate-400">{quiz.total_questions} questions • {quiz.duration_minutes} minutes</p>
                  </div>

                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${quiz.is_published ? 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-200 border border-amber-500/30'}`}>
                    {quiz.is_published ? <CheckCircle2 size={14} /> : <Clock3 size={14} />}
                    {quiz.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {quiz.questions?.map((question, index) => (
                    <div key={question.question_id ?? index} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                      <p className="text-sm font-medium text-white">{index + 1}. {question.question_text}</p>
                      <p className="mt-2 text-xs text-slate-400">
                        Options: {question.option_a}, {question.option_b}, {question.option_c}, {question.option_d}
                      </p>
                    </div>
                  ))}
                </div>

                {!quiz.is_published && (
                  <button
                    type="button"
                    onClick={() => handlePublishQuiz(quiz.quiz_id)}
                    className="mt-4 rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
                  >
                    Publish for Students
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400">No quizzes created yet.</p>
        )}
      </div>
    </div>
  );
};

export default CreateQuiz;
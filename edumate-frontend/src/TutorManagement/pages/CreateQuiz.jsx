import { useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";

const CreateQuiz = () => {
  const [quizTitle, setQuizTitle] = useState("");
  const [course, setCourse] = useState("");
  const [questions, setQuestions] = useState([
    {
      id: Date.now(),
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      marks: 1,
    },
  ]);

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

  const handleSaveQuiz = (e) => {
    e.preventDefault();

    const quizData = {
      quizTitle,
      course,
      questions,
    };

    console.log("Quiz Created:", quizData);
    alert("Quiz saved successfully! Check console for data.");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_30%),linear-gradient(135deg,#03111f,#020617)] text-white px-6 py-7">
      <div className="mb-7">
        <h1 className="text-3xl font-bold">Create Quiz</h1>
        <p className="mt-2 text-slate-400">
          Create MCQ quizzes for your course and define correct answers.
        </p>
      </div>

      <form onSubmit={handleSaveQuiz} className="space-y-6">
        <div className="rounded-3xl border border-cyan-300/50 bg-[#041225]/80 p-7 shadow-[0_0_25px_rgba(34,211,238,0.45)]">
          <h2 className="text-2xl font-semibold mb-5">Quiz Details</h2>

          <div className="grid gap-5 md:grid-cols-2">
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
              <label className="block text-sm text-slate-400 mb-2">
                Select Course
              </label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-300"
              >
                <option value="">Choose course</option>
                <option value="Programming Fundamentals">
                  Programming Fundamentals
                </option>
                <option value="Database Systems">Database Systems</option>
                <option value="Networking">Networking</option>
              </select>
            </div>
          </div>
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
                className="w-full min-h-[100px] rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-300"
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
            className="flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500"
          >
            <Save size={20} />
            Save Quiz
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateQuiz;
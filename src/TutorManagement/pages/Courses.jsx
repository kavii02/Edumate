const dummyCourses = [
  {
    id: 1,
    title: "Python Programming",
    description:
      "Learn Python basics, functions, OOP concepts, and problem-solving skills.",
    students: 45,
    lessons: 12,
    image:
      "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    title: "Operating Systems",
    description:
      "Understand processes, memory management, file systems, and CPU scheduling.",
    students: 38,
    lessons: 10,
    image:
      "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?auto=format&fit=crop&w=800&q=80",
  },
];

const Courses = () => {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_30%),linear-gradient(135deg,#03111f,#020617)] text-white px-6 py-7">
      <h1 className="text-3xl font-bold mb-2">Courses</h1>
      <p className="text-slate-400 mb-8">
        Manage your created courses and course materials.
      </p>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {dummyCourses.map((course) => (
          <div
            key={course.id}
            className="rounded-3xl overflow-hidden border border-cyan-300/40 bg-[#041225]/90 shadow-[0_0_25px_rgba(34,211,238,0.35)]"
          >
            <img
              src={course.image}
              alt={course.title}
              className="h-44 w-full object-cover"
            />

            <div className="p-6">
              <h2 className="text-2xl font-bold text-cyan-200">
                {course.title}
              </h2>

              <p className="mt-3 text-slate-300 leading-6">
                {course.description}
              </p>

              <div className="mt-5 flex justify-between text-sm text-slate-400">
                <span>{course.students} Students</span>
                <span>{course.lessons} Lessons</span>
              </div>

              <div className="mt-6 flex gap-3">
                <button className="rounded-xl bg-blue-600 px-4 py-2 font-semibold hover:bg-blue-500">
                  View
                </button>

                <button className="rounded-xl bg-cyan-500 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-400">
                  Manage
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Courses;
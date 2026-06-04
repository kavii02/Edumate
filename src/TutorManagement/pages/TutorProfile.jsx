import { Mail, Phone, GraduationCap, BookOpen } from "lucide-react";

const TutorProfile = () => {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_30%),linear-gradient(135deg,#03111f,#020617)] text-white px-6 py-7">
      <h1 className="text-3xl font-bold mb-7">Tutor Profile</h1>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-3xl border border-cyan-300/50 bg-[#041225]/80 p-7 shadow-[0_0_25px_rgba(34,211,238,0.45)] text-center">
          <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 flex items-center justify-center text-4xl font-bold shadow-[0_0_30px_rgba(168,85,247,0.7)]">
            T
          </div>

          <h2 className="mt-5 text-2xl font-bold">Tutor Name</h2>
          <p className="text-cyan-300">A/L ICT Tutor</p>

          <button className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500">
            Edit Profile
          </button>
        </div>

        <div className="rounded-3xl border border-cyan-300/50 bg-[#041225]/80 p-7 shadow-[0_0_25px_rgba(34,211,238,0.45)]">
          <h2 className="text-2xl font-semibold mb-6">Personal Details</h2>

          <div className="space-y-5">
            <div className="flex items-center gap-4 rounded-2xl bg-slate-900/70 p-4 border border-slate-700">
              <Mail className="text-cyan-300" />
              <div>
                <p className="text-slate-400 text-sm">Email</p>
                <p>tutor@edumate.lk</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl bg-slate-900/70 p-4 border border-slate-700">
              <Phone className="text-cyan-300" />
              <div>
                <p className="text-slate-400 text-sm">Phone</p>
                <p>071 234 5678</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl bg-slate-900/70 p-4 border border-slate-700">
              <GraduationCap className="text-cyan-300" />
              <div>
                <p className="text-slate-400 text-sm">Qualification</p>
                <p>BSc in Computer Science</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl bg-slate-900/70 p-4 border border-slate-700">
              <BookOpen className="text-cyan-300" />
              <div>
                <p className="text-slate-400 text-sm">Teaching Area</p>
                <p>Programming, Database Systems, Networking</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-cyan-300/50 bg-[#041225]/80 p-7 shadow-[0_0_25px_rgba(34,211,238,0.45)]">
        <h2 className="text-2xl font-semibold mb-5">About Tutor</h2>
        <p className="text-slate-300 leading-7">
          Experienced ICT tutor supporting A/L students with programming,
          database systems, networking, and exam-focused learning activities.
        </p>
      </div>
    </div>
  );
};

export default TutorProfile;
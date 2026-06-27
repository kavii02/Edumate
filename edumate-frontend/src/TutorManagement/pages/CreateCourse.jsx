import { useState } from "react";
import { createCourse, addMaterial } from "../../services/courseApiService";
import { useTutorAuth } from "../context/TutorAuthContext";

const CreateCourse = () => {
  const { tutorId } = useTutorAuth();
  const [courseName, setCourseName] = useState("");
  const [description, setDescription] = useState("");
  const [materialTitle, setMaterialTitle] = useState("");
  const [materialType, setMaterialType] = useState("pdf");
  const [selectedFile, setSelectedFile] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [courseId, setCourseId] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setMessage("");
  };

  const handleCourseCreate = async (event) => {
    event.preventDefault();
    if (!courseName.trim() || !description.trim()) {
      setMessage("Enter course name and description first.");
      return;
    }

    if (!tutorId) {
      setMessage("You must be logged in as a tutor to create a course.");
      return;
    }
    
    setLoading(true);
    const response = await createCourse({
      tutor_id: tutorId,
      title: courseName,
      description: description,
      category: "General",
      level: "Beginner",
    });
    
    if (response.success) {
      setCourseId(response.course.course_id);
      setMessage("Course created successfully! Now upload materials.");
    } else {
      setMessage("Failed to create course: " + response.message);
    }
    setLoading(false);
  };

  const handleUploadMaterial = async (event) => {
    event.preventDefault();
    
    if (!courseId) {
      setMessage("Please create a course first.");
      return;
    }
    
    if (!materialTitle.trim() || !selectedFile) {
      setMessage("Add a title and choose a file.");
      return;
    }

    setLoading(true);
    
    const response = await addMaterial(courseId, selectedFile, materialTitle, materialType, "");
    
    if (response.success) {
      const newMaterial = {
        id: response.material.material_id,
        title: materialTitle,
        type: materialType,
        fileName: selectedFile.name,
        uploadedAt: new Date().toLocaleString(),
      };

      setMaterials((prev) => {
        if (editingId) {
          return prev.map((item) => (item.id === editingId ? newMaterial : item));
        }
        return [...prev, newMaterial];
      });

      setMaterialTitle("");
      setMaterialType("pdf");
      setSelectedFile(null);
      setEditingId(null);
      setMessage(editingId ? "Material updated successfully." : "Material uploaded successfully.");
      event.currentTarget.reset();
    } else {
      setMessage("Failed to upload material: " + response.message);
    }
    
    setLoading(false);
  };

  const handleEditMaterial = (material) => {
    setEditingId(material.id);
    setMaterialTitle(material.title);
    setMaterialType(material.type);
    setMessage("");
  };

  const handleRemoveMaterial = (id) => {
    setMaterials((prev) => prev.filter((item) => item.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setMaterialTitle("");
      setMaterialType("pdf");
      setSelectedFile(null);
    }
    setMessage("Material removed.");
  };

  return (
    <div className="min-h-screen bg-[#040b1a] text-white py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-cyan-200">Create Course</h1>
          <p className="mt-2 text-slate-400">
            Upload PDFs, videos, and manage course content.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
          <div className="space-y-6">
            <div className="rounded-[32px] border border-cyan-500/20 bg-[#071426]/90 p-7 shadow-[0_24px_80px_rgba(7,18,34,0.35)]">
              <h2 className="text-2xl font-semibold text-white mb-5">Course Details</h2>
              <form className="space-y-5" onSubmit={handleCourseCreate}>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Course Name</label>
                  <input
                    type="text"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    placeholder="Enter course name"
                    disabled={loading || !!courseId}
                    className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Course Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter course description"
                    disabled={loading || !!courseId}
                    className="w-full min-h-[140px] rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 disabled:opacity-50"
                  />
                </div>
                {!courseId && (
                  <button 
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center rounded-3xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
                  >
                    {loading ? "Creating..." : "Create Course"}
                  </button>
                )}
                {courseId && (
                  <div className="text-cyan-200 text-sm">✓ Course created (ID: {courseId})</div>
                )}
              </form>
            </div>

            {courseId && (
              <div className="rounded-[32px] border border-cyan-500/20 bg-[#071426]/90 p-7 shadow-[0_24px_80px_rgba(7,18,34,0.35)]">
                <h2 className="text-2xl font-semibold text-white mb-5">Upload Course Materials</h2>
                <form className="space-y-5" onSubmit={handleUploadMaterial}>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Material Title</label>
                    <input
                      type="text"
                      value={materialTitle}
                      onChange={(e) => setMaterialTitle(e.target.value)}
                      placeholder="e.g. Week 1 Lecture Notes"
                      disabled={loading}
                      className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 disabled:opacity-50"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Material Type</label>
                      <select
                        value={materialType}
                        onChange={(e) => setMaterialType(e.target.value)}
                        disabled={loading}
                        className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 disabled:opacity-50"
                      >
                        <option value="pdf">PDF</option>
                        <option value="video">Video</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Upload File</label>
                      <input
                        type="file"
                        accept={materialType === "pdf" ? "application/pdf" : "video/*"}
                        onChange={handleFileChange}
                        disabled={loading}
                        className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-white file:rounded-full file:border-0 file:bg-cyan-500 file:px-4 file:py-2 file:text-slate-950 file:font-semibold disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center rounded-3xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
                  >
                    {loading ? "Uploading..." : (editingId ? "Update Material" : "Upload Material")}
                  </button>
                </form>

                {selectedFile && (
                  <p className="mt-4 text-sm text-slate-300">
                    Selected file: <span className="text-cyan-200">{selectedFile.name}</span>
                  </p>
                )}
              </div>
            )}
            
            {message && (
              <div className={`p-4 rounded-2xl text-sm ${
                message.includes("successfully") || message.includes("created")
                  ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/50"
                  : "bg-rose-500/20 text-rose-200 border border-rose-500/50"
              }`}>
                {message}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-cyan-500/20 bg-[#071426]/90 p-7 shadow-[0_24px_80px_rgba(7,18,34,0.35)]">
              <h3 className="text-xl font-semibold text-white mb-5">Uploaded Materials</h3>
              {materials.length === 0 ? (
                <p className="text-slate-400">No materials uploaded yet.</p>
              ) : (
                <div className="space-y-4">
                  {materials.map((material) => (
                    <div key={material.id} className="rounded-3xl border border-slate-700 bg-slate-900 p-4">
                      <div className="flex flex-col gap-3">
                        <div>
                          <p className="font-semibold text-white">{material.title}</p>
                          <p className="text-sm text-slate-300">
                            {material.type.toUpperCase()} · {material.fileName}
                          </p>
                          <p className="text-sm text-slate-400">
                            Uploaded: {material.uploadedAt}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditMaterial(material)}
                            disabled={loading}
                            className="rounded-2xl bg-amber-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-amber-400 disabled:opacity-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveMaterial(material.id)}
                            disabled={loading}
                            className="rounded-2xl bg-rose-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-rose-400 disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[32px] border border-cyan-500/10 bg-[#071426]/80 p-7">
              <h3 className="text-xl font-semibold text-white mb-4">Tips</h3>
              <ul className="space-y-3 text-slate-300">
                <li>• Use descriptive titles for all uploads.</li>
                <li>• Upload PDFs for notes and videos for lectures.</li>
                <li>• Edit or replace outdated materials anytime.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;
                  
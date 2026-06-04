import { useState } from "react";

const CreateCourse = () => {
  const [courseName, setCourseName] = useState("");
  const [description, setDescription] = useState("");
  const [materialTitle, setMaterialTitle] = useState("");
  const [materialType, setMaterialType] = useState("pdf");
  const [selectedFile, setSelectedFile] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setMessage("");
  };

  const handleCourseCreate = (event) => {
    event.preventDefault();
    if (!courseName.trim() || !description.trim()) {
      setMessage("Enter course name and description first.");
      return;
    }
    setMessage("Course details saved. You can now upload materials.");
  };

  const handleUploadMaterial = (event) => {
    event.preventDefault();
    if (!materialTitle.trim() || !selectedFile) {
      setMessage("Add a title and choose a PDF or video file.");
      return;
    }

    const newMaterial = {
      id: editingId ?? Date.now(),
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
            Upload PDFs, videos, and manage course content with the new neon tutor design.
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
                    className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Course Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter course description"
                    className="w-full min-h-[140px] rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  />
                </div>
                <button className="inline-flex items-center rounded-3xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
                  Save Course
                </button>
              </form>
            </div>

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
                    className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Material Type</label>
                    <select
                      value={materialType}
                      onChange={(e) => setMaterialType(e.target.value)}
                      className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
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
                      className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-white file:rounded-full file:border-0 file:bg-cyan-500 file:px-4 file:py-2 file:text-slate-950 file:font-semibold"
                    />
                  </div>
                </div>

                <button className="inline-flex items-center rounded-3xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">
                  {editingId ? "Update Material" : "Upload Material"}
                </button>
              </form>

              {selectedFile && (
                <p className="mt-4 text-sm text-slate-300">
                  Selected file: <span className="text-cyan-200">{selectedFile.name}</span>
                </p>
              )}
              {message && <p className="mt-3 text-sm text-cyan-200">{message}</p>}
            </div>
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
                            className="rounded-2xl bg-amber-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-amber-400"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveMaterial(material.id)}
                            className="rounded-2xl bg-rose-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-rose-400"
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
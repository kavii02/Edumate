import { useState } from "react";
import { createCourse, addMaterial, uploadCourseCover } from "../../services/courseApiService";
import { useTutorAuth } from "../context/TutorAuthContext";

const PRESET_IMAGES = [
  { name: "Coding", url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60" },
  { name: "Databases", url: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=60" },
  { name: "Networking", url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=60" },
  { name: "AI & Tech", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60" },
  { name: "Abstract", url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=60" }
];

const CreateCourse = () => {
  const { tutorId } = useTutorAuth();
  const [courseName, setCourseName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [coverFile, setCoverFile] = useState(null);
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
      image_url: imageUrl || PRESET_IMAGES[4].url, // default to Abstract preset if empty
      category: "General",
      level: "Beginner",
    });

    if (response.success) {
      const newCourseId = response.course.course_id;
      setCourseId(newCourseId);
      
      if (coverFile) {
        setMessage("Creating course and uploading cover image...");
        const coverResponse = await uploadCourseCover(newCourseId, coverFile);
        if (coverResponse.success) {
          setMessage("Course created and cover image uploaded successfully! Now upload materials.");
        } else {
          setMessage("Course created, but cover image upload failed: " + coverResponse.message);
        }
      } else {
        setMessage("Course created successfully! Now upload materials.");
      }
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
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Course Cover Image (URL)</label>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Paste cover URL or select preset"
                      disabled={loading || !!courseId || !!coverFile}
                      className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 disabled:opacity-50"
                    />
                    {!courseId && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {PRESET_IMAGES.map((img) => (
                          <button
                            key={img.name}
                            type="button"
                            onClick={() => {
                              setImageUrl(img.url);
                              setCoverFile(null);
                            }}
                            disabled={!!coverFile}
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition ${
                              imageUrl === img.url
                                ? "bg-cyan-500 text-slate-950 border-cyan-400"
                                : "border-slate-700 text-slate-300 hover:bg-slate-900"
                            }`}
                          >
                            {img.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Or Upload Cover Image File</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        setCoverFile(e.target.files[0]);
                        setImageUrl(""); // clear text URL if file is chosen
                      }}
                      disabled={loading || !!courseId}
                      className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-white file:rounded-full file:border-0 file:bg-cyan-500 file:px-4 file:py-2 file:font-semibold file:text-slate-950 file:text-xs disabled:opacity-50"
                    />
                    {coverFile && (
                      <p className="mt-2 text-xs text-cyan-300">
                        Selected: {coverFile.name} ({Math.round(coverFile.size / 1024)} KB)
                      </p>
                    )}
                  </div>
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
              <div className={`p-4 rounded-2xl text-sm ${message.includes("successfully") || message.includes("created")
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

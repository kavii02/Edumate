import { useState, useEffect } from "react";
import {
  getAllCourses,
  getCourse,
  addMaterial,
  deleteMaterial,
  updateCourse,
  getMaterialFileUrl,
} from "../../services/courseApiService";
import { useTutorAuth } from "../context/TutorAuthContext";

const Courses = () => {
  const { tutorId } = useTutorAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [previewMaterial, setPreviewMaterial] = useState(null);
  const [materialTitle, setMaterialTitle] = useState("");
  const [materialType, setMaterialType] = useState("pdf");
  const [selectedFile, setSelectedFile] = useState(null);
  const [editDescription, setEditDescription] = useState("");

  const fetchCourses = async () => {
    if (!tutorId) return;

    setLoading(true);
    const response = await getAllCourses(tutorId);

    if (response.success) {
      setCourses(response.courses || []);
      setError(null);
    } else {
      setError(response.message || "Failed to load courses");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, [tutorId]);

  const openCourseModal = async (course, mode) => {
    setActiveModal(mode);
    setModalLoading(true);
    setModalMessage("");
    setPreviewMaterial(null);
    setMaterialTitle("");
    setMaterialType("pdf");
    setSelectedFile(null);

    const response = await getCourse(course.course_id);

    if (response.success) {
      setSelectedCourse(response.course);
      setEditDescription(response.course.description || "");
    } else {
      setModalMessage(response.message || "Failed to load course details");
      setSelectedCourse(null);
    }

    setModalLoading(false);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedCourse(null);
    setPreviewMaterial(null);
    setModalMessage("");
  };

  const refreshSelectedCourse = async (courseId) => {
    const response = await getCourse(courseId);
    if (response.success) {
      setSelectedCourse(response.course);
      setEditDescription(response.course.description || "");
      await fetchCourses();
    }
  };

  const handleUploadMaterial = async (event) => {
    event.preventDefault();

    if (!selectedCourse || !materialTitle.trim() || !selectedFile) {
      setModalMessage("Add a title and choose a file.");
      return;
    }

    setModalLoading(true);
    const response = await addMaterial(
      selectedCourse.course_id,
      selectedFile,
      materialTitle,
      materialType,
      ""
    );

    if (response.success) {
      setModalMessage("Material uploaded successfully.");
      setMaterialTitle("");
      setMaterialType("pdf");
      setSelectedFile(null);
      event.currentTarget.reset();
      await refreshSelectedCourse(selectedCourse.course_id);
    } else {
      setModalMessage(response.message || "Failed to upload material.");
    }

    setModalLoading(false);
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!selectedCourse) return;

    setModalLoading(true);
    const response = await deleteMaterial(materialId);

    if (response.success) {
      setModalMessage("Material removed.");
      if (previewMaterial?.material_id === materialId) {
        setPreviewMaterial(null);
      }
      await refreshSelectedCourse(selectedCourse.course_id);
    } else {
      setModalMessage(response.message || "Failed to remove material.");
    }

    setModalLoading(false);
  };

  const handleSaveCourse = async () => {
    if (!selectedCourse) return;

    setModalLoading(true);
    const response = await updateCourse(selectedCourse.course_id, {
      description: editDescription,
    });

    if (response.success) {
      setModalMessage("Course updated successfully.");
      await refreshSelectedCourse(selectedCourse.course_id);
    } else {
      setModalMessage(response.message || "Failed to update course.");
    }

    setModalLoading(false);
  };

  const renderMaterialPreview = (material) => {
    const fileUrl = getMaterialFileUrl(material.file_url || material.file_path);
    const type = (material.material_type || "").toLowerCase();

    if (type === "pdf") {
      return (
        <iframe
          title={material.title}
          src={fileUrl}
          className="h-[420px] w-full rounded-2xl border border-slate-700 bg-white"
        />
      );
    }

    if (type === "video") {
      return (
        <video
          controls
          className="max-h-[420px] w-full rounded-2xl border border-slate-700 bg-black"
          src={fileUrl}
        />
      );
    }

    return (
      <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 text-slate-300">
        Preview not available for this file type.
        <a
          href={fileUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 block text-cyan-300 hover:text-cyan-200"
        >
          Open file
        </a>
      </div>
    );
  };

  const renderMaterialsList = (canManage) => {
    const materials = selectedCourse?.materials || [];

    if (materials.length === 0) {
      return <p className="text-slate-400">No materials uploaded yet.</p>;
    }

    return (
      <div className="space-y-3">
        {materials.map((material) => {
          const fileName = material.file_url || material.file_path;
          const fileUrl = getMaterialFileUrl(fileName);

          return (
            <div
              key={material.material_id}
              className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-semibold text-white">{material.title}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {(material.material_type || "file").toUpperCase()} · {fileName}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewMaterial(material)}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold hover:bg-blue-500"
                  >
                    Preview
                  </button>
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-slate-700 px-4 py-2 text-sm font-semibold hover:bg-slate-600"
                  >
                    Open
                  </a>
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => handleDeleteMaterial(material.material_id)}
                      disabled={modalLoading}
                      className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-rose-400 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderModal = () => {
    if (!activeModal) return null;

    const isManage = activeModal === "manage";

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
        <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[32px] border border-cyan-500/30 bg-[#041225] p-6 shadow-[0_24px_80px_rgba(7,18,34,0.55)]">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wide text-cyan-300">
                {isManage ? "Manage Course" : "View Course"}
              </p>
              <h2 className="mt-1 text-3xl font-bold text-white">
                {selectedCourse?.title || "Course Details"}
              </h2>
            </div>
            <button
              type="button"
              onClick={closeModal}
              className="rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              Close
            </button>
          </div>

          {modalLoading && !selectedCourse ? (
            <p className="text-slate-400">Loading course content...</p>
          ) : selectedCourse ? (
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-700 bg-slate-900/60 p-5">
                {isManage ? (
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm text-slate-400">
                        Course Description
                      </label>
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="min-h-[120px] w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveCourse}
                      disabled={modalLoading}
                      className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
                    >
                      Save Changes
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-slate-300 leading-7">
                      {selectedCourse.description || "No description provided."}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-400">
                      <span>{selectedCourse.lesson_count || 0} Lessons</span>
                      <span>{selectedCourse.student_count || 0} Students</span>
                      <span>Status: {selectedCourse.status || "Active"}</span>
                    </div>
                  </>
                )}
              </div>

              {isManage && (
                <div className="rounded-3xl border border-cyan-500/20 bg-[#071426]/90 p-5">
                  <h3 className="mb-4 text-xl font-semibold text-white">Upload Material</h3>
                  <form className="space-y-4" onSubmit={handleUploadMaterial}>
                    <input
                      type="text"
                      value={materialTitle}
                      onChange={(e) => setMaterialTitle(e.target.value)}
                      placeholder="Material title"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                    />
                    <div className="grid gap-4 md:grid-cols-2">
                      <select
                        value={materialType}
                        onChange={(e) => setMaterialType(e.target.value)}
                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                      >
                        <option value="pdf">PDF</option>
                        <option value="video">Video</option>
                      </select>
                      <input
                        type="file"
                        accept={materialType === "pdf" ? "application/pdf" : "video/*"}
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white file:rounded-full file:border-0 file:bg-cyan-500 file:px-4 file:py-2 file:font-semibold file:text-slate-950"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={modalLoading}
                      className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
                    >
                      {modalLoading ? "Uploading..." : "Upload Material"}
                    </button>
                  </form>
                </div>
              )}

              <div>
                <h3 className="mb-4 text-xl font-semibold text-white">
                  Course Materials
                </h3>
                {renderMaterialsList(isManage)}
              </div>

              {previewMaterial && (
                <div className="rounded-3xl border border-cyan-500/20 bg-[#071426]/90 p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-cyan-200">
                      Preview: {previewMaterial.title}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setPreviewMaterial(null)}
                      className="text-sm text-slate-400 hover:text-white"
                    >
                      Hide preview
                    </button>
                  </div>
                  {renderMaterialPreview(previewMaterial)}
                </div>
              )}
            </div>
          ) : (
            <p className="text-rose-300">{modalMessage || "Could not load course."}</p>
          )}

          {modalMessage && selectedCourse && (
            <p
              className={`mt-4 rounded-2xl px-4 py-3 text-sm ${
                modalMessage.toLowerCase().includes("success")
                  ? "bg-emerald-500/20 text-emerald-200"
                  : "bg-rose-500/20 text-rose-200"
              }`}
            >
              {modalMessage}
            </p>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_30%),linear-gradient(135deg,#03111f,#020617)] text-white px-6 py-7">
        <p className="text-slate-400">Loading courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_30%),linear-gradient(135deg,#03111f,#020617)] text-white px-6 py-7">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_30%),linear-gradient(135deg,#03111f,#020617)] text-white px-6 py-7">
      <h1 className="text-3xl font-bold mb-2">Courses</h1>
      <p className="text-slate-400 mb-8">
        Manage your created courses and course materials.
      </p>

      {courses.length === 0 ? (
        <div className="rounded-3xl border border-cyan-300/40 bg-[#041225]/90 p-8 text-center">
          <p className="text-slate-300">No courses yet. Create your first course!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course.course_id}
              className="rounded-3xl overflow-hidden border border-cyan-300/40 bg-[#041225]/90 shadow-[0_0_25px_rgba(34,211,238,0.35)]"
            >
              {course.image_url && (
                <img
                  src={course.image_url}
                  alt={course.title}
                  className="h-44 w-full object-cover"
                />
              )}

              <div className="p-6">
                <h2 className="text-2xl font-bold text-cyan-200">{course.title}</h2>

                <p className="mt-3 text-slate-300 leading-6">
                  {course.description || "No description provided"}
                </p>

                <div className="mt-5 flex justify-between text-sm text-slate-400">
                  <span>{course.student_count} Students</span>
                  <span>{course.lesson_count} Lessons</span>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => openCourseModal(course, "view")}
                    className="rounded-xl bg-blue-600 px-4 py-2 font-semibold hover:bg-blue-500"
                  >
                    View
                  </button>

                  <button
                    type="button"
                    onClick={() => openCourseModal(course, "manage")}
                    className="rounded-xl bg-cyan-500 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-400"
                  >
                    Manage
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {renderModal()}
    </div>
  );
};

export default Courses;

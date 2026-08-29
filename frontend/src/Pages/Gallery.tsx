import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState, useRef } from "react";
import Footer from "./Footer";

type GalleryItem = {
  id: number | string;
  title: string;
  imageUrl: string;
  imageUrls?: string[];
  uploadedBy?: string;
  createdAt?: string;
};

const cachedGallery: GalleryItem[] = [
  {
    id: 1,
    title: "Campus Memories",
    imageUrl:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop",
    imageUrls: ["https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop"],
    uploadedBy: "Admin",
    createdAt: "2024-03-01T10:00:00.000Z",
  },
  {
    id: 2,
    title: "Alumni Meet",
    imageUrl:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=600&fit=crop",
    imageUrls: ["https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=600&fit=crop"],
    uploadedBy: "Admin",
    createdAt: "2024-03-10T10:00:00.000Z",
  },
  {
    id: 3,
    title: "Cultural Day",
    imageUrl:
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop",
    imageUrls: ["https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop"],
    uploadedBy: "Admin",
    createdAt: "2024-03-20T10:00:00.000Z",
  },
];

const Gallery = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<GalleryItem[]>(cachedGallery);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Auth state
  const [isAdmin, setIsAdmin] = useState(false);

  // Upload states
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [uploadedBy, setUploadedBy] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);

  // Modal (view images with slider)
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const token = localStorage.getItem("token");
      setIsAdmin(!!token && user?.role === "admin");
    } catch {
      setIsAdmin(false);
    }
  }, []);

  // Sync file previews
  useEffect(() => {
    if (files.length === 0) {
      setFilePreviews([]);
      return;
    }
    const objectUrls = files.map((file) => URL.createObjectURL(file));
    setFilePreviews(objectUrls);

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db - da;
    });
  }, [items]);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/gallery");
      if (!res.ok) throw new Error("Failed to fetch gallery");

      const data = await res.json();
      if (Array.isArray(data)) setItems(data);

      setError(null);
    } catch (err) {
      console.error("Gallery fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch gallery");
      setItems(cachedGallery);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleDelete = async (id: number | string) => {
    if (!window.confirm("Delete this gallery entry and all its photos?")) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in as Admin to delete items.");
        return;
      }
      const res = await fetch(`/api/gallery/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok && res.status !== 204) {
        if (res.status === 401 || res.status === 403) {
          throw new Error("Admin session expired. Please log in again.");
        }
        throw new Error("Could not delete photo");
      }
      setItems((prev) => prev.filter((item) => item.id !== id));
      setSelected(null);
      setSuccessMsg("Gallery item deleted successfully.");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not delete photo");
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (files.length === 0) {
      alert("Please choose at least one image file");
      return;
    }
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Admin login required to upload photos. Please sign in as Admin.");
      navigate("/login");
      return;
    }

    try {
      setUploading(true);
      setSuccessMsg(null);

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("uploadedBy", uploadedBy.trim() || "Admin");
      files.forEach((f) => formData.append("images", f));

      const res = await fetch("/api/gallery/uploads", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (res.status === 401 || res.status === 403) {
          throw new Error("Admin authentication required or session expired. Please sign in again.");
        }
        throw new Error(body.detail || "Upload failed. Please check image formats and sizes.");
      }

      const savedItem: GalleryItem = await res.json();
      setItems((prev) => [savedItem, ...prev]);

      setTitle("");
      setUploadedBy("");
      setFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setError(null);
      setSuccessMsg("Photos uploaded successfully to Gallery!");
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      console.error("Upload error:", err);
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const openGallery = (item: GalleryItem) => {
    setSelected(item);
    setSlideIndex(0);
  };

  const getImages = (item: GalleryItem): string[] => {
    if (item.imageUrls && item.imageUrls.length > 0) return item.imageUrls;
    if (item.imageUrl) return [item.imageUrl];
    return [];
  };

  if (loading) {
    return (
      <>
        <Outlet />
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-slate-600 font-semibold text-lg animate-pulse">Loading gallery...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Outlet />

      {/* PAGE HEADER */}
      <div className="bg-slate-900 pt-16 pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/20 rounded-full filter blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Alumni <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">Gallery</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            A collection of memories, reunions, and celebrations. Relive the golden days of SRIT.
          </p>
        </div>
      </div>

      <div className="min-h-screen bg-slate-50 pb-20 -mt-10 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {successMsg && (
            <div className="mb-8 bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-xl flex items-center gap-3 shadow-sm animate-in fade-in">
              <svg className="w-6 h-6 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span className="font-semibold text-sm">{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="mb-8 bg-orange-50 border border-orange-200 text-orange-800 px-6 py-4 rounded-xl flex items-center gap-3 shadow-sm">
              <svg className="w-6 h-6 text-orange-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              <span className="font-medium text-sm">Showing cached gallery: {error}</span>
            </div>
          )}

          {/* Upload Section Card (Admin Only) */}
          {isAdmin && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Upload Gallery Photos</h2>
                  <p className="text-xs text-slate-500">Upload single or multiple photos grouped under a title.</p>
                </div>
              </div>

              <form onSubmit={handleUpload} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Gallery Title *</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Annual Meet 2024"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Uploaded By (Optional)</label>
                    <input
                      type="text"
                      value={uploadedBy}
                      onChange={(e) => setUploadedBy(e.target.value)}
                      placeholder="e.g. Admin / Batch of 2020"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Select Images *</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => setFiles(Array.from(e.target.files || []))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                      required
                    />
                  </div>
                </div>

                {/* Selected File Previews */}
                {filePreviews.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-600 mb-2">
                      {files.length} Photo{files.length > 1 ? "s" : ""} Selected for Upload:
                    </p>
                    <div className="flex flex-wrap gap-3 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-xl">
                      {filePreviews.map((preview, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 shadow-xs group">
                          <img src={preview} alt={`preview ${i}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              const newFiles = files.filter((_, idx) => idx !== i);
                              setFiles(newFiles);
                              if (newFiles.length === 0 && fileInputRef.current) {
                                fileInputRef.current.value = "";
                              }
                            }}
                            className="absolute top-0 right-0 bg-red-600 text-white w-4 h-4 rounded-bl flex items-center justify-center text-[10px] opacity-80 hover:opacity-100"
                            title="Remove image"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="btn-gradient px-8 py-3 rounded-xl font-bold text-sm shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                        Uploading {files.length} Photo{files.length > 1 ? "s" : ""}...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                        </svg>
                        Upload to Gallery
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Gallery Grid */}
          {sortedItems.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center max-w-2xl mx-auto mt-12">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📸</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Empty Gallery</h3>
              <p className="text-slate-500">Be the first to upload a memory to the alumni gallery.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[250px] sm:auto-rows-[300px]">
              {sortedItems.map((item) => {
                const images = getImages(item);
                return (
                  <div
                    key={item.id}
                    className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 bg-slate-200 cursor-pointer"
                    onClick={() => openGallery(item)}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Persistent Gradient overlay at bottom for readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {/* Photo count badge (top right) */}
                    {images.length > 1 && (
                      <div className="absolute top-3 left-3 z-10 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        {images.length} photos
                      </div>
                    )}

                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                        title="Delete gallery entry"
                        className="absolute top-3 right-3 z-10 w-8 h-8 bg-red-600/90 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-sm transition-colors text-sm font-bold"
                      >
                        ✕
                      </button>
                    )}

                    <div className="absolute bottom-0 left-0 w-full p-5 flex flex-col justify-end">
                      <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-slate-300 font-medium opacity-80 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                        {item.uploadedBy && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                            {item.uploadedBy}
                          </span>
                        )}
                        {item.createdAt && (
                          <span>• {new Date(item.createdAt).toLocaleDateString("en-IN")}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal with Image Slider */}
        {selected && (() => {
          const images = getImages(selected);
          const currentImage = images[slideIndex] || images[0] || selected.imageUrl;
          const hasMultiple = images.length > 1;

          return (
            <div
              className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-in fade-in duration-200"
              onClick={() => setSelected(null)}
            >
              <div
                className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
                  title="Close"
                >
                  ✖
                </button>

                <div className="relative bg-slate-100 min-h-[300px] flex items-center justify-center">
                  <img
                    src={currentImage}
                    alt={`${selected.title} - ${slideIndex + 1}`}
                    className="w-full max-h-[75vh] object-contain transition-opacity duration-200"
                  />

                  {/* Prev/Next Buttons */}
                  {hasMultiple && (
                    <>
                      <button
                        onClick={() => setSlideIndex((i) => (i - 1 + images.length) % images.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all shadow-lg text-xl z-10"
                        title="Previous photo"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                      </button>
                      <button
                        onClick={() => setSlideIndex((i) => (i + 1) % images.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all shadow-lg text-xl z-10"
                        title="Next photo"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                      </button>

                      {/* Dot indicators */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                        {images.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setSlideIndex(i)}
                            className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                              i === slideIndex
                                ? "bg-white w-6 rounded-full"
                                : "bg-white/50 hover:bg-white/70"
                            }`}
                          />
                        ))}
                      </div>

                      {/* Counter */}
                      <span className="absolute top-4 left-4 bg-black/50 text-white text-sm font-bold px-3 py-1.5 rounded-full backdrop-blur-sm z-10">
                        {slideIndex + 1} / {images.length}
                      </span>
                    </>
                  )}
                </div>

                <div className="p-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">{selected.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                      {selected.uploadedBy && (
                        <span className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-xs">👤</span>
                          {selected.uploadedBy}
                        </span>
                      )}
                      {selected.createdAt && (
                        <span className="flex items-center gap-1">
                          🗓️ {new Date(selected.createdAt).toLocaleString("en-IN")}
                        </span>
                      )}
                      {hasMultiple && (
                        <span className="flex items-center gap-1 text-indigo-600 font-semibold">
                          📸 {images.length} photos
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelected(null)}
                    className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors text-sm"
                  >
                    Close Detail
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      <Footer />
    </>
  );
};

export default Gallery;

import { Outlet } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Footer from "./Footer";

type GalleryItem = {
  id: number | string;
  title: string;
  imageUrl: string;
  uploadedBy?: string;
  createdAt?: string;
};

const cachedGallery: GalleryItem[] = [
  {
    id: 1,
    title: "Campus Memories",
    imageUrl:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop",
    uploadedBy: "Admin",
    createdAt: "2024-03-01T10:00:00.000Z",
  },
  {
    id: 2,
    title: "Alumni Meet",
    imageUrl:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=600&fit=crop",
    uploadedBy: "Admin",
    createdAt: "2024-03-10T10:00:00.000Z",
  },
  {
    id: 3,
    title: "Cultural Day",
    imageUrl:
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop",
    uploadedBy: "Admin",
    createdAt: "2024-03-20T10:00:00.000Z",
  },
];


const Gallery = () => {
  const [items, setItems] = useState<GalleryItem[]>(cachedGallery);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Upload states
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [uploadedBy, setUploadedBy] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // Modal (view image)
  const [selected, setSelected] = useState<GalleryItem | null>(null);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db - da;
    });
  }, [items]);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:8000/api/gallery");
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

    fetchGallery();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      alert("Please choose an image file");
      return;
    }
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("uploadedBy", uploadedBy.trim() || "Anonymous");
      formData.append("image", file);

      const res = await fetch("http://localhost:8000/api/gallery/uploads", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const saved = await res.json();
      setItems((prev) => [saved, ...prev]);

      setTitle("");
      setUploadedBy("");
      setFile(null);
      setError(null);
    } catch (err) {
      console.error("Upload error:", err);
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
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

          {error && (
            <div className="mb-8 bg-orange-50 border border-orange-200 text-orange-800 px-6 py-4 rounded-xl flex items-center gap-3 shadow-sm">
              <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              <span className="font-medium text-sm">Showing cached gallery: {error}</span>
            </div>
          )}

          {/* ✅ Upload Section Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex flex-col items-center justify-center text-indigo-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Upload Photo</h2>
                <p className="text-xs text-slate-500">Contribute to our shared memories</p>
              </div>
            </div>

            <form
              onSubmit={handleUpload}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start"
            >
              <div className="col-span-1 md:col-span-1">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Photo title (required)"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                  required
                />
              </div>

              <div className="col-span-1 md:col-span-1">
                <input
                  type="text"
                  value={uploadedBy}
                  onChange={(e) => setUploadedBy(e.target.value)}
                  placeholder="Your Name (optional)"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                />
              </div>

              <div className="col-span-1 md:col-span-1">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  />
                </div>
              </div>

              <div className="col-span-1 md:col-span-1">
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full btn-gradient py-3 rounded-xl font-bold text-sm shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span> Uploading...</>
                  ) : "Upload to Gallery"}
                </button>
              </div>
            </form>
          </div>

          {/* ✅ Gallery Grid (Masonry-like flex or auto-fill grid) */}
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
              {sortedItems.map((item) => (
                <div
                  key={item.id}
                  className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 bg-slate-200 cursor-pointer"
                  onClick={() => setSelected(item)}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Persistent Gradient overlay at bottom for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="absolute bottom-0 left-0 w-full p-5 flex flex-col justify-end">
                    <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-300 font-medium opacity-80 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                      {item.uploadedBy && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                          {item.uploadedBy}
                        </span>
                      )}
                      {item.createdAt && (
                        <span>• {new Date(item.createdAt).toLocaleDateString("en-IN")}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ✅ Premium Modal */}
        {selected && (
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
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
                title="Close"
              >
                ✖
              </button>
              
              <div className="relative bg-slate-100 min-h-[300px] flex items-center justify-center">
                <img
                  src={selected.imageUrl}
                  alt={selected.title}
                  className="w-full max-h-[75vh] object-contain"
                />
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
        )}
      </div>

      <Footer />
    </>
  );
};

export default Gallery;

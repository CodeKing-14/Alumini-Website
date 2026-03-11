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
    // newest first if createdAt exists
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

        const res = await fetch("http://localhost:5000/api/gallery");
        if (!res.ok) throw new Error("Failed to fetch gallery");

        const data = await res.json();
        if (Array.isArray(data)) setItems(data);

        setError(null);
      } catch (err) {
        console.error("Gallery fetch error:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch gallery");
        setItems(cachedGallery); // fallback
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
      formData.append("image", file); // backend should read: req.file

      const res = await fetch("http://localhost:5000/api/gallery/uploads", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const saved = await res.json();

      // ✅ instantly update UI
      setItems((prev) => [saved, ...prev]);

      // reset form
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading gallery...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Outlet />

      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 max-w-6xl mx-auto mt-12">
          <p className="text-yellow-700"> {error} - Showing cached gallery</p>
        </div>
      )}

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">
            Alumni Gallery
          </h1>

          {/* ✅ Upload Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-10">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Upload Photo (Admin/User)
            </h2>

            <form
              onSubmit={handleUpload}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Photo title (required)"
                className="border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="text"
                value={uploadedBy}
                onChange={(e) => setUploadedBy(e.target.value)}
                placeholder="Uploaded by (optional)"
                className="border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="border rounded px-3 py-2"
              />

              <button
                type="submit"
                disabled={uploading}
                className="md:col-span-3 bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 disabled:opacity-60"
              >
                {uploading ? "Uploading..." : "Upload to Gallery"}
              </button>
            </form>

            <p className="text-gray-500 text-sm mt-3">
              Note: Image is stored in storage (cloud/server) and DB stores only
              the image URL + details.
            </p>
          </div>

          {/* ✅ Gallery Grid */}
          {sortedItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                No photos available at the moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <button
                    type="button"
                    onClick={() => setSelected(item)}
                    className="w-full"
                    title="View"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-52 object-cover"
                    />
                  </button>

                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-800">
                      {item.title}
                    </h3>
                    <div className="text-sm text-gray-500 mt-1 space-y-1">
                      {item.uploadedBy && <p> {item.uploadedBy}</p>}
                      {item.createdAt && (
                        <p>
                          {" "}
                          {new Date(item.createdAt).toLocaleString("en-IN")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ✅ Simple Modal */}
        {selected && (
          <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
            onClick={() => setSelected(null)}
          >
            <div
              className="bg-white rounded-lg max-w-3xl w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-bold text-gray-800">{selected.title}</h3>
                <button
                  onClick={() => setSelected(null)}
                  className="text-gray-600 hover:text-gray-900 font-bold"
                >
                  ✖
                </button>
              </div>
              <img
                src={selected.imageUrl}
                alt={selected.title}
                className="w-full max-h-[75vh] object-contain bg-black"
              />
              <div className="p-4 text-sm text-gray-600">
                {selected.uploadedBy && <p>Uploaded by: {selected.uploadedBy}</p>}
                {selected.createdAt && (
                  <p>Date: {new Date(selected.createdAt).toLocaleString("en-IN")}</p>
                )}
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

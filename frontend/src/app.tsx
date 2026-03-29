import { Outlet, useNavigate } from "react-router-dom";
import Popup from "./Pages/Popup";
import collegeimage from "./assets/Collge_Front.jpeg";
import { useState, useEffect } from "react";
import { alumniEvents } from "./Pages/Events";
import Footer from "./Pages/Footer";

type GalleryItem = {
  id: number | string;
  title: string;
  imageUrl: string;
  createdAt?: string;
};

const App = () => {
  const [popupOpen, setPopupOpen] = useState(true);
  const [appLoading, setAppLoading] = useState(true);

  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [galleryError, setGalleryError] = useState<string | null>(null);

  const navigate = useNavigate();

  // App loading
  useEffect(() => {
    const loadingTimer = setTimeout(() => setAppLoading(false), 1500);
    return () => clearTimeout(loadingTimer);
  }, []);

  // Popup auto close
  useEffect(() => {
    const timer = setTimeout(() => setPopupOpen(false), 1000000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch gallery from backend
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setGalleryLoading(true);
        const res = await fetch("http://localhost:8000/api/gallery");
        if (!res.ok) throw new Error("Failed to fetch gallery");

        const data = await res.json();
        setGallery(Array.isArray(data) ? data : []);
        setGalleryError(null);
      } catch (err) {
        setGalleryError("Gallery not available");
        setGallery([]);
      } finally {
        setGalleryLoading(false);
      }
    };

    fetchGallery();
  }, []);

  const handleClose = () => setPopupOpen(false);

  // Full page loading
  if (appLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
        <p className="mt-4 text-gray-600 font-semibold">
          Loading SRIT Alumni Website...
        </p>
      </div>
    );
  }

  return (
    <>
      <main className="flex flex-col min-h-screen">
        <Popup open={popupOpen} onClose={handleClose} />

        <div className="flex-1">
          <Outlet />

          {/* ================= HERO SECTION ================= */}
          <div className="relative w-full overflow-hidden h-[70vh] md:h-[60vh]">
            <img
              src={collegeimage}
              alt="College front"
              className="w-full h-full brightness-75 object-cover"
              style={{ objectPosition: "50% 25%" }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
              <h1 className="text-3xl md:text-5xl font-bold drop-shadow-lg">
                Welcome to SRIT Alumni Website
              </h1>
              <p className="mt-2 max-w-xl drop-shadow">
                We’re thrilled to reconnect with our alumni community. Explore,
                engage, and stay connected with the latest events and memories.
              </p>

              <div className="mt-4 flex gap-4">
                <button
                  className="px-6 py-2 bg-white text-blue-600 font-semibold rounded shadow hover:bg-gray-100"
                  onClick={() => navigate("/login")}
                >
                  Login
                </button>
                <button
                  className="px-6 py-2 bg-blue-600 text-white font-semibold rounded shadow hover:bg-blue-700"
                  onClick={() => navigate("/login")}
                >
                  Register
                </button>
              </div>
            </div>
          </div>

          {/* ================= RECENT EVENTS ================= */}
          <div className="mt-5 w-full bg-linear-to-br from-blue-50 to-blue-100 py-12">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-8 text-blue-800">
                Recent Alumni Events
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {alumniEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition hover:scale-105"
                  >
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-blue-600 mb-2">
                        {event.title}
                      </h3>

                      <p className="text-gray-600 text-sm mb-1">
                        📅 {event.date}
                      </p>
                      <p className="text-gray-600 text-sm mb-1">
                        📍 {event.location}
                      </p>

                      <p className="text-gray-700 text-sm mb-4">
                        {event.purpose}
                      </p>

                      <button
                        onClick={() => navigate("/events")}
                        className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-8">
                <button
                  onClick={() => navigate("/events")}
                  className="px-6 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
                >
                  View All Events
                </button>
              </div>
            </div>
          </div>

          {/* ================= RECENT GALLERY ================= */}
          <div className="mt-5 w-full bg-linear-to-br from-green-50 to-green-100 py-12">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-8 text-green-800">
                Gallery
              </h2>

              {galleryLoading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-green-700"></div>
                </div>
              ) : galleryError ? (
                <p className="text-center text-gray-600">
                  {galleryError}
                </p>
              ) : gallery.length === 0 ? (
                <p className="text-center text-gray-600">
                  No photos uploaded yet.
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gallery.slice(0, 3).map((photo) => (
                      <div
                        key={photo.id}
                        className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition hover:scale-105"
                      >
                        <img
                          src={photo.imageUrl}
                          alt={photo.title}
                          className="w-full h-40 object-cover"
                        />
                        <div className="p-6">
                          <h3 className="text-lg font-bold text-green-700 mb-2">
                            {photo.title}
                          </h3>

                          {photo.createdAt && (
                            <p className="text-gray-600 text-sm mb-4">
                              🕒{" "}
                              {new Date(
                                photo.createdAt
                              ).toLocaleDateString("en-IN")}
                            </p>
                          )}

                          <button
                            onClick={() => navigate("/gallery")}
                            className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-center mt-8">
                    <button
                      onClick={() => navigate("/gallery")}
                      className="px-6 py-2 bg-green-700 text-white font-semibold rounded hover:bg-green-800 transition"
                    >
                      View Full Gallery
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default App;

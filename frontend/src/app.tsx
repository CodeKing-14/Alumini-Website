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
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
        <p className="mt-4 text-slate-600 font-semibold animate-pulse">
          Loading SRIT Alumni Website...
        </p>
      </div>
    );
  }

  return (
    <>
      <main className="flex flex-col min-h-screen bg-slate-50">
        <Popup open={popupOpen} onClose={handleClose} />

        <div className="flex-1">
          <Outlet />

          {/* ================= HERO SECTION ================= */}
          <div className="relative w-full overflow-hidden h-[80vh] min-h-[500px]">
            <img
              src={collegeimage}
              alt="College front"
              className="w-full h-full object-cover"
              style={{ objectPosition: "50% 25%" }}
            />
            {/* Premium Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900/90 flex flex-col items-center justify-center text-center px-4">
              <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-100 text-sm font-medium mb-2">
                  Welcome to our global community
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight drop-shadow-xl">
                  SRIT Alumni <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Network</span>
                </h1>
                <p className="mt-4 text-lg md:text-xl text-slate-200 max-w-2xl mx-auto drop-shadow-md leading-relaxed">
                  Reconnect, engage, and grow with thousands of graduates. Explore events, share memories, and support our lifelong bond.
                </p>

                <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button
                    className="btn-gradient px-8 py-3.5 rounded-full text-lg font-semibold w-full sm:w-auto"
                    onClick={() => navigate("/login")}
                  >
                    Join the Network
                  </button>
                  <button
                    className="px-8 py-3.5 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-full hover:bg-white/20 transition-all duration-300 w-full sm:w-auto"
                    onClick={() => navigate("/login")}
                  >
                    Member Login
                  </button>
                </div>
              </div>
            </div>
            
            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce text-white/70">
              <span className="text-xs font-semibold uppercase tracking-widest mb-2">Scroll</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
            </div>
          </div>

          {/* ================= RECENT EVENTS ================= */}
          <div className="w-full bg-white relative py-20">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Upcoming <span className="text-blue-600">Events</span>
                </h2>
                <div className="mt-4 w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full"></div>
                <p className="mt-4 text-slate-500 max-w-2xl mx-auto text-lg">
                  Don't miss out on our latest gatherings, workshops, and reunions.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {alumniEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover-lift overflow-hidden flex flex-col"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-blue-700 text-xs font-bold rounded-full shadow-sm">
                          {event.date}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {event.title}
                      </h3>
                      
                      <div className="flex items-center text-slate-500 text-sm mb-4">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        {event.location}
                      </div>

                      <p className="text-slate-600 text-sm mb-6 flex-1 pl-3 border-l-2 border-slate-200">
                        {event.purpose}
                      </p>

                      <button
                        onClick={() => navigate("/events")}
                        className="w-full px-4 py-2.5 bg-slate-50 text-blue-700 font-semibold rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300 text-sm"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-12">
                <button
                  onClick={() => navigate("/events")}
                  className="px-8 py-3 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-full hover:border-blue-600 hover:text-blue-600 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  View All Events
                </button>
              </div>
            </div>
          </div>

          {/* ================= RECENT GALLERY ================= */}
          <div className="w-full bg-slate-50 py-20 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-y-1/3 -translate-x-1/4"></div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Memories <span className="text-indigo-600">Gallery</span>
                </h2>
                <div className="mt-4 w-24 h-1 bg-gradient-to-r from-indigo-600 to-blue-500 mx-auto rounded-full"></div>
                <p className="mt-4 text-slate-500 max-w-2xl mx-auto text-lg">
                  Relive the best moments captured across various alumni gatherings.
                </p>
              </div>

              {galleryLoading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
                </div>
              ) : galleryError ? (
                <p className="text-center text-slate-500 font-medium bg-white p-6 rounded-2xl shadow-sm max-w-lg mx-auto border border-slate-100">
                  {galleryError}
                </p>
              ) : gallery.length === 0 ? (
                <p className="text-center text-slate-500 font-medium bg-white p-6 rounded-2xl shadow-sm max-w-lg mx-auto border border-slate-100">
                  No photos uploaded yet.
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gallery.slice(0, 3).map((photo) => (
                      <div
                        key={photo.id}
                        className="group relative rounded-2xl overflow-hidden shadow-sm hover-lift cursor-pointer aspect-[4/3] bg-slate-200"
                        onClick={() => navigate("/gallery")}
                      >
                        <img
                          src={photo.imageUrl}
                          alt={photo.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                          <h3 className="text-xl font-bold text-white mb-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            {photo.title}
                          </h3>
                          {photo.createdAt && (
                            <p className="text-indigo-200 text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                              {new Date(photo.createdAt).toLocaleDateString("en-IN", { year: 'numeric', month: 'short', day: 'numeric' })}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-center mt-12">
                    <button
                      onClick={() => navigate("/gallery")}
                      className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
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

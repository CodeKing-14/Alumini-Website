import { Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Footer from "./Footer";

export const alumniEvents = [
  {
    id: 1,
    title: "Alumni Reunion 2024",
    date: "March 15, 2024",
    location: "SRIT Campus",
    eventType: "Offline",
    purpose: "Annual gathering of alumni from all batches to celebrate and network.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
    description: "Annual gathering of alumni from all batches.",
  },
  {
    id: 2,
    title: "Career Development Workshop",
    date: "March 22, 2024",
    location: "Online",
    eventType: "Online",
    purpose: "Workshop on professional development and career growth strategies.",
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop",
    description: "Workshop on professional development and career growth.",
  },
  {
    id: 3,
    title: "Cultural Night 2024",
    date: "March 29, 2024",
    location: "SRIT Auditorium",
    eventType: "Offline",
    purpose: "Celebrate culture with fellow alumni through performances and entertainment.",
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop",
    description: "Celebrate culture with fellow alumni through performances.",
  },
  {
    id: 4,
    title: "Tech Seminar: AI & ML",
    date: "April 5, 2024",
    location: "SRIT Campus",
    eventType: "Offline",
    purpose: "Industry experts discussing latest trends in AI and Machine Learning.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop",
    description: "Industry experts discussing latest trends in AI and Machine Learning.",
  },
  {
    id: 5,
    title: "Charity Drive",
    date: "April 12, 2024",
    location: "Local Community",
    eventType: "Offline",
    purpose: "Alumni contribution to community welfare and social responsibility programs.",
    image: "https://images.unsplash.com/photo-1559027615-cd2628902d4a?w=800&h=600&fit=crop",
    description: "Alumni contribution to community welfare programs.",
  },
  {
    id: 6,
    title: "Sports Day",
    date: "April 19, 2024",
    location: "SRIT Sports Complex",
    eventType: "Offline",
    purpose: "Friendly sports competition among alumni batches to promote fitness and camaraderie.",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=600&fit=crop",
    description: "Friendly sports competition among alumni batches.",
  },
];

const FALLBACK_IMAGE = alumniEvents[0].image;

type NormalizedEvent = {
  id: number | string;
  title: string;
  date: string;
  location: string;
  eventType: string;
  purpose: string;
  image: string;
  images: string[];
  description?: string;
};

function normalizeEvent(raw: any): NormalizedEvent {
  const images: string[] =
    Array.isArray(raw.images) && raw.images.length > 0
      ? raw.images
      : raw.image
      ? [raw.image]
      : [FALLBACK_IMAGE];
  return {
    id: raw.id,
    title: raw.title || "Untitled Event",
    date: raw.date || "TBA",
    location: raw.location || "TBA",
    eventType: raw.eventType || "Offline",
    purpose: raw.purpose || raw.description || "Alumni event",
    image: raw.image || images[0] || FALLBACK_IMAGE,
    images,
    description: raw.description,
  };
}

function DateBadge({ date }: { date: string }) {
  const parsed = new Date(date);
  if (!isNaN(parsed.getTime())) {
    const month = parsed.toLocaleString("en-US", { month: "short" }).toUpperCase();
    const day = parsed.getDate();
    return (
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-slate-900 px-3 py-1.5 rounded-lg shadow-sm text-center min-w-[3.5rem]">
        <span className="block text-xs font-bold text-blue-600 uppercase">{month}</span>
        <span className="block text-lg font-black leading-none">{day}</span>
      </div>
    );
  }
  return (
    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-slate-900 px-3 py-1.5 rounded-lg shadow-sm text-center max-w-[8rem]">
      <span className="block text-xs font-bold text-blue-600 uppercase line-clamp-2">{date}</span>
    </div>
  );
}

function EventImageCarousel({ images, title }: { images: string[]; title: string }) {
  const [index, setIndex] = useState(0);
  const safeImages = images.length > 0 ? images : [FALLBACK_IMAGE];
  const current = safeImages[Math.min(index, safeImages.length - 1)];

  return (
    <>
      <img
        src={current}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      {safeImages.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => (i - 1 + safeImages.length) % safeImages.length);
            }}
            title="Previous photo"
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center text-sm z-10"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => (i + 1) % safeImages.length);
            }}
            title="Next photo"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center text-sm z-10"
          >
            ›
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {safeImages.map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${i === index ? "bg-white" : "bg-white/50"}`}
              ></span>
            ))}
          </div>
          <span className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10">
            {index + 1}/{safeImages.length}
          </span>
        </>
      )}
    </>
  );
}

const Events = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isAdmin, setIsAdmin] = useState(false);
  const [events, setEvents] = useState<NormalizedEvent[]>(alumniEvents.map(normalizeEvent));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [eventForm, setEventForm] = useState({
    title: "",
    date: "",
    location: "",
    description: "",
    eventType: "Offline",
  });
  const [eventImages, setEventImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [savingEvent, setSavingEvent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const token = localStorage.getItem("token");
      setIsAdmin(!!token && user?.role === "admin");
    } catch {
      setIsAdmin(false);
    }
  }, []);

  // Sync image previews
  useEffect(() => {
    if (eventImages.length === 0) {
      setImagePreviews([]);
      return;
    }
    const urls = eventImages.map((file) => URL.createObjectURL(file));
    setImagePreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [eventImages]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/events");

      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }

      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setEvents(data.map(normalizeEvent));
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch events");
      setEvents(alumniEvents.map(normalizeEvent));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setFormError("Admin login required to add events. Please log in as Admin.");
      navigate("/login");
      return;
    }

    try {
      setSavingEvent(true);

      const formData = new FormData();
      formData.append("title", eventForm.title.trim());
      formData.append("date", eventForm.date.trim());
      formData.append("location", eventForm.location.trim());
      formData.append("description", eventForm.description.trim());
      formData.append("eventType", eventForm.eventType);
      eventImages.forEach((file) => formData.append("images", file));

      const response = await fetch("/api/events", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        if (response.status === 401 || response.status === 403) {
          throw new Error("Admin session expired or access denied. Please log in again.");
        }
        throw new Error(body.detail || "Could not create event. Please check image formats.");
      }

      const saved = await response.json();
      setEvents((current) => [normalizeEvent(saved), ...current]);
      setEventForm({ title: "", date: "", location: "", description: "", eventType: "Offline" });
      setEventImages([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setSuccessMsg("Event created and photos uploaded successfully!");
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not create event");
    } finally {
      setSavingEvent(false);
    }
  };

  const handleDeleteEvent = async (id: number | string) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in as Admin to delete events.");
        return;
      }
      const response = await fetch(`/api/events/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok && response.status !== 204) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("Admin session expired. Please log in again.");
        }
        throw new Error("Could not delete event");
      }
      setEvents((current) => current.filter((ev) => ev.id !== id));
      setSuccessMsg("Event deleted successfully.");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not delete event");
    }
  };

  if (loading) {
    return (
      <>
        <Outlet />
        <div className="min-h-screen bg-slate-50 py-20 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mb-4"></div>
          <p className="text-slate-600 font-semibold animate-pulse text-lg">Loading events...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Outlet />

      {/* PAGE HEADER */}
      <div className="bg-slate-900 pt-16 pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/20 rounded-full filter blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Alumni <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Events</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Discover upcoming reunions, workshops, and networking opportunities. Reconnect with your batchmates and the SRIT community.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="max-w-5xl mx-auto mt-8 px-4">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-xl flex items-center gap-3 shadow-sm animate-in fade-in">
            <svg className="w-6 h-6 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span className="font-semibold text-sm">{successMsg}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-5xl mx-auto mt-8 px-4">
          <div className="bg-orange-50 border border-orange-200 text-orange-800 px-6 py-4 rounded-xl flex items-center gap-3 shadow-sm">
            <svg className="w-6 h-6 text-orange-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <span className="font-medium text-sm">Showing cached events: {error}</span>
          </div>
        </div>
      )}

      {/* EVENTS GRID */}
      <div className="min-h-screen bg-slate-50 py-12 -mt-12 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Admin Event Creation Card */}
          {isAdmin && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8 mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Add New Event</h2>
                  <p className="text-xs text-slate-500">Publish a new event and attach event photos.</p>
                </div>
              </div>

              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Event Title *</label>
                    <input
                      required
                      value={eventForm.title}
                      onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                      placeholder="e.g. Annual Alumni Meet 2024"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Event Date *</label>
                    <input
                      required
                      type="text"
                      value={eventForm.date}
                      onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                      placeholder="e.g. March 15, 2024"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Location *</label>
                    <input
                      required
                      value={eventForm.location}
                      onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                      placeholder="e.g. SRIT Campus / Zoom"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Event Type</label>
                    <select
                      value={eventForm.eventType}
                      onChange={(e) => setEventForm({ ...eventForm, eventType: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="Offline">Offline</option>
                      <option value="Online">Online</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Purpose</label>
                    <input
                      value={eventForm.description}
                      onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                      placeholder="e.g. Annual gathering of alumni from all batches to celebrate and network."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Event Photos (Optional)</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => setEventImages(Array.from(e.target.files || []))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Previews */}
                {imagePreviews.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-600 mb-2">
                      {eventImages.length} Photo{eventImages.length > 1 ? "s" : ""} Attached:
                    </p>
                    <div className="flex flex-wrap gap-3 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-xl">
                      {imagePreviews.map((preview, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 shadow-xs">
                          <img src={preview} alt={`preview ${i}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              const newFiles = eventImages.filter((_, idx) => idx !== i);
                              setEventImages(newFiles);
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

                {formError && (
                  <p className="text-sm text-red-600 font-medium bg-red-50 p-3 rounded-xl border border-red-100">
                    {formError}
                  </p>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    disabled={savingEvent}
                    type="submit"
                    className="btn-gradient px-8 py-3 rounded-xl font-bold text-sm disabled:opacity-60 flex items-center gap-2"
                  >
                    {savingEvent ? (
                      <>
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                        Saving Event...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        Publish Event
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {events.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center max-w-2xl mx-auto mt-12">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🗓️</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">No Events Found</h3>
              <p className="text-slate-500">There are currently no upcoming events scheduled. Please check back later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover-lift overflow-hidden flex flex-col"
                >
                  {/* Image Section */}
                  <div className="relative h-56 overflow-hidden bg-slate-200">
                    <EventImageCarousel images={event.images} title={event.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60 pointer-events-none"></div>

                    <DateBadge date={event.date} />

                    {/* Event Type Pill */}
                    <div className="absolute bottom-4 left-4">
                      <span
                        className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm flex items-center gap-1.5 ${
                          event.eventType === "Online"
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            : "bg-blue-100 text-blue-700 border border-blue-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            event.eventType === "Online" ? "bg-emerald-500" : "bg-blue-500"
                          }`}
                        ></span>
                        {event.eventType}
                      </span>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        title="Delete event"
                        className="absolute top-4 left-4 w-8 h-8 bg-red-600/90 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-sm transition-colors text-sm font-bold"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h2 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {event.title}
                    </h2>

                    <div className="space-y-3 mb-6 flex-1">
                      <div className="flex items-start text-slate-600 text-sm">
                        <svg className="w-5 h-5 mr-3 text-slate-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        <span className="font-medium">{event.location}</span>
                      </div>

                      <div className="flex items-start text-slate-600 text-sm">
                        <svg className="w-5 h-5 mr-3 text-slate-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span className="line-clamp-3 leading-relaxed">{event.purpose}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Events;

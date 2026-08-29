import { Outlet } from "react-router-dom"
import { useState, useEffect } from "react"
import Footer from "./Footer"

export const alumniEvents = [
  {
    id: 1,
    title: "Alumni Reunion 2024",
    date: "March 15, 2024",
    location: "SRIT Campus",
    eventType: "Offline",
    purpose: "Annual gathering of alumni from all batches to celebrate and network.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
    description: "Annual gathering of alumni from all batches."
  },
  {
    id: 2,
    title: "Career Development Workshop",
    date: "March 22, 2024",
    location: "Online",
    eventType: "Online",
    purpose: "Workshop on professional development and career growth strategies.",
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop",
    description: "Workshop on professional development and career growth."
  },
  {
    id: 3,
    title: "Cultural Night 2024",
    date: "March 29, 2024",
    location: "SRIT Auditorium",
    eventType: "Offline",
    purpose: "Celebrate culture with fellow alumni through performances and entertainment.",
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop",
    description: "Celebrate culture with fellow alumni through performances."
  },
  {
    id: 4,
    title: "Tech Seminar: AI & ML",
    date: "April 5, 2024",
    location: "SRIT Campus",
    eventType: "Offline",
    purpose: "Industry experts discussing latest trends in AI and Machine Learning.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop",
    description: "Industry experts discussing latest trends in AI and Machine Learning."
  },
  {
    id: 5,
    title: "Charity Drive",
    date: "April 12, 2024",
    location: "Local Community",
    eventType: "Offline",
    purpose: "Alumni contribution to community welfare and social responsibility programs.",
    image: "https://images.unsplash.com/photo-1559027615-cd2628902d4a?w=800&h=600&fit=crop",
    description: "Alumni contribution to community welfare programs."
  },
  {
    id: 6,
    title: "Sports Day",
    date: "April 19, 2024",
    location: "SRIT Sports Complex",
    eventType: "Offline",
    purpose: "Friendly sports competition among alumni batches to promote fitness and camaraderie.",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=600&fit=crop",
    description: "Friendly sports competition among alumni batches."
  },
]

const FALLBACK_IMAGE = alumniEvents[0].image;

type NormalizedEvent = {
  id: number | string;
  title: string;
  date: string;
  location: string;
  eventType: string;
  purpose: string;
  image: string;
  description?: string;
};

// Backend events only carry {id,title,description,date,location,eventType,image}.
// This fills in the extra display fields the card UI expects and never
// assumes a particular date format, so it can't crash on odd input.
function normalizeEvent(raw: any): NormalizedEvent {
  return {
    id: raw.id,
    title: raw.title || "Untitled Event",
    date: raw.date || "TBA",
    location: raw.location || "TBA",
    eventType: raw.eventType || "Offline",
    purpose: raw.purpose || raw.description || "Alumni event",
    image: raw.image || FALLBACK_IMAGE,
    description: raw.description,
  };
}

// Renders a small "month / day" badge from whatever date string we got.
// Never throws — falls back to just showing the raw text if it can't parse.
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

const Events = () => {
  const isAdmin = JSON.parse(localStorage.getItem("user") || "null")?.role === "admin";
  const [events, setEvents] = useState<NormalizedEvent[]>(alumniEvents.map(normalizeEvent));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState({ title: "", date: "", location: "", description: "", eventType: "Offline" });
  const [eventImage, setEventImage] = useState<File | null>(null);
  const [savingEvent, setSavingEvent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleCreateEvent = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setSavingEvent(true);
      setFormError(null);
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("title", eventForm.title);
      formData.append("date", eventForm.date);
      formData.append("location", eventForm.location);
      formData.append("description", eventForm.description);
      formData.append("eventType", eventForm.eventType);
      if (eventImage) formData.append("image", eventImage);

      const response = await fetch("/api/events", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.detail || "Could not create event");
      }

      const saved = await response.json();
      setEvents((current) => [normalizeEvent(saved), ...current]);
      setEventForm({ title: "", date: "", location: "", description: "", eventType: "Offline" });
      setEventImage(null);
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
      const response = await fetch(`/api/events/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok && response.status !== 204) throw new Error("Could not delete event");
      setEvents((current) => current.filter((ev) => ev.id !== id));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not delete event");
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/events');

        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }

        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setEvents(data.map(normalizeEvent));
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch events');
        setEvents(alumniEvents.map(normalizeEvent));
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

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
        {/* Glow Effects */}
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

      {error && (
        <div className="max-w-5xl mx-auto mt-8 px-4">
          <div className="bg-orange-50 border border-orange-200 text-orange-800 px-6 py-4 rounded-xl flex items-center gap-3 shadow-sm">
            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <span className="font-medium text-sm">Showing cached events: {error}</span>
          </div>
        </div>
      )}

      {/* EVENTS GRID */}
      <div className="min-h-screen bg-slate-50 py-12 -mt-12 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {isAdmin && (
            <form onSubmit={handleCreateEvent} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-10 grid grid-cols-1 md:grid-cols-3 gap-4">
              <input required value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} placeholder="Event title" className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
              <input required type="text" value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} placeholder="Date (e.g. March 15, 2024)" className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
              <input required value={eventForm.location} onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })} placeholder="Location" className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
              <input value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} placeholder="Description" className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
              <select value={eventForm.eventType} onChange={(e) => setEventForm({ ...eventForm, eventType: e.target.value })} className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                <option value="Offline">Offline</option>
                <option value="Online">Online</option>
              </select>
              <input type="file" accept="image/*" onChange={(e) => setEventImage(e.target.files?.[0] || null)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer" />
              {formError && <p className="md:col-span-3 text-sm text-red-600 font-medium">{formError}</p>}
              <button disabled={savingEvent} type="submit" className="md:col-span-3 btn-gradient py-3 rounded-xl font-bold disabled:opacity-60">{savingEvent ? "Saving..." : "Add Event"}</button>
            </form>
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
                <div key={event.id} className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover-lift overflow-hidden flex flex-col">
                  {/* Image Section */}
                  <div className="relative h-56 overflow-hidden bg-slate-200">
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60"></div>

                    <DateBadge date={event.date} />

                    {/* Event Type Pill */}
                    <div className="absolute bottom-4 left-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm flex items-center gap-1.5 ${event.eventType === 'Online'
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-blue-100 text-blue-700 border border-blue-200'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${event.eventType === 'Online' ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
                        {event.eventType}
                      </span>
                    </div>

                    {isAdmin && typeof event.id === "number" && (
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        title="Delete event"
                        className="absolute top-4 left-4 w-8 h-8 bg-red-600/90 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-sm transition-colors"
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
                        <svg className="w-5 h-5 mr-3 text-slate-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        <span className="font-medium">{event.location}</span>
                      </div>

                      <div className="flex items-start text-slate-600 text-sm">
                        <svg className="w-5 h-5 mr-3 text-slate-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
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
  )
}

export default Events

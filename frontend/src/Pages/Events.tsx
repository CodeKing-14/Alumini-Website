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

const Events = () => {
  const [events, setEvents] = useState(alumniEvents);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/api/events');

        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }

        const data = await response.json();
        if (data && data.length > 0) {
          setEvents(data);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch events');
        setEvents(alumniEvents);
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

                    {/* Date Badge */}
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-slate-900 px-3 py-1.5 rounded-lg shadow-sm text-center min-w-[3.5rem]">
                      <span className="block text-xs font-bold text-blue-600 uppercase">{event.date.split(' ')[0]}</span>
                      <span className="block text-lg font-black leading-none">{event.date.split(' ')[1].replace(',', '')}</span>
                    </div>

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

                    <button className="w-full py-3 bg-slate-50 text-indigo-600 font-semibold rounded-xl border border-slate-100 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-300 text-sm shadow-sm group-hover:shadow-md">
                      Register Now
                    </button>
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
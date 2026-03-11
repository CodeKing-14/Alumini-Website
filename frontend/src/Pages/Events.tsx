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
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop",
    description: "Annual gathering of alumni from all batches."
  },
  {
    id: 2,
    title: "Career Development Workshop",
    date: "March 22, 2024",
    location: "Online",
    eventType: "Online",
    purpose: "Workshop on professional development and career growth strategies.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop",
    description: "Workshop on professional development and career growth."
  },
  {
    id: 3,
    title: "Cultural Night 2024",
    date: "March 29, 2024",
    location: "SRIT Auditorium",
    eventType: "Offline",
    purpose: "Celebrate culture with fellow alumni through performances and entertainment.",
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=500&h=300&fit=crop",
    description: "Celebrate culture with fellow alumni through performances."
  },
  {
    id: 4,
    title: "Tech Seminar: AI & ML",
    date: "April 5, 2024",
    location: "SRIT Campus",
    eventType: "Offline",
    purpose: "Industry experts discussing latest trends in AI and Machine Learning.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop",
    description: "Industry experts discussing latest trends in AI and Machine Learning."
  },
  {
    id: 5,
    title: "Charity Drive",
    date: "April 12, 2024",
    location: "Local Community",
    eventType: "Offline",
    purpose: "Alumni contribution to community welfare and social responsibility programs.",
    image: "https://images.unsplash.com/photo-1559027615-cd2628902d4a?w=500&h=300&fit=crop",
    description: "Alumni contribution to community welfare programs."
  },
  {
    id: 6,
    title: "Sports Day",
    date: "April 19, 2024",
    location: "SRIT Sports Complex",
    eventType: "Offline",
    purpose: "Friendly sports competition among alumni batches to promote fitness and camaraderie.",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&h=300&fit=crop",
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
        // Replace with your actual backend API endpoint
        const response = await fetch('http://localhost:5000/api/events'); // Update with your API URL
        
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
        // Keep default events if fetch fails
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
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-12 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading events...</p>
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
            <p className="text-yellow-700"> {error} - Showing cached events</p>
          </div>
        )}
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-12">
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">Alumni Events</h1>
            {events.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No events available at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <div key={event.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    <img src={event.image} alt={event.title} className="w-full h-48 object-cover" />
                    <div className="p-6">
                      <h2 className="text-xl font-bold text-blue-600 mb-2">{event.title}</h2>
                      <div className="space-y-2 mb-4">
                        <p className="text-gray-600 flex items-center text-sm">
                          <span className="mr-2">📅</span> {event.date}
                        </p>
                        <p className="text-gray-600 flex items-center text-sm">
                          <span className="mr-2">📍</span> {event.location}
                        </p>
                        <p className={`text-sm font-semibold flex items-center ${
                          event.eventType === 'Online' ? 'text-green-600' : 'text-blue-600'
                        }`}>
                          <span className="mr-2">{event.eventType === 'Online' ? '🌐' : '🏢'}</span> {event.eventType}
                        </p>
                      </div>
                      <p className="text-gray-700 text-sm font-semibold mb-2">Purpose:</p>
                      <p className="text-gray-600 text-sm">{event.purpose}</p>
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
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Outlet } from "react-router-dom";
import Footer from "./Footer";

type EventPhoto = {
    id: number;
    event_id: number;
    image_url: string;
    uploaded_at: string;
};

type EventDetail = {
    id: number;
    title: string;
    description?: string;
    date: string;
    location: string;
    created_at?: string;
    photos?: EventPhoto[];
};

const EventDetail: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    const [event, setEvent] = useState<EventDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPhoto, setSelectedPhoto] = useState<EventPhoto | null>(null);
    const [uploading, setUploading] = useState(false);
    const isAdmin = JSON.parse(localStorage.getItem("user") || "null")?.role === "admin";

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/events/${eventId}`);
                if (!response.ok) throw new Error("Failed to fetch event details");

                const data = await response.json();
                setEvent(data);
                setError(null);
            } catch (err) {
                console.error("Error fetching event:", err);
                setError(err instanceof Error ? err.message : "Failed to load event");
            } finally {
                setLoading(false);
            }
        };

        if (eventId) fetchEvent();
    }, [eventId]);

    const handlePhotoUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const file = formData.get("photo") as File;

        if (!file) {
            alert("Please select a photo");
            return;
        }

        try {
            setUploading(true);
            const uploadFormData = new FormData();
            uploadFormData.append("photo", file);

            const response = await fetch(`/api/events/${eventId}/photos`, {
                method: "POST",
                headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
                body: uploadFormData,
            });

            if (!response.ok) throw new Error("Upload failed");

            const newPhoto = await response.json();
            setEvent((prev) =>
                prev ? { ...prev, photos: [...(prev.photos || []), newPhoto] } : null
            );

            (e.target as HTMLFormElement).reset();
        } catch (err) {
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
                        <p className="text-slate-600 font-semibold text-lg animate-pulse">Loading event details...</p>
                    </div>
                </div>
            </>
        );
    }

    if (!event) {
        return (
            <>
                <Outlet />
                <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                    <div className="text-center max-w-md">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Event Not Found</h2>
                        <p className="text-slate-600 mb-6">This event could not be loaded.</p>
                        <button
                            onClick={() => navigate("/events")}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                        >
                            Back to Events
                        </button>
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
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/20 rounded-full filter blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                    <button
                        onClick={() => navigate("/events")}
                        className="flex items-center gap-2 text-slate-300 hover:text-white mb-6 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Events
                    </button>

                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
                        {event.title}
                    </h1>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                        {/* Date */}
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500/30 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-300 font-medium">Date</p>
                                    <p className="text-white font-semibold">{event.date}</p>
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-500/30 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-300 font-medium">Location</p>
                                    <p className="text-white font-semibold">{event.location}</p>
                                </div>
                            </div>
                        </div>

                        {/* Photos Count */}
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-500/30 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-300 font-medium">Photos</p>
                                    <p className="text-white font-semibold">{event.photos?.length || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="min-h-screen bg-slate-50 py-12 -mt-12 relative z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    {error && (
                        <div className="bg-orange-50 border border-orange-200 text-orange-800 px-6 py-4 rounded-xl mb-8 flex items-center gap-3">
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Description */}
                    {event.description && (
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 mb-12">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">About this Event</h2>
                            <p className="text-slate-600 leading-relaxed text-lg">{event.description}</p>
                        </div>
                    )}

                    {/* Upload Section (Admin Only) */}
                    {isAdmin && (
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 mb-12">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Add Photos to Event</h3>
                                    <p className="text-xs text-slate-500">Upload multiple photos for this event</p>
                                </div>
                            </div>

                            <form onSubmit={handlePhotoUpload} className="flex gap-4 items-end">
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        name="photo"
                                        accept="image/*"
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-colors whitespace-nowrap"
                                >
                                    {uploading ? "Uploading..." : "Upload Photo"}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Photos Gallery */}
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-8">
                            Event Photos ({event.photos?.length || 0})
                        </h2>

                        {!event.photos || event.photos.length === 0 ? (
                            <div className="glass rounded-2xl p-12 text-center">
                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <span className="text-4xl">📸</span>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">No Photos Yet</h3>
                                <p className="text-slate-500">Photos for this event will appear here once uploaded.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {event.photos.map((photo) => (
                                    <div
                                        key={photo.id}
                                        className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover-lift cursor-pointer"
                                        onClick={() => setSelectedPhoto(photo)}
                                    >
                                        <div className="relative h-64 overflow-hidden bg-slate-200">
                                            <img
                                                src={`${photo.image_url}`}
                                                alt={`Event photo ${photo.id}`}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Photo Modal */}
            {selectedPhoto && (
                <div
                    className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <div className="relative max-w-4xl w-full max-h-96 bg-white rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setSelectedPhoto(null)}
                            className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-slate-900 hover:bg-white transition-colors z-10"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <img
                            src={`${selectedPhoto.image_url}`}
                            alt="Event photo"
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
};

export default EventDetail;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getProfile,
  updateProfile,
  uploadPhoto,
  getRegisteredEvents,
  logout,
  deleteAccount,
} from "../services/api";

import type { AlumniProfile, RegisteredEvent } from "../services/api";

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<AlumniProfile | null>(null);
  const [events, setEvents] = useState<RegisteredEvent[]>([]);
  const [form, setForm] = useState<Partial<AlumniProfile>>({});
  const [message, setMessage] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const user = await getProfile();
        const ev = await getRegisteredEvents();
        setProfile(user);
        setForm(user);
        setEvents(ev);

        // Keep localStorage user role synced
        if (user && user.role) {
          try {
            const currentStored = JSON.parse(localStorage.getItem("user") || "{}");
            localStorage.setItem("user", JSON.stringify({ ...currentStored, ...user }));
          } catch {
            // ignore
          }
        }
      } catch (err) {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await updateProfile(form);
      setProfile(updated);

      setMessage("Profile Updated Successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setError("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setPhotoUploading(true);
      const result = await uploadPhoto(file);

      if (profile) {
        setProfile({ ...profile, photoUrl: result.photoUrl });
      }
    } catch {
      setError("Photo upload failed.");
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
    alert("Logged out successfully!");
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete your account?\n\nThis will permanently remove your profile, login credentials, and remove you from the alumni members directory. This action CANNOT be undone."
    );
    if (!confirmed) return;

    try {
      setDeleting(true);
      await deleteAccount();
      alert("Your account has been permanently deleted from the database and directory.");
      navigate("/");
    } catch (err) {
      console.error("Account deletion failed:", err);
      alert(err instanceof Error ? err.message : "Failed to delete account. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-4"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50 px-4">
        <div className="bg-white shadow-xl rounded-2xl p-8 text-center max-w-md w-full border border-slate-100">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">⚠️</div>
          <p className="text-red-600 font-bold text-lg mb-2">{error}</p>
          <p className="text-slate-500 text-sm">Please refresh the page or try again later.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-6 px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 relative">
      {/* Background Decor */}
      <div className="absolute top-0 inset-x-0 h-64 bg-slate-900 z-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full filter blur-3xl -translate-y-1/2"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8 md:mb-12 pt-4 gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
              title="Go back"
              className="shrink-0 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full transition-all backdrop-blur-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </button>
            <h1 className="text-3xl font-extrabold text-white tracking-tight truncate">
              My Dashboard
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="shrink-0 bg-white/10 hover:bg-white/20 text-white border border-white/20 py-2 px-6 rounded-full transition-all text-sm font-semibold backdrop-blur-sm"
          >
            Logout
          </button>
        </div>

        {message && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-4 rounded-xl flex items-center gap-3 shadow-sm mb-6 animate-in slide-in-from-top-4 duration-300">
            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            <span className="font-semibold">{message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Profile Card */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white shadow-xl shadow-slate-200/50 rounded-2xl p-6 sm:p-8 border border-slate-100 relative overflow-hidden text-center">
              {/* Cover Banner inside card */}
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-600 to-indigo-600 z-0"></div>
              
              {/* Avatar Section */}
              <div className="relative z-10 mb-6 mt-8">
                <div className="relative inline-block group">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-full p-1.5 bg-white shadow-lg">
                    <img
                      src={profile?.photoUrl || "https://randomuser.me/api/portraits/lego/1.jpg"}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-full border-4 border-slate-50"
                    />
                  </div>
                  
                  {/* Hover Upload Button inside avatar */}
                  <label className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex flex-col items-center justify-center cursor-pointer shadow-md transition-colors border-2 border-white group-hover:scale-105" title="Change Photo">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    <input
                      type="file"
                      onChange={handlePhoto}
                      className="hidden"
                      accept="image/*"
                    />
                  </label>
                </div>

                {photoUploading && (
                  <p className="text-blue-600 text-sm font-medium mt-3 animate-pulse">Uploading photo...</p>
                )}
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-1">{form.fullName || "Alumni User"}</h2>
              <p className="text-blue-600 font-semibold mb-4">{form.jobTitle || "Professional"} @ {form.currentCompany || "Company"}</p>
              
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                <span className="inline-block px-4 py-1.5 bg-slate-100 text-slate-700 rounded-full text-sm font-bold tracking-wider uppercase border border-slate-200">
                  Class of {form.batchYear || "Unknown"}
                </span>
                {(profile?.role === "admin" || form.role === "admin" || JSON.parse(localStorage.getItem("user") || "null")?.role === "admin") && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-300">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    Administrator
                  </span>
                )}
              </div>

              <div className="space-y-3 text-left border-t border-slate-100 pt-6">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                   <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                   <span>{form.department || "No Department listed"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                   <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                   <span>{form.phone || "No Phone listed"}</span>
                </div>
              </div>

              {/* Danger Zone: Permanent Account Deletion */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 shadow-xs"
                >
                  <svg className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {deleting ? "Deleting Account..." : "Delete Account"}
                </button>
                <p className="text-[11px] text-slate-400 mt-2 text-center">
                  Permanently deletes your account and removes you from the members page.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: Form & Events */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Administrator Control Hub (visible only for Admin) */}
            {(profile?.role === "admin" || form.role === "admin" || JSON.parse(localStorage.getItem("user") || "null")?.role === "admin") && (
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xl">
                    ⚡
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      Administrator Control Hub
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
                        Active Access
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300">Quick management shortcuts for verified administrators.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <button
                    onClick={() => navigate("/events")}
                    className="p-4 bg-white/5 hover:bg-white/10 rounded-xl text-left border border-white/10 transition-all hover:scale-[1.02] group"
                  >
                    <span className="text-xl mb-1 block">📅</span>
                    <span className="font-bold text-sm block text-white group-hover:text-blue-300">Manage Events</span>
                    <span className="text-[11px] text-slate-300 block">Create events & upload event photos</span>
                  </button>
                  <button
                    onClick={() => navigate("/gallery")}
                    className="p-4 bg-white/5 hover:bg-white/10 rounded-xl text-left border border-white/10 transition-all hover:scale-[1.02] group"
                  >
                    <span className="text-xl mb-1 block">📸</span>
                    <span className="font-bold text-sm block text-white group-hover:text-purple-300">Manage Gallery</span>
                    <span className="text-[11px] text-slate-300 block">Upload memories and event albums</span>
                  </button>
                  <button
                    onClick={() => navigate("/jobs")}
                    className="p-4 bg-white/5 hover:bg-white/10 rounded-xl text-left border border-white/10 transition-all hover:scale-[1.02] group"
                  >
                    <span className="text-xl mb-1 block">💼</span>
                    <span className="font-bold text-sm block text-white group-hover:text-emerald-300">Post Jobs</span>
                    <span className="text-[11px] text-slate-300 block">Publish career opportunities</span>
                  </button>
                </div>
              </div>
            )}

            {/* Edit Profile Form */}
            <div className="bg-white shadow-xl shadow-slate-200/50 rounded-2xl p-6 sm:p-8 border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm">✏️</span>
                Edit Profile
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                  <input
                    value={form.fullName || ""}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                  <input
                    value={form.phone || ""}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Department</label>
                  <input
                    value={form.department || ""}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Batch Year</label>
                  <input
                    type="number"
                    value={form.batchYear || ""}
                    onChange={(e) => setForm({ ...form, batchYear: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Company</label>
                  <input
                    value={form.currentCompany || ""}
                    onChange={(e) => setForm({ ...form, currentCompany: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Job Title</label>
                  <input
                    value={form.jobTitle || ""}
                    onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bio (About Me)</label>
                  <textarea
                    value={form.bio || ""}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium resize-none"
                  />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-gradient px-8 py-3 rounded-xl font-bold text-sm shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span> Saving...</>
                  ) : "Save Changes"}
                </button>
              </div>
            </div>

            {/* Registered Events */}
            <div className="bg-white shadow-xl shadow-slate-200/50 rounded-2xl p-6 sm:p-8 border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">🗓️</span>
                Registered Events
              </h3>

              {events.length === 0 ? (
                <div className="bg-slate-50 rounded-xl p-8 text-center border border-slate-100 border-dashed">
                  <p className="text-slate-500 font-medium mb-4">You haven't registered for any events yet.</p>
                  <button 
                    onClick={() => navigate('/events')}
                    className="px-6 py-2.5 bg-white border border-slate-200 text-blue-600 font-bold rounded-lg hover:border-blue-300 hover:shadow-sm transition-all text-sm"
                  >
                    Browse Events
                  </button>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {events.map((ev) => (
                    <div
                      key={ev.id}
                      className="bg-slate-50 rounded-xl p-5 border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all group"
                    >
                      <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-1">
                        {ev.title}
                      </h4>

                      <div className="space-y-1.5 text-sm">
                        <p className="text-slate-500 flex items-center gap-2">
                          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                          {new Date(ev.dateISO).toLocaleDateString("en-IN", { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        
                        <p className="text-slate-500 flex items-center gap-2">
                          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                          <span className="truncate">{ev.location}</span>
                        </p>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Status</span>
                        <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-100 text-emerald-700">
                          {ev.status || "Confirmed"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

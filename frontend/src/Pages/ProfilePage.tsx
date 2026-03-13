import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getProfile,
  updateProfile,
  uploadPhoto,
  getRegisteredEvents,
  logout,
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

      setMessage("Profile Updated Successfully ");
      setTimeout(() => setMessage(""), 2000);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
        <div className="bg-white shadow rounded-lg p-6 text-center max-w-md w-full">
          <p className="text-red-600 font-semibold">{error}</p>
          <p className="text-gray-500 text-sm mt-2">
            Please refresh the page or try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            My Profile
          </h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition text-sm font-medium"
          >
            Logout
          </button>
        </div>

        {message && (
          <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-sm sm:text-base">
            {message}
          </div>
        )}

        {/* Profile Section */}
        <div className="bg-white shadow-lg rounded-xl p-4 sm:p-6 flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Left: Photo */}
          <div className="flex flex-col items-center md:items-start md:w-1/3">
            <img
              src={profile?.photoUrl || "https://via.placeholder.com/200"}
              alt="Profile"
              className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 object-cover rounded-full border-4 border-gray-200 shadow-md"
            />

            <label className="mt-4 w-full">
              <span className="block text-sm font-medium text-gray-700 mb-2 text-center md:text-left">
                Upload Photo
              </span>
              <input
                type="file"
                onChange={handlePhoto}
                className="w-full text-sm border rounded-lg p-2"
              />
            </label>

            {photoUploading && (
              <p className="text-blue-600 text-sm mt-2">Uploading photo...</p>
            )}
          </div>

          {/* Right: Form */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <input
              value={form.fullName || ""}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="Full Name"
              className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />

            <input
              value={form.phone || ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Phone"
              className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />

            <input
              value={form.department || ""}
              onChange={(e) =>
                setForm({ ...form, department: e.target.value })
              }
              placeholder="Department"
              className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />

            <input
              type="number"
              value={form.batchYear || ""}
              onChange={(e) =>
                setForm({ ...form, batchYear: Number(e.target.value) })
              }
              placeholder="Batch Year"
              className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />

            <input
              value={form.currentCompany || ""}
              onChange={(e) =>
                setForm({ ...form, currentCompany: e.target.value })
              }
              placeholder="Company"
              className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />

            <input
              value={form.jobTitle || ""}
              onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
              placeholder="Job Title"
              className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />

            <textarea
              value={form.bio || ""}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Bio"
              rows={4}
              className="border p-2 rounded-lg col-span-1 md:col-span-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />

            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition col-span-1 md:col-span-2 disabled:opacity-60 w-full"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Events Section */}
        <div className="mt-8 sm:mt-10">
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-gray-800">
            Registered Events
          </h2>

          {events.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-4 text-gray-600">
              No registered events yet.
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition"
                >
                  <h3 className="text-base sm:text-lg font-bold text-blue-600">
                    {ev.title}
                  </h3>

                  <p className="text-gray-600 text-xs sm:text-sm mt-1">
                    {new Date(ev.dateISO).toLocaleString("en-IN")}
                  </p>

                  <p className="text-gray-700 mt-2 text-sm">
                    Location: {ev.location}
                  </p>

                  <p className="mt-2 text-sm font-medium text-green-600">
                    Status: {ev.status}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

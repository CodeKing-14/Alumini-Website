import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import Footer from "./Footer";

export const alumniMembers = [
  {
    id: 1,
    name: "Prasanth Kumar",
    batch: "2018 - CSE",
    role: "Software Engineer",
    company: "TCS",
    location: "Chennai",
    image: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    id: 2,
    name: "Nandhini S",
    batch: "2019 - ECE",
    role: "Data Analyst",
    company: "Infosys",
    location: "Bangalore",
    image: "https://randomuser.me/api/portraits/women/2.jpg",
  },
  {
    id: 3,
    name: "Arun Raj",
    batch: "2017 - MECH",
    role: "Project Engineer",
    company: "L&T",
    location: "Hyderabad",
    image: "https://randomuser.me/api/portraits/men/3.jpg",
  },
];

const Member = () => {
  const [members, setMembers] = useState<typeof alumniMembers>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        // Use Vite proxy path — works in dev and avoids CORS issues
        const response = await fetch("/api/members");

        if (!response.ok) {
          throw new Error("Failed to fetch members");
        }

        const data = await response.json();
        // Always use DB data (even if empty array)
        setMembers(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error("Error fetching members:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch members"
        );
        // On error, fall back to static list so page isn't blank
        setMembers(alumniMembers);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // ✅ Filtered Members
  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <>
        <Outlet />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading members...</p>
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
          <p className="text-yellow-700">
            ⚠️ {error} - Showing cached members
          </p>
        </div>
      )}

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4">

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-gray-800">
            Alumni Members
          </h1>

          {/* 🔍 Search Box */}
          <div className="mb-8 flex justify-center">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-1/2 px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Members Grid */}
          {filteredMembers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                {searchTerm
                  ? "No members match your search."
                  : "No registered members yet. Be the first to register!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow"
                >
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 mx-auto rounded-full object-cover mb-4 border-4 border-blue-100"
                  />

                  <h2 className="text-xl font-bold text-blue-600">
                    Name: {member.name}
                  </h2>

                  <p className="text-gray-500 text-sm mb-2">
                    Batch: {member.batch}
                  </p>

                  <p className="text-gray-700 font-semibold">
                    Role: {member.role}
                  </p>

                  <p className="text-gray-600 text-sm">
                    Company: {member.company}
                  </p>

                  <p className="text-gray-500 text-sm">
                    Location: {member.location}
                  </p>
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

export default Member;

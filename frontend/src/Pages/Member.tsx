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
        const response = await fetch("/api/members");

        if (!response.ok) {
          throw new Error("Failed to fetch members");
        }

        const data = await response.json();
        setMembers(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error("Error fetching members:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch members"
        );
        setMembers(alumniMembers);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <>
        <Outlet />
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600 font-semibold text-lg animate-pulse">Loading directory...</p>
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
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full filter blur-3xl -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-600/20 rounded-full filter blur-3xl translate-y-1/2"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
             Alumni <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Directory</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
             Find, connect, and network with graduates from across the globe. Tap into the power of the SRIT network.
          </p>
        </div>
      </div>

      <div className="min-h-screen bg-slate-50 pb-20 -mt-10 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {error && (
            <div className="mb-6 bg-orange-50 border border-orange-200 text-orange-800 px-6 py-4 rounded-xl flex items-center gap-3 shadow-sm">
              <svg className="w-6 h-6 text-orange-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              <span className="font-medium text-sm">Showing cached data: {error}</span>
            </div>
          )}

          {/* 🔍 Premium Search Bar */}
          <div className="mb-12 flex justify-center mt-4">
            <div className="relative w-full max-w-2xl group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <input
                type="text"
                placeholder="Search alumni by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-slate-700 font-medium transition-all"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              )}
            </div>
          </div>

          {/* Members Grid */}
          {filteredMembers.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl text-slate-400">🕵️</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No members found</h3>
              <p className="text-slate-500 text-sm">
                {searchTerm
                  ? `No results for "${searchTerm}". Try a different name.`
                  : "No registered members yet. Be the first to join!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center hover-lift relative overflow-hidden group"
                >
                  {/* Decorative Banner */}
                  <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-slate-100 z-0"></div>
                  
                  {/* Avatar */}
                  <div className="relative z-10 w-24 h-24 mx-auto mt-4 mb-4 rounded-full p-1 bg-gradient-to-br from-blue-500 to-cyan-400 shadow-md transform group-hover:-translate-y-1 transition-transform duration-300">
                    <img
                      src={member.image || "https://randomuser.me/api/portraits/lego/1.jpg"}
                      alt={member.name}
                      className="w-full h-full rounded-full object-cover border-4 border-white"
                    />
                  </div>

                  <h2 className="relative z-10 text-xl font-extrabold text-slate-900 mb-1">
                    {member.name}
                  </h2>

                  <div className="relative z-10 inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-slate-200">
                    {member.batch || "Unknown Batch"}
                  </div>

                  <div className="relative z-10 space-y-3 mt-2 border-t border-slate-100 pt-5">
                    <div className="flex items-center justify-center gap-2 text-slate-700 font-semibold">
                      <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                      {member.role || "Professional"}
                    </div>

                    <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                      <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                      <span className="truncate max-w-[180px]">{member.company || "TBD"}</span>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                      <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      {member.location || "Remote"}
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

export default Member;

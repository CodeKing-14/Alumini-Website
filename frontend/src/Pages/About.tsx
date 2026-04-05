import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Footer from "./Footer";

const About = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // ✅ Simulated loading (replace with API call later if needed)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <>
        <Outlet />
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600" />
          <p className="mt-4 text-slate-600 font-semibold text-center animate-pulse">
            Loading About Page...
          </p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Outlet />

      <div className="min-h-screen bg-slate-50">
        {/* HERO */}
        <div className="relative overflow-hidden bg-slate-900 text-white pt-20 pb-24 sm:pt-28 sm:pb-32">
          {/* Abstract background blobs */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[100%] rounded-full bg-gradient-to-b from-blue-600/30 to-indigo-600/30 blur-[120px]" />
            <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[100%] rounded-full bg-gradient-to-t from-blue-700/20 to-indigo-800/20 blur-[120px]" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 drop-shadow-lg">
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Us</span>
            </h1>
            <p className="max-w-3xl mx-auto text-lg sm:text-xl text-slate-300 leading-relaxed">
              SRIT Alumni Website is built to connect graduates, celebrate
              achievements, and strengthen the lifelong bond between alumni and
              our institution. It is a place to network, share memories, explore
              events, and support each other professionally and personally.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => navigate("/events")}
                className="btn-gradient px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl w-full sm:w-auto text-lg"
              >
                Explore Events
              </button>
              <button
                onClick={() => navigate("/gallery")}
                className="px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-full shadow-lg hover:bg-white/20 transition-all duration-300 w-full sm:w-auto text-lg"
              >
                View Gallery
              </button>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 -mt-10 relative z-20">
          {/* QUICK STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
            <div className="glass rounded-2xl p-8 text-center hover-lift">
              <div className="w-16 h-16 mx-auto bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 text-3xl">👥</div>
              <p className="text-4xl font-extrabold text-slate-900 mb-2">5000+</p>
              <p className="text-slate-500 font-medium uppercase tracking-wide text-sm">Alumni Network</p>
            </div>
            <div className="glass rounded-2xl p-8 text-center hover-lift">
              <div className="w-16 h-16 mx-auto bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 text-3xl">🎉</div>
              <p className="text-4xl font-extrabold text-slate-900 mb-2">50+</p>
              <p className="text-slate-500 font-medium uppercase tracking-wide text-sm">Events & Meetups</p>
            </div>
            <div className="glass rounded-2xl p-8 text-center hover-lift">
              <div className="w-16 h-16 mx-auto bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 text-3xl">🚀</div>
              <p className="text-4xl font-extrabold text-slate-900 mb-2">100+</p>
              <p className="text-slate-500 font-medium uppercase tracking-wide text-sm">Success Stories</p>
            </div>
          </div>

          {/* MISSION / VISION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 hover-lift relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-2 h-full bg-blue-500 transform origin-bottom scale-y-100 group-hover:bg-blue-600 transition-colors"></div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                <span className="text-3xl">🎯</span> Our Mission
              </h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                To create a strong alumni community that supports networking,
                career growth, mentorship, and meaningful engagement between
                alumni, students, and the institution.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 hover-lift relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500 transform origin-bottom scale-y-100 group-hover:bg-indigo-600 transition-colors"></div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                <span className="text-3xl">🚀</span> Our Vision
              </h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                To build a lifelong alumni ecosystem where every graduate stays
                connected, contributes back, and grows together through shared
                opportunities and experiences.
              </p>
            </div>
          </div>

          {/* WHO WE ARE */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-12 mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-6 flex items-center gap-3">
              👨‍🎓 Who We Are
            </h2>
            <div className="prose prose-lg text-slate-600 max-w-none space-y-4">
              <p className="leading-relaxed">
                The SRIT Alumni Association is a strong and growing network of
                graduates who have carried the values, knowledge, and culture of
                SRIT into various industries and professions across the world. Our
                alumni community represents excellence, leadership, innovation,
                and commitment.
              </p>
              <p className="leading-relaxed">
                This platform is designed to maintain lifelong connections between
                alumni, current students, and faculty members by providing
                opportunities for networking, mentorship, and collaboration.
              </p>
            </div>
          </div>

          {/* TWO COLUMNS: OBJECTIVES & OFFERS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* OBJECTIVES */}
            <div className="bg-slate-900 text-white rounded-2xl shadow-lg p-8 md:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 relative z-10">
                <span className="text-3xl">🎯</span> Our Objectives
              </h2>
              <ul className="space-y-4 text-slate-300 text-lg relative z-10">
                <li className="flex items-start gap-3">
                  <span className="text-blue-400 mt-1">✓</span> Strengthen the bond between alumni and the institution.
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-400 mt-1">✓</span> Provide a professional networking platform.
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-400 mt-1">✓</span> Encourage alumni participation in college events.
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-400 mt-1">✓</span> Support students through mentorship and career guidance.
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-400 mt-1">✓</span> Celebrate alumni achievements and success stories.
                </li>
              </ul>
            </div>

            {/* WHAT THIS WEBSITE OFFERS */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">🌟</span> What We Offer
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-5 rounded-xl bg-blue-50 border border-blue-100 hover-lift">
                  <h3 className="font-bold text-blue-800 flex items-center gap-2 mb-2">📅 Events</h3>
                  <p className="text-sm text-blue-900/80">
                    Get updates about reunions, workshops, seminars, and meetups.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-indigo-50 border border-indigo-100 hover-lift">
                  <h3 className="font-bold text-indigo-800 flex items-center gap-2 mb-2">🖼️ Gallery</h3>
                  <p className="text-sm text-indigo-900/80">
                    Explore memories shared by alumni and view past campus life.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-purple-50 border border-purple-100 hover-lift">
                  <h3 className="font-bold text-purple-800 flex items-center gap-2 mb-2">👥 Directory</h3>
                  <p className="text-sm text-purple-900/80">
                    Search and connect with alumni based on department and batch.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-100 hover-lift">
                  <h3 className="font-bold text-emerald-800 flex items-center gap-2 mb-2">👤 Profile</h3>
                  <p className="text-sm text-emerald-900/80">
                    Update your details, upload a photo, and track your events.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* COMMUNITY IMPACT */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-12 mb-16 text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-6">
              🌍 Community Impact
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed max-w-3xl mx-auto mb-10">
              Our alumni contribute significantly to society by leading
              companies, launching startups, mentoring students, and
              participating in social initiatives.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-6">
                <p className="text-5xl font-extrabold text-blue-600 mb-2">15+</p>
                <p className="text-slate-500 font-semibold uppercase tracking-wider text-sm">Countries Represented</p>
              </div>
              <div className="p-6 border-y sm:border-y-0 sm:border-x border-slate-200">
                <p className="text-5xl font-extrabold text-indigo-600 mb-2">200+</p>
                <p className="text-slate-500 font-semibold uppercase tracking-wider text-sm">Corporate Partners</p>
              </div>
              <div className="p-6">
                <p className="text-5xl font-extrabold text-green-600 mb-2">300+</p>
                <p className="text-slate-500 font-semibold uppercase tracking-wider text-sm">Mentorship Sessions</p>
              </div>
            </div>
          </div>

          {/* MESSAGE & CTA Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* MESSAGE */}
            <div className="lg:col-span-2 bg-gradient-to-br from-blue-700 to-indigo-800 text-white rounded-2xl shadow-lg p-8 md:p-10 relative overflow-hidden">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">💬 Message to Our Alumni</h2>
              <p className="text-lg leading-relaxed text-blue-100">
                No matter where life takes you, SRIT will always remain your home.
                We invite you to stay connected, share your journey, and continue
                to inspire the next generation of students. Together, we build a
                stronger and more impactful alumni community.
              </p>
              <div className="absolute -bottom-10 -right-10 text-9xl text-white/10 select-none">"</div>
            </div>

            {/* CTA */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 flex flex-col items-center justify-center text-center">
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                Join the Network
              </h3>
              <p className="text-slate-600 mb-8">
                Register, update your profile, and start connecting today.
              </p>

              <button
                onClick={() => navigate("/login")}
                className="btn-gradient w-full py-4 rounded-xl text-lg font-bold shadow-md"
              >
                Register / Login
              </button>
            </div>
          </div>

          {/* CONTACT */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-12 text-center max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              📩 Contact & Support
            </h2>
            <p className="text-slate-600 leading-relaxed mb-8">
              For event updates, profile support, or any help with the alumni
              portal, please reach out to our team.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="p-6 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center">
                <span className="text-2xl mb-2">📧</span>
                <p className="font-bold text-slate-900 mb-1">Email</p>
                <p className="text-blue-600 font-medium">alumni@srit.edu.in</p>
              </div>
              <div className="p-6 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center">
                <span className="text-2xl mb-2">🏢</span>
                <p className="font-bold text-slate-900 mb-1">Office</p>
                <p className="text-slate-600">SRIT Campus, Alumni Cell</p>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default About;

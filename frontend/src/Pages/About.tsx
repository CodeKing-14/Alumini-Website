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
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600" />
          <p className="mt-4 text-gray-600 font-semibold text-center">
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

      <div className="min-h-screen bg-gray-50">
        {/* HERO */}
        <div className="bg-linear-to-r from-blue-700 to-indigo-700 text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
            <h1 className="text-3xl sm:text-4xl font-bold">About Us</h1>
            <p className="mt-3 max-w-3xl text-sm sm:text-base text-white/90">
              SRIT Alumni Website is built to connect graduates, celebrate
              achievements, and strengthen the lifelong bond between alumni and
              our institution. It is a place to network, share memories, explore
              events, and support each other professionally and personally.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate("/events")}
                className="w-full sm:w-auto px-6 py-2 bg-white text-blue-700 font-semibold rounded-lg shadow hover:bg-gray-100 transition"
              >
                Explore Events
              </button>
              <button
                onClick={() => navigate("/gallery")}
                className="w-full sm:w-auto px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow hover:bg-blue-600 transition"
              >
                View Gallery
              </button>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          {/* QUICK STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <div className="bg-white rounded-xl shadow p-5 text-center">
              <p className="text-3xl font-bold text-blue-600">5000+</p>
              <p className="text-gray-600 text-sm mt-1">Alumni Network</p>
            </div>
            <div className="bg-white rounded-xl shadow p-5 text-center">
              <p className="text-3xl font-bold text-indigo-600">50+</p>
              <p className="text-gray-600 text-sm mt-1">Events & Meetups</p>
            </div>
            <div className="bg-white rounded-xl shadow p-5 text-center">
              <p className="text-3xl font-bold text-green-600">100+</p>
              <p className="text-gray-600 text-sm mt-1">Success Stories</p>
            </div>
          </div>

          {/* MISSION / VISION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-blue-600 mb-3">
                🎯 Our Mission
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                To create a strong alumni community that supports networking,
                career growth, mentorship, and meaningful engagement between
                alumni, students, and the institution.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-indigo-600 mb-3">
                🚀 Our Vision
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                To build a lifelong alumni ecosystem where every graduate stays
                connected, contributes back, and grows together through shared
                opportunities and experiences.
              </p>
            </div>
          </div>

          {/* WHO WE ARE */}
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              👨‍🎓 Who We Are
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              The SRIT Alumni Association is a strong and growing network of
              graduates who have carried the values, knowledge, and culture of
              SRIT into various industries and professions across the world. Our
              alumni community represents excellence, leadership, innovation,
              and commitment.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed mt-3">
              This platform is designed to maintain lifelong connections between
              alumni, current students, and faculty members by providing
              opportunities for networking, mentorship, and collaboration.
            </p>
          </div>

          {/* OBJECTIVES */}
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              🎯 Our Objectives
            </h2>
            <ul className="space-y-3 text-gray-600 text-sm">
              <li>✅ Strengthen the bond between alumni and the institution.</li>
              <li>✅ Provide a professional networking platform.</li>
              <li>✅ Encourage alumni participation in college events.</li>
              <li>✅ Support students through mentorship and career guidance.</li>
              <li>✅ Celebrate alumni achievements and success stories.</li>
            </ul>
          </div>

          {/* WHAT THIS WEBSITE OFFERS */}
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              🌟 What This Website Offers
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-blue-700">📅 Alumni Events</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Get updates about reunions, workshops, seminars, cultural
                  programs, and online meetups.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-blue-700">🖼️ Gallery</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Explore memories shared by alumni and view moments from past
                  events and campus life.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-blue-700">
                  👥 Member Directory
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Search and connect with alumni based on department, batch, and
                  professional background.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-blue-700">👤 My Profile</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Update your profile, upload a photo, and track your registered
                  events in one place.
                </p>
              </div>
            </div>
          </div>

          {/* COMMUNITY IMPACT */}
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              🌍 Community Impact
            </h2>

            <p className="text-gray-600 text-sm leading-relaxed">
              Our alumni contribute significantly to society by leading
              companies, launching startups, mentoring students, and
              participating in social initiatives. Through this platform, we
              aim to create opportunities for alumni to give back to the
              institution and community.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 text-center">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">15+</p>
                <p className="text-gray-600 text-sm">Countries Represented</p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-indigo-600">200+</p>
                <p className="text-gray-600 text-sm">Corporate Partners</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-green-600">300+</p>
                <p className="text-gray-600 text-sm">Mentorship Sessions</p>
              </div>
            </div>
          </div>

          {/* WHY JOIN */}
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              💡 Why Join the Alumni Network?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="border rounded-lg p-4">
                🔗 Build valuable professional connections.
              </div>
              <div className="border rounded-lg p-4">
                📚 Share knowledge and mentor current students.
              </div>
              <div className="border rounded-lg p-4">
                🎉 Participate in alumni reunions and cultural events.
              </div>
              <div className="border rounded-lg p-4">
                🚀 Stay updated with institutional developments.
              </div>
            </div>
          </div>

          {/* MESSAGE */}
          <div className="bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow p-6 mb-8">
            <h2 className="text-xl font-bold mb-3">💬 Message to Our Alumni</h2>
            <p className="text-sm leading-relaxed text-white/90">
              No matter where life takes you, SRIT will always remain your home.
              We invite you to stay connected, share your journey, and continue
              to inspire the next generation of students. Together, we build a
              stronger and more impactful alumni community.
            </p>
          </div>

          {/* CTA */}
          <div className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                Be part of the SRIT Alumni Community
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                Register, update your profile, and start connecting today.
              </p>
            </div>

            <button
              onClick={() => navigate("/login")}
              className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Register / Login
            </button>
          </div>

          {/* CONTACT */}
          <div className="mt-8 bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              📩 Contact & Support
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              For event updates, profile support, or any help with the alumni
              portal, please reach out to the alumni coordinator or the website
              admin team.
            </p>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="border rounded-lg p-4">
                <p className="font-semibold text-gray-800">Email</p>
                <p className="text-gray-600">alumni@srit.edu.in</p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="font-semibold text-gray-800">Office</p>
                <p className="text-gray-600">SRIT Campus, Alumni Cell</p>
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

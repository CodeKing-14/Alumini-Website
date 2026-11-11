import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Footer from "./Footer";
import {
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Mail,
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  Copy,
  ShieldCheck,
  AlertCircle,
  X,
  FileText,
  UserCheck,
  Sparkles,
} from "lucide-react";

export type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  jobType: string;
  experienceLevel?: string | null;
  salaryRange?: string | null;
  description: string;
  requirements?: string | null;
  applicationEmail: string;
  deadline?: string | null;
  postedBy?: string | null;
  createdAt?: string;
};

const JOB_TYPES = ["All", "Full-time", "Internship", "Remote", "Part-time", "Contract"];

const DEFAULT_APPLICATION_EMAIL = "sritalumni@gmail.com";

export default function Jobs() {
  const navigate = useNavigate();

  // Authentication & Role
  const [isAdmin, setIsAdmin] = useState(false);

  // Job data state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Admin New Job Form
  const [jobForm, setJobForm] = useState({
    title: "",
    company: "",
    location: "",
    jobType: "Full-time",
    experienceLevel: "0 - 2 Years",
    salaryRange: "",
    deadline: "",
    applicationEmail: DEFAULT_APPLICATION_EMAIL,
    description: "",
    requirements: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Check admin access on mount
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const token = localStorage.getItem("token");
      setIsAdmin(!!token && user?.role === "admin");
    } catch {
      setIsAdmin(false);
    }
  }, []);

  // Fetch jobs from backend
  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/jobs");
      if (!res.ok) {
        throw new Error("Failed to load jobs");
      }
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError(err instanceof Error ? err.message : "Could not load job postings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Filtered jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesType =
      selectedType === "All" ||
      job.jobType.toLowerCase() === selectedType.toLowerCase();

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      job.title.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q) ||
      job.location.toLowerCase().includes(q) ||
      job.description.toLowerCase().includes(q);

    return matchesType && matchesSearch;
  });

  // Copy email to clipboard helper
  const handleCopyEmail = (email: string, id: number) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2500);
  };

  // Submit new job (Admin only)
  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setFormError("Admin authentication required. Please log in as Admin.");
      navigate("/login");
      return;
    }

    if (!jobForm.title.trim() || !jobForm.company.trim() || !jobForm.location.trim() || !jobForm.description.trim()) {
      setFormError("Please fill in all required fields (Title, Company, Location, Description).");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: jobForm.title.trim(),
          company: jobForm.company.trim(),
          location: jobForm.location.trim(),
          jobType: jobForm.jobType,
          experienceLevel: jobForm.experienceLevel.trim() || null,
          salaryRange: jobForm.salaryRange.trim() || null,
          deadline: jobForm.deadline.trim() || null,
          applicationEmail: (jobForm.applicationEmail.trim() || DEFAULT_APPLICATION_EMAIL),
          description: jobForm.description.trim(),
          requirements: jobForm.requirements.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 401 || res.status === 403) {
          throw new Error("Admin authorization expired or denied. Only admins can add jobs.");
        }
        throw new Error(data.detail || "Failed to create job posting");
      }

      const created: Job = await res.json();
      setJobs((prev) => [created, ...prev]);
      setIsAddModalOpen(false);
      setSuccessMsg(`Job "${created.title}" at ${created.company} posted successfully!`);
      setTimeout(() => setSuccessMsg(null), 5000);

      // Reset form
      setJobForm({
        title: "",
        company: "",
        location: "",
        jobType: "Full-time",
        experienceLevel: "0 - 2 Years",
        salaryRange: "",
        deadline: "",
        applicationEmail: DEFAULT_APPLICATION_EMAIL,
        description: "",
        requirements: "",
      });
    } catch (err) {
      console.error("Error creating job:", err);
      setFormError(err instanceof Error ? err.message : "Error posting job");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete job (Admin only)
  const handleDeleteJob = async (jobId: number) => {
    if (!window.confirm("Are you sure you want to delete this job posting? This action cannot be undone.")) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Admin authorization required.");
      return;
    }

    try {
      setDeletingId(jobId);
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete job posting");
      }

      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      if (selectedJob?.id === jobId) {
        setSelectedJob(null);
      }
      setSuccessMsg("Job posting removed successfully.");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error("Error deleting job:", err);
      alert(err instanceof Error ? err.message : "Failed to delete job");
    } finally {
      setDeletingId(null);
    }
  };

  // Helper badge color for job types
  const getJobTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case "full-time":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "internship":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "remote":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "part-time":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "contract":
        return "bg-cyan-50 text-cyan-700 border-cyan-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  // Helper avatar colors based on company name
  const getCompanyInitials = (company: string) => {
    return company
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  };

  return (
    <>
      <Outlet />

      {/* ================= PAGE HERO HEADER ================= */}
      <div className="bg-slate-900 pt-16 pb-24 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/20 rounded-full filter blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs sm:text-sm font-medium mb-4 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-blue-400" />
            SRIT Career & Alumni Placement Portal
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight">
            Career & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-300">Jobs Portal</span>
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Explore exclusive job opportunities and referrals shared by alumni and recruiters for the SRIT community.
          </p>

          {/* Quick Metrics Bar */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Jobs</p>
              <p className="text-2xl font-bold text-white mt-1">{jobs.length}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Referral Network</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">Verified Alumni</p>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Direct Application</p>
              <p className="text-2xl font-bold text-indigo-300 mt-1">Via SRIT Cell</p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= ALERTS ================= */}
      {successMsg && (
        <div className="max-w-7xl mx-auto mt-6 px-4 sm:px-6">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-semibold text-sm">{successMsg}</span>
            </div>
            <button
              onClick={() => setSuccessMsg(null)}
              className="text-emerald-600 hover:text-emerald-800 text-sm font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-7xl mx-auto mt-6 px-4 sm:px-6">
          <div className="bg-rose-50 border border-rose-200 text-rose-800 px-6 py-4 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span className="font-semibold text-sm">{error}</span>
            </div>
            <button
              onClick={fetchJobs}
              className="px-3 py-1 bg-rose-600 text-white text-xs font-medium rounded-lg hover:bg-rose-700 transition"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* ================= MAIN CONTENT SECTION ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Controls: Search, Filters & Admin Action */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search job title, company, skills, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Job Type Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              {JOB_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                    selectedType === type
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Admin Add Job Button (Visible ONLY to Admins) */}
            {isAdmin ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="btn-gradient flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-blue-600/25 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  Post a Job
                </button>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>Job posting is managed by SRIT Alumni Admins</span>
              </div>
            )}
          </div>

          {/* Admin badge banner if admin */}
          {isAdmin && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-700 bg-indigo-50/70 px-4 py-2 rounded-xl border border-indigo-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold">Admin Mode Active:</span>
                <span>You have permissions to create and manage job postings for the alumni network.</span>
              </div>
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-indigo-200 text-indigo-800">
                Authorized
              </span>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-24 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-slate-600 font-semibold animate-pulse">Loading opportunities...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredJobs.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs max-w-xl mx-auto my-8">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No Job Openings Found</h3>
            <p className="text-slate-500 text-sm mb-6">
              {searchQuery || selectedType !== "All"
                ? "No jobs match your current search or filters. Try adjusting your query."
                : "No job postings are currently active. Check back soon for new opportunities!"}
            </p>
            {(searchQuery || selectedType !== "All") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedType("All");
                }}
                className="px-5 py-2.5 bg-blue-50 text-blue-700 font-semibold text-sm rounded-xl hover:bg-blue-100 transition"
              >
                Reset All Filters
              </button>
            )}
          </div>
        )}

        {/* ================= JOB CARDS GRID ================= */}
        {!loading && filteredJobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredJobs.map((job) => {
              const appEmail = job.applicationEmail || DEFAULT_APPLICATION_EMAIL;
              const mailSubject = encodeURIComponent(`Application for ${job.title} at ${job.company} - SRIT Alumni`);
              const mailBody = encodeURIComponent(
                `Dear SRIT Alumni Cell / Hiring Team,\n\nI am writing to submit my application for the ${job.title} position at ${job.company}.\n\nPlease find my CV / Resume attached.\n\nSRIT Batch / Department: \nContact Number: \nLinkedIn / Portfolio: \n\nRegards,\n`
              );
              const mailtoUrl = `mailto:${appEmail}?subject=${mailSubject}&body=${mailBody}`;

              return (
                <div
                  key={job.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                >
                  {/* Top Header */}
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3.5">
                        {/* Company Logo Badge */}
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-base flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                          {getCompanyInitials(job.company)}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-1.5 text-slate-600 text-sm font-medium mt-0.5">
                            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                            <span>{job.company}</span>
                          </div>
                        </div>
                      </div>

                      {/* Job Type Badge */}
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full border shrink-0 ${getJobTypeBadge(
                          job.jobType
                        )}`}
                      >
                        {job.jobType}
                      </span>
                    </div>

                    {/* Metadata tags: Location, Experience, Salary */}
                    <div className="flex flex-wrap items-center gap-2.5 mb-4 text-xs font-medium text-slate-600">
                      <div className="inline-flex items-center gap-1 px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{job.location}</span>
                      </div>

                      {job.experienceLevel && (
                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl">
                          <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                          <span>{job.experienceLevel}</span>
                        </div>
                      )}

                      {job.salaryRange && (
                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-semibold">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{job.salaryRange}</span>
                        </div>
                      )}

                      {job.deadline && (
                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>Deadline: {job.deadline}</span>
                        </div>
                      )}
                    </div>

                    {/* Description Excerpt */}
                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-5">
                      {job.description}
                    </p>
                  </div>

                  {/* ================= USER REQUIREMENT CALLOUT ================= */}
                  {/* Under every job: "interested means mail your CV to sritalumni@sritcbe" */}
                  <div className="mt-2 pt-4 border-t border-slate-100">
                    <div className="p-4 bg-gradient-to-r from-blue-50 via-indigo-50/70 to-sky-50 border border-blue-200/90 rounded-2xl shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shrink-0 mt-0.5 sm:mt-0">
                            <Mail className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 leading-snug">
                              Interested? Mail your CV to{" "}
                              <span className="text-blue-700 underline decoration-blue-300 font-mono">
                                &ldquo;{appEmail}&rdquo;
                              </span>
                            </p>
                            <p className="text-[11px] text-slate-600 mt-0.5">
                              Attach your resume &amp; mention your SRIT batch in the email subject.
                            </p>
                          </div>
                        </div>

                        {/* Action buttons: Send CV & Copy Email */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <button
                            type="button"
                            onClick={() => handleCopyEmail(appEmail, job.id)}
                            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
                            title="Copy email address"
                          >
                            {copiedId === job.id ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-700 font-bold">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-500" />
                                <span>Copy Email</span>
                              </>
                            )}
                          </button>

                          <a
                            href={mailtoUrl}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Mail CV</span>
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Card Footer Actions: Details + Admin Delete */}
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 py-1 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        View Full Details &amp; Requirements
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          disabled={deletingId === job.id}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 transition-colors flex items-center gap-1"
                          title="Delete this job posting (Admin only)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{deletingId === job.id ? "Deleting..." : "Delete"}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= JOB DETAILS MODAL ================= */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-lg flex items-center justify-center shadow-md">
                  {getCompanyInitials(selectedJob.company)}
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    {selectedJob.title}
                  </h2>
                  <p className="text-sm font-semibold text-slate-600 flex items-center gap-1.5 mt-0.5">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    {selectedJob.company}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Details Pills */}
            <div className="my-5 flex flex-wrap gap-2 text-xs font-semibold">
              <span className={`px-3 py-1 rounded-full border ${getJobTypeBadge(selectedJob.jobType)}`}>
                {selectedJob.jobType}
              </span>
              <span className="px-3 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                {selectedJob.location}
              </span>
              {selectedJob.experienceLevel && (
                <span className="px-3 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-700 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                  {selectedJob.experienceLevel}
                </span>
              )}
              {selectedJob.salaryRange && (
                <span className="px-3 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  {selectedJob.salaryRange}
                </span>
              )}
              {selectedJob.deadline && (
                <span className="px-3 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-700 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  Apply before: {selectedJob.deadline}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="space-y-4 text-sm text-slate-700">
              <div>
                <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-2">
                  Role Overview &amp; Responsibilities
                </h4>
                <div className="whitespace-pre-line leading-relaxed bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                  {selectedJob.description}
                </div>
              </div>

              {selectedJob.requirements && (
                <div>
                  <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-2">
                    Requirements &amp; Qualifications
                  </h4>
                  <div className="whitespace-pre-line leading-relaxed bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                    {selectedJob.requirements}
                  </div>
                </div>
              )}
            </div>

            {/* Application Banner */}
            <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl">
              <h4 className="text-sm font-extrabold text-slate-900 mb-1 flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                How to Apply
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed mb-3">
                Interested candidates: Please mail your CV directly to{" "}
                <strong className="text-blue-700 font-mono">
                  {selectedJob.applicationEmail || DEFAULT_APPLICATION_EMAIL}
                </strong>
                . Mention <strong>&ldquo;Application for {selectedJob.title} - {selectedJob.company}&rdquo;</strong> in your email subject line.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={`mailto:${selectedJob.applicationEmail || DEFAULT_APPLICATION_EMAIL}?subject=${encodeURIComponent(
                    `Application for ${selectedJob.title} at ${selectedJob.company} - SRIT Alumni`
                  )}`}
                  className="btn-gradient px-5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md"
                >
                  <Mail className="w-4 h-4" />
                  Mail CV Now
                </a>
                <button
                  onClick={() =>
                    handleCopyEmail(selectedJob.applicationEmail || DEFAULT_APPLICATION_EMAIL, selectedJob.id)
                  }
                  className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl flex items-center gap-1.5 transition"
                >
                  {copiedId === selectedJob.id ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-500" />
                      <span>Copy Email</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Modal Close */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= ADMIN ONLY: POST NEW JOB MODAL ================= */}
      {isAddModalOpen && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Post a New Job Opportunity</h2>
                  <p className="text-xs text-slate-500">Admin Only • Saved directly to PostgreSQL database</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-2xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateJob} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Job Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Software Engineer"
                    value={jobForm.title}
                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Company Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Zoho Corporation"
                    value={jobForm.company}
                    onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Location <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Coimbatore / Hybrid"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Job Type</label>
                  <select
                    value={jobForm.jobType}
                    onChange={(e) => setJobForm({ ...jobForm, jobType: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Remote">Remote</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Experience Level</label>
                  <input
                    type="text"
                    placeholder="e.g. 0 - 2 Years"
                    value={jobForm.experienceLevel}
                    onChange={(e) => setJobForm({ ...jobForm, experienceLevel: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Salary / Package (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₹6.5 - ₹10 LPA"
                    value={jobForm.salaryRange}
                    onChange={(e) => setJobForm({ ...jobForm, salaryRange: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Deadline (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 30 Dec 2026 or Rolling"
                    value={jobForm.deadline}
                    onChange={(e) => setJobForm({ ...jobForm, deadline: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Application Email Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Application Email (Candidates will mail CV here)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={jobForm.applicationEmail}
                    onChange={(e) => setJobForm({ ...jobForm, applicationEmail: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Default: <span className="font-semibold text-blue-600">sritalumni@sritcbe</span>. Under every job, candidates are told: &ldquo;Interested means mail your CV to sritalumni@sritcbe&rdquo;.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Job Description &amp; Responsibilities <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detail the role, daily responsibilities, and team overview..."
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Requirements &amp; Tech Stack (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Required degrees, programming languages, years of experience, or certifications..."
                  value={jobForm.requirements}
                  onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-gradient px-6 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving to PostgreSQL...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>Publish Job</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= FOOTER ================= */}
      <Footer />
    </>
  );
}

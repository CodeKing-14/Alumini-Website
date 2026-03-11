// src/services/api.ts

export const USE_MOCK = true; 
// 🔥 Change to false when backend is ready

// ----------------------
// TYPES
// ----------------------

export type AlumniProfile = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  department?: string;
  batchYear?: number;
  currentCompany?: string;
  jobTitle?: string;
  location?: string;
  bio?: string;
  photoUrl?: string;
};

export type RegisteredEvent = {
  id: string;
  title: string;
  dateISO: string;
  location: string;
  status?: "registered" | "attended";
};

// ----------------------
// MOCK DATA
// ----------------------

const mockProfile: AlumniProfile = {
  id: "1",
  fullName: "Prasanth",
  email: "prasanth@gmail.com",
  phone: "9876543210",
  department: "CSE",
  batchYear: 2024,
  currentCompany: "TCS",
  jobTitle: "Frontend Developer",
  location: "Chennai",
  bio: "Passionate React Developer",
  photoUrl: "",
};

const mockEvents: RegisteredEvent[] = [
  {
    id: "1",
    title: "Alumni Meetup 2026",
    dateISO: "2026-03-01T10:00:00",
    location: "SRIT Auditorium",
    status: "registered",
  },
  {
    id: "2",
    title: "AI Tech Talk",
    dateISO: "2026-04-10T14:00:00",
    location: "Online",
    status: "attended",
  },
];

// ----------------------
// API FUNCTIONS
// ----------------------

export async function getProfile(): Promise<AlumniProfile> {
  if (USE_MOCK) return Promise.resolve(mockProfile);

  const res = await fetch("/api/me");
  return res.json();
}

export async function updateProfile(
  data: Partial<AlumniProfile>
): Promise<AlumniProfile> {
  if (USE_MOCK) return Promise.resolve({ ...mockProfile, ...data });

  const res = await fetch("/api/me", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return res.json();
}

export async function uploadPhoto(
  file: File
): Promise<{ photoUrl: string }> {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({ photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    });
  }

  const formData = new FormData();
  formData.append("photo", file);

  const res = await fetch("/api/me/photo", {
    method: "POST",
    body: formData,
  });

  return res.json();
}

export async function getRegisteredEvents(): Promise<RegisteredEvent[]> {
  if (USE_MOCK) return Promise.resolve(mockEvents);

  const res = await fetch("/api/me/events");
  return res.json();
}

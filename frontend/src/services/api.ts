// src/services/api.ts

export const USE_MOCK = false; 
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

// Helper to get auth token
function getAuthToken(): string | null {
  return localStorage.getItem("token");
}

// ----------------------
// API FUNCTIONS
// ----------------------

export async function getProfile(): Promise<AlumniProfile> {
  if (USE_MOCK) return Promise.resolve(mockProfile);

  const token = getAuthToken();
  const res = await fetch("/api/me", {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  
  if (!res.ok) {
    throw new Error("Failed to fetch profile");
  }
  return res.json();
}

export async function updateProfile(
  data: Partial<AlumniProfile>
): Promise<AlumniProfile> {
  if (USE_MOCK) return Promise.resolve({ ...mockProfile, ...data });

  const token = getAuthToken();
  const res = await fetch("/api/me", {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
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

  const token = getAuthToken();
  const formData = new FormData();
  formData.append("photo", file);

  const res = await fetch("/api/me/photo", {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  return res.json();
}

export async function getRegisteredEvents(): Promise<RegisteredEvent[]> {
  if (USE_MOCK) return Promise.resolve(mockEvents);

  const token = getAuthToken();
  const res = await fetch("/api/me/events", {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return res.json();
}

export async function logout(): Promise<void> {
  const token = getAuthToken();
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch {
    // Ignore logout errors - client-side cleanup is more important
  }
  // Always clear local storage regardless of API response
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

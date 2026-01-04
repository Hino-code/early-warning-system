import {
  AppUser,
  AuthSession,
  LoginPayload,
  PendingUser,
  RegistrationPayload,
} from "@/shared/types/user";

const defaultUsers: Array<AppUser & { password: string }> = [
  {
    id: "user-admin",
    username: "System Administrator",
    email: "admin@ews.local",
    role: "Administrator",
    status: "approved",
    password: "admin123",
  },
  {
    id: "user-demo",
    username: "Demo User",
    email: "demo@ews.local",
    role: "Demo User",
    status: "approved",
    password: "demo123",
  },
  {
    id: "user-field",
    username: "Field Manager",
    email: "field@ews.local",
    role: "Field Manager",
    status: "approved",
    password: "field123",
  },
];

let approvedUsers = [...defaultUsers];

// Generate comprehensive pending users list for evaluation
const generatePendingUsers = (): PendingUser[] => {
  const agencies = [
    "DA Region XII - Research Division",
    "PhilRice - Mindoro Branch",
    "Cagayan Valley Agricultural Office",
    "International Rice Research Institute",
    "Central Luzon Farmers Cooperative",
    "Bureau of Agricultural Research",
    "DA Region III - Extension Services",
    "DA Region V - Research and Development",
    "Central Visayas Agricultural Office",
    "Northern Mindanao Agricultural Center",
    "Western Visayas Agricultural Research",
    "Eastern Visayas Regional Office",
    "Zamboanga Peninsula Agricultural Station",
    "SOCCSKSARGEN Agricultural Division",
    "Caraga Regional Agricultural Center",
  ];
  
  const firstNames = ["Maria", "John", "Anna", "Carlos", "Sofia", "Michael", "Liza", "Robert", "Carmen", "David", "Patricia", "James", "Rosa", "Mark", "Grace"];
  const lastNames = ["Santos", "Dela Cruz", "Rodriguez", "Mendoza", "Garcia", "Tan", "Ramos", "Lopez", "Villanueva", "Fernandez", "Cruz", "Reyes", "Bautista", "Gonzales", "Torres"];
  const roles: Array<"Researcher" | "Field Manager"> = ["Researcher", "Field Manager"];
  
  const pendingUsers: PendingUser[] = [];
  const now = Date.now();
  
  // Generate 20 pending users with varied submission times
  for (let i = 0; i < 20; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
    const name = `${firstName} ${lastName}${i >= firstNames.length ? ` ${i + 1}` : ''}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(' ', '')}${i}@${agencies[i % agencies.length].toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.ph`;
    
    // Varied submission times: from 30 minutes to 5 days ago
    const hoursAgo = i < 5 ? (i * 2 + 1) : (i < 10 ? (i * 6 + 12) : (i * 12 + 24));
    const submittedAt = new Date(now - hoursAgo * 60 * 60 * 1000).toISOString();
    
    pendingUsers.push({
      id: `pending-${i + 1}`,
      name,
      email,
      agency: agencies[i % agencies.length],
      role: roles[i % 2],
      submittedAt,
    });
  }
  
  return pendingUsers.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
};

let pendingUsers: PendingUser[] = generatePendingUsers();

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

const createToken = (userId: string) =>
  `mock-token-${userId}-${Date.now().toString(36)}`;

export async function mockLogin(payload: LoginPayload): Promise<AuthSession> {
  await delay();
  const match = approvedUsers.find(
    (user) =>
      user.email.toLowerCase() === payload.username.toLowerCase() &&
      user.password === payload.password,
  );

  if (!match) {
    throw new Error("Invalid credentials or account not approved");
  }

  return {
    token: createToken(match.id),
    user: {
      id: match.id,
      username: match.username,
      email: match.email,
      role: match.role,
      status: match.status,
    },
  };
}

export async function mockRegister(
  payload: RegistrationPayload,
): Promise<{ pendingId: string }> {
  await delay();
  const pendingId =
    globalThis.crypto?.randomUUID?.() ?? `pending-${Date.now().toString(36)}`;
  pendingUsers.push({
    id: pendingId,
    name: payload.name,
    email: payload.email,
    agency: payload.agency,
    role: payload.role,
    submittedAt: new Date().toISOString(),
  });
  return { pendingId };
}

export async function mockListPendingUsers(): Promise<PendingUser[]> {
  await delay();
  return pendingUsers;
}

export async function mockApproveUser(userId: string): Promise<void> {
  await delay();
  const pending = pendingUsers.find((user) => user.id === userId);
  if (!pending) {
    throw new Error("Pending user not found");
  }
  pendingUsers = pendingUsers.filter((user) => user.id !== userId);
  approvedUsers.push({
    id: `user-${userId}`,
    username: pending.name,
    email: pending.email,
    role: pending.role,
    status: "approved",
    password: "changeme",
  });
}

export async function mockRejectUser(userId: string): Promise<void> {
  await delay();
  const exists = pendingUsers.some((user) => user.id === userId);
  if (!exists) throw new Error("Pending user not found");
  pendingUsers = pendingUsers.filter((user) => user.id !== userId);
}

export async function mockLoadSession(token: string | null) {
  await delay(100);
  if (!token) return null;
  const [, userId] = token.split("mock-token-");
  const user = approvedUsers.find((u) => token.includes(u.id));
  if (!user) return null;
  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  };
}


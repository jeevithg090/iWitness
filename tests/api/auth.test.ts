import bcrypt from "bcryptjs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { jsonRequest, mockPrisma, prismaError } from "../helpers";

vi.mock("@/lib/prisma", () => ({ default: mockPrisma, prisma: mockPrisma }));

const { POST: signup } = await import("@/app/api/auth/signup/route");
const { verifyCredentials } = await import("@/lib/auth");

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("POST /api/auth/signup", () => {
  it("always creates USER accounts, even if a role is supplied", async () => {
    mockPrisma.user.create.mockImplementation(async ({ data }) => ({
      id: 1,
      name: data.name,
      email: data.email,
      role: data.role,
    }));

    const res = await signup(
      jsonRequest("http://test/api/auth/signup", {
        name: "Mallory",
        email: "Mallory@Example.com",
        password: "supersecret",
        role: "ADMIN",
      }),
    );

    expect(res.status).toBe(201);
    const { data, select } = mockPrisma.user.create.mock.calls[0][0];
    expect(data.role).toBe("USER");
    expect(data.email).toBe("mallory@example.com");
    expect(data.password).not.toBe("supersecret");
    expect(await bcrypt.compare("supersecret", data.password)).toBe(true);
    expect(select).not.toHaveProperty("password");
    expect(await res.json()).not.toHaveProperty("password");
  });

  it("returns 409 for an existing email", async () => {
    mockPrisma.user.create.mockRejectedValue(prismaError("P2002"));
    const res = await signup(
      jsonRequest("http://test/api/auth/signup", {
        name: "Sam",
        email: "sam@example.com",
        password: "supersecret",
      }),
    );
    expect(res.status).toBe(409);
    expect((await res.json()).fields.email).toBeDefined();
  });

  it("returns 400 for invalid input", async () => {
    const res = await signup(
      jsonRequest("http://test/api/auth/signup", { email: "x" }),
    );
    expect(res.status).toBe(400);
    expect(mockPrisma.user.create).not.toHaveBeenCalled();
  });
});

describe("verifyCredentials", () => {
  it("returns the user for a correct password", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 7,
      email: "mod@example.com",
      name: "Mod",
      role: "MODERATOR",
      password: await bcrypt.hash("correct-horse", 4),
    });
    await expect(
      verifyCredentials({
        email: " MOD@example.com ",
        password: "correct-horse",
      }),
    ).resolves.toEqual({
      id: "7",
      email: "mod@example.com",
      name: "Mod",
      role: "MODERATOR",
    });
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "mod@example.com" },
    });
  });

  it("returns null for a wrong password or unknown user", async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce({
      id: 7,
      email: "mod@example.com",
      name: "Mod",
      role: "MODERATOR",
      password: await bcrypt.hash("correct-horse", 4),
    });
    await expect(
      verifyCredentials({ email: "mod@example.com", password: "wrong" }),
    ).resolves.toBeNull();

    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    await expect(
      verifyCredentials({ email: "nobody@example.com", password: "x" }),
    ).resolves.toBeNull();
  });

  it("returns null for malformed input without querying", async () => {
    await expect(verifyCredentials(undefined)).resolves.toBeNull();
    await expect(
      verifyCredentials({ email: "not-an-email", password: "x" }),
    ).resolves.toBeNull();
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
  });
});

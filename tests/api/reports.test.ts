import { beforeEach, describe, expect, it, vi } from "vitest";
import { jsonRequest, mockPrisma, PNG_DATA_URL, prismaError } from "../helpers";

vi.mock("@/lib/prisma", () => ({ default: mockPrisma, prisma: mockPrisma }));
const getStaffSession = vi.fn();
vi.mock("@/lib/auth", () => ({ getStaffSession: () => getStaffSession() }));

const { POST: createReport } = await import("@/app/api/reports/create/route");
const { GET: listReports } = await import("@/app/api/reports/route");
const { PATCH: updateReport } =
  await import("@/app/api/reports/[reportId]/route");
const { GET: reportDetails } =
  await import("@/app/api/reports/[reportId]/details/route");
const { GET: reportImage } =
  await import("@/app/api/reports/[reportId]/image/route");

const params = (reportId: string) => ({
  params: Promise.resolve({ reportId }),
});
const staff = { user: { id: "1", role: "ADMIN", name: "Admin" } };

const validReport = {
  type: "NON_EMERGENCY",
  specificType: "Theft",
  title: "Bike stolen",
  description: "My bicycle was stolen from the rack outside the station.",
  location: "Central Station",
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("POST /api/reports/create", () => {
  it("creates a report with a server-generated ID and forced PENDING status", async () => {
    mockPrisma.report.create.mockImplementation(async ({ data }) => ({
      reportId: data.reportId,
    }));

    const res = await createReport(
      jsonRequest("http://test/api/reports/create", {
        ...validReport,
        reportId: "attacker-chosen",
        status: "RESOLVED",
        image: PNG_DATA_URL,
      }),
    );

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.reportId).toMatch(/^[a-f0-9]{16}$/);

    const { data } = mockPrisma.report.create.mock.calls[0][0];
    expect(data.reportId).toBe(body.reportId);
    expect(data.status).toBe("PENDING");
    expect(data.reportType).toBe("Theft");
    expect(data.image).toBe(PNG_DATA_URL);
  });

  it("returns 400 with field errors for invalid input", async () => {
    const res = await createReport(
      jsonRequest("http://test/api/reports/create", { title: "x" }),
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.fields).toHaveProperty("title");
    expect(mockPrisma.report.create).not.toHaveBeenCalled();
  });

  it("returns 400 for malformed JSON", async () => {
    const res = await createReport(
      jsonRequest("http://test/api/reports/create", "{not json"),
    );
    expect(res.status).toBe(400);
  });

  it("retries on a reportId collision", async () => {
    mockPrisma.report.create
      .mockRejectedValueOnce(prismaError("P2002"))
      .mockImplementationOnce(async ({ data }) => ({
        reportId: data.reportId,
      }));
    const res = await createReport(
      jsonRequest("http://test/api/reports/create", validReport),
    );
    expect(res.status).toBe(201);
    expect(mockPrisma.report.create).toHaveBeenCalledTimes(2);
  });

  it("returns 500 when the database fails", async () => {
    mockPrisma.report.create.mockRejectedValue(new Error("db down"));
    const res = await createReport(
      jsonRequest("http://test/api/reports/create", validReport),
    );
    expect(res.status).toBe(500);
  });
});

describe("GET /api/reports", () => {
  it("requires a staff session", async () => {
    getStaffSession.mockResolvedValue(null);
    const res = await listReports(new Request("http://test/api/reports"));
    expect(res.status).toBe(401);
    expect(mockPrisma.report.findMany).not.toHaveBeenCalled();
  });

  it("returns reports with a hasImage flag and applies filters", async () => {
    getStaffSession.mockResolvedValue(staff);
    mockPrisma.report.findMany
      .mockResolvedValueOnce([{ id: "a" }, { id: "b" }])
      .mockResolvedValueOnce([{ id: "b" }]);

    const res = await listReports(
      new Request("http://test/api/reports?status=PENDING&type=EMERGENCY"),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([
      { id: "a", hasImage: false },
      { id: "b", hasImage: true },
    ]);
    const [listCall] = mockPrisma.report.findMany.mock.calls[0];
    expect(listCall.where).toEqual({ status: "PENDING", type: "EMERGENCY" });
    expect(listCall.select).not.toHaveProperty("image");
  });

  it("rejects invalid filters", async () => {
    getStaffSession.mockResolvedValue(staff);
    const res = await listReports(
      new Request("http://test/api/reports?status=BOGUS"),
    );
    expect(res.status).toBe(400);
  });
});

describe("PATCH /api/reports/:id", () => {
  const patch = (body: unknown) =>
    jsonRequest("http://test/api/reports/abc", body, { method: "PATCH" });

  it("requires a staff session", async () => {
    getStaffSession.mockResolvedValue(null);
    const res = await updateReport(
      patch({ status: "RESOLVED" }),
      params("abc"),
    );
    expect(res.status).toBe(401);
    expect(mockPrisma.report.update).not.toHaveBeenCalled();
  });

  it("updates the status", async () => {
    getStaffSession.mockResolvedValue(staff);
    mockPrisma.report.update.mockResolvedValue({
      id: "abc",
      status: "RESOLVED",
    });
    const res = await updateReport(
      patch({ status: "RESOLVED" }),
      params("abc"),
    );
    expect(res.status).toBe(200);
    expect(mockPrisma.report.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "abc" },
        data: { status: "RESOLVED" },
      }),
    );
  });

  it("rejects unknown statuses", async () => {
    getStaffSession.mockResolvedValue(staff);
    const res = await updateReport(patch({ status: "DELETED" }), params("abc"));
    expect(res.status).toBe(400);
  });

  it("returns 404 for a missing report", async () => {
    getStaffSession.mockResolvedValue(staff);
    mockPrisma.report.update.mockRejectedValue(prismaError("P2025"));
    const res = await updateReport(
      patch({ status: "RESOLVED" }),
      params("missing"),
    );
    expect(res.status).toBe(404);
  });
});

describe("GET /api/reports/:reportId/details", () => {
  it("returns only public fields", async () => {
    mockPrisma.report.findUnique.mockResolvedValue({
      reportId: "0123456789abcdef",
      status: "PENDING",
    });
    const res = await reportDetails(
      new Request("http://test"),
      params("0123456789ABCDEF"),
    );
    expect(res.status).toBe(200);

    const { where, select } = mockPrisma.report.findUnique.mock.calls[0][0];
    expect(where).toEqual({ reportId: "0123456789abcdef" });
    for (const field of [
      "location",
      "latitude",
      "longitude",
      "image",
      "description",
    ]) {
      expect(select).not.toHaveProperty(field);
    }
  });

  it("rejects malformed IDs without querying", async () => {
    const res = await reportDetails(new Request("http://test"), params("nope"));
    expect(res.status).toBe(400);
    expect(mockPrisma.report.findUnique).not.toHaveBeenCalled();
  });

  it("returns 404 for unknown IDs", async () => {
    mockPrisma.report.findUnique.mockResolvedValue(null);
    const res = await reportDetails(
      new Request("http://test"),
      params("0123456789abcdef"),
    );
    expect(res.status).toBe(404);
  });
});

describe("GET /api/reports/:id/image", () => {
  it("requires a staff session", async () => {
    getStaffSession.mockResolvedValue(null);
    const res = await reportImage(new Request("http://test"), params("abc"));
    expect(res.status).toBe(401);
  });

  it("serves the decoded image with its content type", async () => {
    getStaffSession.mockResolvedValue(staff);
    mockPrisma.report.findUnique.mockResolvedValue({ image: PNG_DATA_URL });
    const res = await reportImage(new Request("http://test"), params("abc"));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/png");
    const bytes = new Uint8Array(await res.arrayBuffer());
    expect(Array.from(bytes.slice(1, 4))).toEqual([0x50, 0x4e, 0x47]); // "PNG"
  });

  it("returns 404 when the report has no image", async () => {
    getStaffSession.mockResolvedValue(staff);
    mockPrisma.report.findUnique.mockResolvedValue({ image: null });
    const res = await reportImage(new Request("http://test"), params("abc"));
    expect(res.status).toBe(404);
  });
});

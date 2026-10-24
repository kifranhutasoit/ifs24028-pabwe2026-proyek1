import { describe, it, expect, vi, beforeEach } from "vitest";
import Swal from "sweetalert2";
import {
  showSuccessDialog,
  showErrorDialog,
  showWarningDialog,
  showConfirmDialog,
  formatRupiah,
  formatDate,
  toApiDate,
  getHighestBid,
  isAucationClosed,
  countdownText,
} from "./toolsHelper";

vi.mock("sweetalert2", () => ({ default: { fire: vi.fn() } }));

describe("toolsHelper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("dialog", () => {
    it("showSuccessDialog memanggil Swal dengan ikon success", async () => {
      Swal.fire.mockResolvedValue({});
      await showSuccessDialog("ok");
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({ icon: "success", title: "Berhasil", text: "ok", timer: 1800, showConfirmButton: false })
      );
    });

    it("showErrorDialog memanggil Swal dengan ikon error", async () => {
      Swal.fire.mockResolvedValue({});
      await showErrorDialog("gagal");
      expect(Swal.fire).toHaveBeenCalledWith({ icon: "error", title: "Gagal", text: "gagal" });
    });

    it("showWarningDialog memanggil Swal dengan ikon warning", async () => {
      Swal.fire.mockResolvedValue({});
      await showWarningDialog("hati-hati");
      expect(Swal.fire).toHaveBeenCalledWith({ icon: "warning", title: "Perhatian", text: "hati-hati" });
    });

    it("showConfirmDialog mengembalikan true jika dikonfirmasi", async () => {
      Swal.fire.mockResolvedValue({ isConfirmed: true });
      await expect(showConfirmDialog("yakin?")).resolves.toBe(true);
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({ icon: "question", showCancelButton: true, confirmButtonText: "Ya", cancelButtonText: "Batal" })
      );
    });

    it("showConfirmDialog mengembalikan false jika dibatalkan", async () => {
      Swal.fire.mockResolvedValue({ isConfirmed: false });
      await expect(showConfirmDialog("yakin?")).resolves.toBe(false);
    });
  });

  describe("formatRupiah", () => {
    it("memformat angka ke Rupiah", () => {
      expect(formatRupiah(10000)).toContain("10.000");
      expect(formatRupiah("2500")).toContain("2.500");
    });

    it("nilai tidak valid menjadi 0", () => {
      expect(formatRupiah("abc")).toContain("0");
      expect(formatRupiah(undefined)).toContain("0");
    });
  });

  describe("formatDate", () => {
    it("mengembalikan '-' jika kosong", () => {
      expect(formatDate("")).toBe("-");
      expect(formatDate(null)).toBe("-");
    });

    it("memformat tanggal valid", () => {
      const result = formatDate("2026-10-10T10:00:00");
      expect(result).not.toBe("-");
      expect(result).toMatch(/2026/);
    });
  });

  describe("toApiDate", () => {
    it("mengubah format datetime-local ke format API", () => {
      expect(toApiDate("2026-10-10T10:00")).toBe("2026-10-10 10:00:00");
    });

    it("mengembalikan string kosong jika kosong", () => {
      expect(toApiDate("")).toBe("");
      expect(toApiDate(undefined)).toBe("");
    });
  });

  describe("getHighestBid", () => {
    it("mengambil bid tertinggi", () => {
      expect(getHighestBid({ start_bid: 1000, bids: [{ bid: 2000 }, { bid: 5000 }, { bid: 3000 }] })).toBe(5000);
    });

    it("memakai harga awal jika lebih besar dari semua bid", () => {
      expect(getHighestBid({ start_bid: 9000, bids: [{ bid: 2000 }] })).toBe(9000);
    });

    it("bid tidak valid dianggap 0", () => {
      expect(getHighestBid({ start_bid: 1000, bids: [{ bid: "x" }, {}] })).toBe(1000);
    });

    it("aman untuk data kosong", () => {
      expect(getHighestBid({ start_bid: 500 })).toBe(500);
      expect(getHighestBid({})).toBe(0);
      expect(getHighestBid(undefined)).toBe(0);
      expect(getHighestBid(null)).toBe(0);
    });
  });

  describe("isAucationClosed", () => {
    const now = new Date("2026-10-10T10:00:00").getTime();

    it("true jika is_closed true", () => {
      expect(isAucationClosed({ is_closed: true }, now)).toBe(true);
    });

    it("true jika closed_at sudah lewat", () => {
      expect(isAucationClosed({ closed_at: "2026-10-09T10:00:00" }, now)).toBe(true);
    });

    it("false jika closed_at belum lewat", () => {
      expect(isAucationClosed({ closed_at: "2026-10-11T10:00:00" }, now)).toBe(false);
    });

    it("false jika tidak ada closed_at atau data kosong", () => {
      expect(isAucationClosed({}, now)).toBe(false);
      expect(isAucationClosed(undefined, now)).toBe(false);
    });

    it("memakai Date.now() sebagai default", () => {
      expect(isAucationClosed({ closed_at: "2000-01-01T00:00:00" })).toBe(true);
    });
  });

  describe("countdownText", () => {
    const now = new Date("2026-10-10T10:00:00").getTime();

    it("'Ditutup' jika closedAt kosong", () => {
      expect(countdownText(undefined, now)).toBe("Ditutup");
      expect(countdownText("", now)).toBe("Ditutup");
    });

    it("'Ditutup' jika waktu sudah lewat", () => {
      expect(countdownText("2026-10-09T10:00:00", now)).toBe("Ditutup");
    });

    it("menampilkan hari dan jam jika lebih dari sehari", () => {
      expect(countdownText("2026-10-12T13:00:00", now)).toBe("2 hari 3 jam lagi");
    });

    it("menampilkan jam dan menit jika kurang dari sehari", () => {
      expect(countdownText("2026-10-10T12:30:00", now)).toBe("2 jam 30 menit lagi");
    });

    it("memakai Date.now() sebagai default", () => {
      expect(countdownText("2000-01-01T00:00:00")).toBe("Ditutup");
    });
  });
});
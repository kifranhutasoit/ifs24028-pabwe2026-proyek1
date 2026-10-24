import { describe, it, expect, vi, beforeEach } from "vitest";
import ChangeCoverModal from "./ChangeCoverModal.vue";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("ChangeCoverModal", () => {
  const mockAucation = { id: 10, title: "Lelang Jam Tangan" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render when show is false or aucation is null", () => {
    const { wrapper } = renderWithProviders(ChangeCoverModal, {
      props: { show: false, aucation: mockAucation },
    });
    expect(wrapper.find('[data-testid="change-cover-modal"]').exists()).toBe(false);

    const { wrapper: wrapper2 } = renderWithProviders(ChangeCoverModal, {
      props: { show: true, aucation: null },
    });
    expect(wrapper2.find('[data-testid="change-cover-modal"]').exists()).toBe(false);
  });

  it("should validate file selection when submit without file", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(ChangeCoverModal, {
      props: { show: true, aucation: mockAucation },
    });

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(errorSpy).toHaveBeenCalledWith("Pilih file cover terlebih dahulu!");
  });

  it("should reject file with invalid mime type", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(ChangeCoverModal, {
      props: { show: true, aucation: mockAucation },
    });

    const fileInput = wrapper.find('[data-testid="cover-file-input"]');
    const fakePdf = new File(["dummy content"], "doc.pdf", { type: "application/pdf" });

    Object.defineProperty(fileInput.element, "files", {
      value: [fakePdf],
      writable: true,
    });
    await fileInput.trigger("change");

    expect(errorSpy).toHaveBeenCalledWith("Hanya file JPEG, JPG, atau PNG yang diperbolehkan!");
  });

  it("should reject file larger than 1MB", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(ChangeCoverModal, {
      props: { show: true, aucation: mockAucation },
    });

    const fileInput = wrapper.find('[data-testid="cover-file-input"]');
    const largeContent = new Uint8Array(1024 * 1024 + 100);
    const fakeLargeFile = new File([largeContent], "huge.png", { type: "image/png" });

    Object.defineProperty(fileInput.element, "files", {
      value: [fakeLargeFile],
      writable: true,
    });
    await fileInput.trigger("change");

    expect(errorSpy).toHaveBeenCalledWith("Ukuran file terlalu besar. Maksimal 1MB!");
  });

  it("should accept valid file, show preview, and submit successfully", async () => {
    global.URL.createObjectURL = vi.fn(() => "blob:http://localhost/preview-123");

    const { wrapper, aucationsStore } = renderWithProviders(ChangeCoverModal, {
      props: { show: true, aucation: mockAucation },
      preloadedState: {
        isAucationChangedCover: false,
      },
    });

    const postCoverSpy = vi
      .spyOn(aucationsStore, "asyncPostAucationCover")
      .mockReturnValue(Promise.resolve());

    const fileInput = wrapper.find('[data-testid="cover-file-input"]');
    const validFile = new File(["sample"], "image.png", { type: "image/png" });

    Object.defineProperty(fileInput.element, "files", {
      value: [validFile],
      writable: true,
    });
    await fileInput.trigger("change");

    expect(wrapper.find("img").attributes("src")).toBe("blob:http://localhost/preview-123");

    await wrapper.find("form").trigger("submit");
    expect(postCoverSpy).toHaveBeenCalledWith(10, validFile);

    aucationsStore.setIsAucationChangedCover(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.emitted("success")).toBeTruthy();
    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("should close modal when close or cancel button clicked", async () => {
    const { wrapper } = renderWithProviders(ChangeCoverModal, {
      props: { show: true, aucation: mockAucation },
    });

    await wrapper.find('[data-testid="close-cover-modal-btn"]').trigger("click");
    expect(wrapper.emitted("close")).toBeTruthy();

    await wrapper.find('[data-testid="cancel-cover-modal-btn"]').trigger("click");
    expect(wrapper.emitted("close").length).toBe(2);
  });

  it("should do nothing when change event triggered without files", async () => {
    const { wrapper } = renderWithProviders(ChangeCoverModal, {
      props: { show: true, aucation: mockAucation },
    });

    const fileInput = wrapper.find('[data-testid="cover-file-input"]');
    Object.defineProperty(fileInput.element, "files", {
      value: [],
      writable: true,
    });
    await fileInput.trigger("change");

    expect(wrapper.find("img").exists()).toBe(false);
  });
});

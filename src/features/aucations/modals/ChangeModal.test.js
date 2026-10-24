import { describe, it, expect, vi, beforeEach } from "vitest";
import ChangeModal from "./ChangeModal.vue";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("ChangeModal", () => {
  const mockAucation = {
    id: 1,
    title: "Initial Title",
    description: "Initial Desc",
    start_bid: 500000,
    closed_at: "2026-12-31 23:59:00",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render when show is false", () => {
    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: false, aucationId: 1 },
    });
    expect(wrapper.find('[data-testid="edit-aucation-modal"]').exists()).toBe(false);
  });

  it("should populate inputs with aucation data and handle changes", async () => {
    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: true, aucationId: 1 },
      preloadedState: {
        aucation: mockAucation,
      },
    });

    const titleInput = wrapper.find('[data-testid="edit-aucation-title-input"]');
    const startBidInput = wrapper.find('[data-testid="edit-aucation-start-bid-input"]');
    const closedAtInput = wrapper.find('[data-testid="edit-aucation-closed-at-input"]');
    const descInput = wrapper.find('[data-testid="edit-aucation-description-input"]');

    expect(titleInput.element.value).toBe("Initial Title");
    expect(startBidInput.element.value).toBe("500000");
    expect(closedAtInput.element.value).toBe("2026-12-31T23:59");
    expect(descInput.element.value).toBe("Initial Desc");
  });

  it("should handle empty fields in aucation object", async () => {
    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: true, aucationId: 1 },
      preloadedState: {
        aucation: { id: 1, title: null, description: null, start_bid: null, closed_at: null },
      },
    });

    expect(wrapper.find('[data-testid="edit-aucation-title-input"]').element.value).toBe("");
    expect(wrapper.find('[data-testid="edit-aucation-closed-at-input"]').element.value).toBe("");
  });

  it("should trigger asyncSetAucationById when aucationId and show are true", async () => {
    const { wrapper, aucationsStore } = renderWithProviders(ChangeModal, {
      props: { show: false, aucationId: 42 },
    });
    const setSpy = vi.spyOn(aucationsStore, "asyncSetAucationById").mockResolvedValue();

    await wrapper.setProps({ show: true });
    expect(setSpy).toHaveBeenCalledWith(42);
  });

  it("should validate empty title, startBid, closedAt, and description", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: true, aucationId: 1 },
      preloadedState: {
        aucation: mockAucation,
      },
    });

    const titleInput = wrapper.find('[data-testid="edit-aucation-title-input"]');
    const startBidInput = wrapper.find('[data-testid="edit-aucation-start-bid-input"]');
    const closedAtInput = wrapper.find('[data-testid="edit-aucation-closed-at-input"]');
    const descInput = wrapper.find('[data-testid="edit-aucation-description-input"]');
    const form = wrapper.find("form");

    // Title empty
    await titleInput.setValue("   ");
    await form.trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Judul lelang tidak boleh kosong!");

    // StartBid invalid
    await titleInput.setValue("Judul Baru");
    await startBidInput.setValue("0");
    await form.trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Harga jual lelang harus lebih dari 0!");

    // ClosedAt empty
    await startBidInput.setValue("100000");
    await closedAtInput.setValue("");
    await form.trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Batas waktu penutupan lelang wajib diisi!");

    // Desc empty
    await closedAtInput.setValue("2026-12-31T23:59");
    await descInput.setValue("   ");
    await form.trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Deskripsi lelang tidak boleh kosong!");
  });

  it("should dispatch asyncPutAucation and close on success", async () => {
    const { wrapper, aucationsStore } = renderWithProviders(ChangeModal, {
      props: { show: true, aucationId: 1 },
      preloadedState: {
        aucation: mockAucation,
        isAucationChanged: false,
      },
    });

    const putSpy = vi.spyOn(aucationsStore, "asyncPutAucation").mockReturnValue(Promise.resolve());

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(putSpy).toHaveBeenCalledWith(
      1,
      "Initial Title",
      "Initial Desc",
      500000,
      "2026-12-31 23:59:00"
    );

    // Simulate completion
    aucationsStore.setIsAucationChanged(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.emitted("success")).toBeTruthy();
    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("should close modal when close button or cancel button clicked", async () => {
    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: true, aucationId: 1 },
      preloadedState: { aucation: mockAucation },
    });

    await wrapper.find('[data-testid="close-edit-modal-btn"]').trigger("click");
    expect(wrapper.emitted("close")).toBeTruthy();

    await wrapper.find('[data-testid="cancel-edit-modal-btn"]').trigger("click");
    expect(wrapper.emitted("close").length).toBe(2);
  });

  it("should handle closedAt with seconds when saving in ChangeModal", async () => {
    const { wrapper, aucationsStore } = renderWithProviders(ChangeModal, {
      props: { show: true, aucationId: 1 },
      preloadedState: { aucation: mockAucation },
    });

    const putSpy = vi.spyOn(aucationsStore, "asyncPutAucation").mockResolvedValue();

    const closedAtInput = wrapper.find('[data-testid="edit-aucation-closed-at-input"]');
    await closedAtInput.setValue("2026-12-31T23:59:59");

    await wrapper.find("form").trigger("submit");
    expect(putSpy).toHaveBeenCalledWith(
      1,
      "Initial Title",
      "Initial Desc",
      500000,
      "2026-12-31 23:59:59"
    );
  });
});

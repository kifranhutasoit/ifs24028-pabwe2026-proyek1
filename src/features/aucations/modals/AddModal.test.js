import { describe, it, expect, vi, beforeEach } from "vitest";
import AddModal from "./AddModal.vue";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("AddModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render when show is false", () => {
    const { wrapper } = renderWithProviders(AddModal, {
      props: { show: false },
    });
    expect(wrapper.find('[data-testid="add-aucation-modal"]').exists()).toBe(false);
  });

  it("should show validation error if title is empty", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(AddModal, {
      props: { show: true },
    });

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(errorSpy).toHaveBeenCalledWith("Judul lelang tidak boleh kosong!");
  });

  it("should show validation error if startBid is invalid", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(AddModal, {
      props: { show: true },
    });

    await wrapper.find('[data-testid="add-aucation-title-input"]').setValue("Barang");
    await wrapper.find("form").trigger("submit");

    expect(errorSpy).toHaveBeenCalledWith("Harga jual lelang harus lebih dari 0!");
  });

  it("should show validation error if closedAt is empty", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(AddModal, {
      props: { show: true },
    });

    await wrapper.find('[data-testid="add-aucation-title-input"]').setValue("Barang");
    await wrapper.find('[data-testid="add-aucation-start-bid-input"]').setValue("50000");
    await wrapper.find("form").trigger("submit");

    expect(errorSpy).toHaveBeenCalledWith("Batas waktu penutupan lelang wajib diisi!");
  });

  it("should show validation error if description is empty", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(AddModal, {
      props: { show: true },
    });

    await wrapper.find('[data-testid="add-aucation-title-input"]').setValue("Barang");
    await wrapper.find('[data-testid="add-aucation-start-bid-input"]').setValue("50000");
    await wrapper.find('[data-testid="add-aucation-closed-at-input"]').setValue("2026-12-31T23:59");
    await wrapper.find("form").trigger("submit");

    expect(errorSpy).toHaveBeenCalledWith("Deskripsi lelang tidak boleh kosong!");
  });

  it("should dispatch asyncPostAucation and close modal on success", async () => {
    const { wrapper, aucationsStore } = renderWithProviders(AddModal, {
      props: { show: true },
      preloadedState: {
        isAucationAdded: false,
      },
    });

    const postSpy = vi
      .spyOn(aucationsStore, "asyncPostAucation")
      .mockReturnValue(Promise.resolve());

    await wrapper.find('[data-testid="add-aucation-title-input"]').setValue("MacBook M2");
    await wrapper.find('[data-testid="add-aucation-start-bid-input"]').setValue("10000000");
    await wrapper.find('[data-testid="add-aucation-closed-at-input"]').setValue("2026-12-31T23:59");
    await wrapper.find('[data-testid="add-aucation-description-input"]').setValue("Kondisi mulus");

    await wrapper.find("form").trigger("submit");

    expect(postSpy).toHaveBeenCalledWith(
      "MacBook M2",
      "Kondisi mulus",
      10000000,
      "2026-12-31 23:59:00"
    );

    aucationsStore.setIsAucationAdded(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.emitted("success")).toBeTruthy();
    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("should close modal when close or cancel button clicked", async () => {
    const { wrapper } = renderWithProviders(AddModal, {
      props: { show: true },
    });

    const closeBtn = wrapper.find('[data-testid="close-add-modal-btn"]');
    await closeBtn.trigger("click");
    expect(wrapper.emitted("close")?.length).toBe(1);

    const cancelBtn = wrapper.find('[data-testid="cancel-add-modal-btn"]');
    await cancelBtn.trigger("click");
    expect(wrapper.emitted("close")?.length).toBe(2);
  });

  it("should reset form when show prop changes to true and handle closedAt with seconds", async () => {
    const { wrapper, aucationsStore } = renderWithProviders(AddModal, {
      props: { show: false },
    });

    await wrapper.setProps({ show: true });
    expect(wrapper.find('[data-testid="add-aucation-title-input"]').element.value).toBe("");

    const postSpy = vi.spyOn(aucationsStore, "asyncPostAucation").mockResolvedValue();

    await wrapper.find('[data-testid="add-aucation-title-input"]').setValue("iPhone");
    await wrapper.find('[data-testid="add-aucation-start-bid-input"]').setValue("5000000");
    await wrapper.find('[data-testid="add-aucation-closed-at-input"]').setValue("2026-12-31T23:59:59");
    await wrapper.find('[data-testid="add-aucation-description-input"]').setValue("Baru");

    await wrapper.find("form").trigger("submit");
    expect(postSpy).toHaveBeenCalledWith("iPhone", "Baru", 5000000, "2026-12-31 23:59:59");
  });
});

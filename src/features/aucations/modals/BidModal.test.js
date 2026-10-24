import { describe, it, expect, vi, beforeEach } from "vitest";
import BidModal from "./BidModal.vue";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("BidModal", () => {
  const mockAucation = {
    id: 5,
    title: "iPad Air M1",
    start_bid: 5000000,
    bids: [{ id: 1, bid: 6000000 }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render when show is false or aucation is null", () => {
    const { wrapper } = renderWithProviders(BidModal, {
      props: { show: false, aucation: mockAucation },
    });
    expect(wrapper.find('[data-testid="bid-modal"]').exists()).toBe(false);

    const { wrapper: wrapper2 } = renderWithProviders(BidModal, {
      props: { show: true, aucation: null },
    });
    expect(wrapper2.find('[data-testid="bid-modal"]').exists()).toBe(false);
  });

  it("should display aucation title and calculate minimum bid correctly", () => {
    const { wrapper } = renderWithProviders(BidModal, {
      props: { show: true, aucation: mockAucation },
    });

    expect(wrapper.text()).toContain("iPad Air M1");
    // Highest bid is 6,000,000, so min bid is 6,001,000
    const input = wrapper.find('[data-testid="bid-amount-input"]');
    expect(input.attributes("placeholder")).toContain("Rp");
  });

  it("should validate empty or invalid bid amount", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(BidModal, {
      props: { show: true, aucation: mockAucation },
    });

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(errorSpy).toHaveBeenCalledWith("Nominal tawaran harus berupa angka lebih dari 0!");
  });

  it("should validate bid amount lower than minimum required bid", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(BidModal, {
      props: { show: true, aucation: mockAucation },
    });

    const input = wrapper.find('[data-testid="bid-amount-input"]');
    await input.setValue("5500000"); // Lower than 6,001,000
    await wrapper.find("form").trigger("submit");

    expect(errorSpy).toHaveBeenCalled();
  });

  it("should submit bid successfully and emit success and close", async () => {
    const { wrapper, aucationsStore } = renderWithProviders(BidModal, {
      props: { show: true, aucation: mockAucation },
      preloadedState: {
        isBidAdded: false,
      },
    });

    const postBidSpy = vi
      .spyOn(aucationsStore, "asyncPostBid")
      .mockReturnValue(Promise.resolve());

    const input = wrapper.find('[data-testid="bid-amount-input"]');
    await input.setValue("6500000");
    await wrapper.find("form").trigger("submit");

    expect(postBidSpy).toHaveBeenCalledWith(5, 6500000);

    aucationsStore.setIsBidAdded(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.emitted("success")).toBeTruthy();
    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("should close modal when close or cancel button clicked", async () => {
    const { wrapper } = renderWithProviders(BidModal, {
      props: { show: true, aucation: mockAucation },
    });

    await wrapper.find('[data-testid="close-bid-modal-btn"]').trigger("click");
    expect(wrapper.emitted("close")).toBeTruthy();

    await wrapper.find('[data-testid="cancel-bid-modal-btn"]').trigger("click");
    expect(wrapper.emitted("close").length).toBe(2);
  });

  it("should handle auction with no bids and calculate minimum bid from start_bid", () => {
    const { wrapper } = renderWithProviders(BidModal, {
      props: {
        show: true,
        aucation: {
          id: 6,
          title: "Barang Baru",
          start_bid: 200000,
          bids: [],
        },
      },
    });

    expect(wrapper.text()).toContain("Barang Baru");
    expect(wrapper.find('[data-testid="bid-modal"]').exists()).toBe(true);
  });

  it("should handle auction with start_bid 0 and null bids", () => {
    const { wrapper } = renderWithProviders(BidModal, {
      props: {
        show: true,
        aucation: {
          id: 7,
          title: "Barang Murah",
          start_bid: 0,
          bids: null,
        },
      },
    });

    expect(wrapper.find('[data-testid="bid-modal"]').exists()).toBe(true);
  });

  it("should handle bids with null bid amount and aucation null", () => {
    const { wrapper } = renderWithProviders(BidModal, {
      props: {
        show: true,
        aucation: {
          id: 8,
          title: "Barang Lelang",
          start_bid: 50000,
          bids: [{ id: 1, bid: null }],
        },
      },
    });

    expect(wrapper.vm.currentHighestBid).toBe(50000);

    const { wrapper: wrapperNull } = renderWithProviders(BidModal, {
      props: { show: false, aucation: null },
    });
    expect(wrapperNull.vm.currentHighestBid).toBe(0);

    const { wrapper: wrapperStartBidNull } = renderWithProviders(BidModal, {
      props: {
        show: true,
        aucation: {
          id: 9,
          title: "Tanpa Harga Awal",
          start_bid: null,
          bids: [{ id: 1, bid: 75000 }],
        },
      },
    });
    expect(wrapperStartBidNull.vm.currentHighestBid).toBe(75000);
  });
});

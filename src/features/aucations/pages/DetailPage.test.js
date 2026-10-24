import { describe, it, expect, vi, beforeEach } from "vitest";
import DetailPage from "./DetailPage.vue";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import { reactive } from "vue";

const mockRouter = {
  push: vi.fn(),
};

const mockRoute = reactive({ params: { id: "1" } });

vi.mock("vue-router", async () => {
  const actual = await vi.importActual("vue-router");
  return {
    ...actual,
    useRouter: () => mockRouter,
    useRoute: () => mockRoute,
  };
});

describe("DetailPage", () => {
  const mockProfile = { id: 1, name: "Yogi", email: "yogi@delcom.org", role: "admin" };
  const mockAucation = {
    id: 1,
    title: "PlayStation 5 Pro",
    description: "Konsol game mulus komplit",
    start_bid: 8000000,
    closed_at: "2026-12-31 23:59:00",
    is_closed: 0,
    cover: "https://example.com/ps5.jpg",
    created_at: "2026-01-01T00:00:00.000Z",
    author_id: 1,
    author: { id: 1, name: "Yogi" },
    bids: [
      {
        id: 101,
        user_id: 1,
        bid: 9500000,
        created_at: "2026-01-02T10:00:00.000Z",
        user: { id: 1, name: "Yogi" },
      },
      {
        id: 102,
        user_id: 2,
        bid: 9000000,
        created_at: "2026-01-01T12:00:00.000Z",
        user: { id: 2, name: "Budi" },
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading spinner if profile or aucation is missing", () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      preloadedState: {
        profile: null,
        aucation: null,
      },
    });

    expect(wrapper.text()).not.toContain("PlayStation 5 Pro");
  });

  it("should render auction details, bids list, and open/close modals", async () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      preloadedState: {
        profile: mockProfile,
        aucation: mockAucation,
      },
    });

    expect(wrapper.text()).toContain("PlayStation 5 Pro");
    expect(wrapper.text()).toContain("Konsol game mulus komplit");
    expect(wrapper.text()).toContain("Sedang Berlangsung");
    expect(wrapper.text()).toContain("Riwayat Penawaran (2)");

    // Test Place Bid button
    const placeBidBtn = wrapper.find('[data-testid="place-bid-btn"]');
    await placeBidBtn.trigger("click");
    expect(wrapper.find('[data-testid="bid-modal"]').exists()).toBe(true);

    const closeBidBtn = wrapper.find('[data-testid="close-bid-modal-btn"]');
    await closeBidBtn.trigger("click");
    expect(wrapper.find('[data-testid="bid-modal"]').exists()).toBe(false);

    // Test Edit Cover button
    const editCoverBtn = wrapper.find('[data-testid="edit-cover-btn"]');
    await editCoverBtn.trigger("click");
    expect(wrapper.find('[data-testid="change-cover-modal"]').exists()).toBe(true);

    const closeCoverBtn = wrapper.find('[data-testid="close-cover-modal-btn"]');
    await closeCoverBtn.trigger("click");
    expect(wrapper.find('[data-testid="change-cover-modal"]').exists()).toBe(false);

    // Test Edit Auction button
    const editDetailBtn = wrapper.find('[data-testid="edit-detail-aucation-btn"]');
    await editDetailBtn.trigger("click");
    expect(wrapper.find('[data-testid="edit-aucation-modal"]').exists()).toBe(true);

    const closeEditBtn = wrapper.find('[data-testid="close-edit-modal-btn"]');
    await closeEditBtn.trigger("click");
    expect(wrapper.find('[data-testid="edit-aucation-modal"]').exists()).toBe(false);
  });

  it("should render closed auction state and empty description fallback", () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      preloadedState: {
        profile: mockProfile,
        aucation: {
          ...mockAucation,
          is_closed: 1,
          description: "",
          cover: null,
          author: null,
          bids: [],
        },
      },
    });

    expect(wrapper.text()).toContain("Sudah Ditutup");
    expect(wrapper.text()).toContain("Tidak ada deskripsi rinci untuk barang ini.");
    expect(wrapper.text()).toContain("Belum ada penawaran yang diajukan");
    expect(wrapper.find('[data-testid="place-bid-btn"]').exists()).toBe(false);
  });

  it("should handle auction deletion with confirmation dialog", async () => {
    const { wrapper, aucationsStore } = renderWithProviders(DetailPage, {
      preloadedState: {
        profile: mockProfile,
        aucation: mockAucation,
      },
    });

    const deleteSpy = vi
      .spyOn(aucationsStore, "asyncDeleteAucation")
      .mockReturnValue(Promise.resolve());

    // Canceled by user
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false });
    const deleteBtn = wrapper.find('[data-testid="delete-detail-aucation-btn"]');
    await deleteBtn.trigger("click");
    expect(deleteSpy).not.toHaveBeenCalled();

    // Confirmed by user
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true });
    await deleteBtn.trigger("click");
    expect(deleteSpy).toHaveBeenCalledWith(1);
  });

  it("should handle bid cancellation with confirmation dialog", async () => {
    const { wrapper, aucationsStore } = renderWithProviders(DetailPage, {
      preloadedState: {
        profile: mockProfile,
        aucation: mockAucation,
      },
    });

    const cancelBidSpy = vi
      .spyOn(aucationsStore, "asyncDeleteBid")
      .mockReturnValue(Promise.resolve());

    // Confirmed by user
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true });
    const cancelBidBtn = wrapper.find('[data-testid="delete-bid-btn-101"]');
    await cancelBidBtn.trigger("click");
    expect(cancelBidSpy).toHaveBeenCalledWith(1);
  });

  it("should redirect to / when isAucation is true and aucation is null or when deleted", async () => {
    const { aucationsStore } = renderWithProviders(DetailPage, {
      preloadedState: {
        profile: mockProfile,
        aucation: null,
        isAucation: false,
        isAucationDeleted: false,
      },
    });

    aucationsStore.setIsAucation(true);
    await new Promise((r) => setTimeout(r, 10));
    expect(mockRouter.push).toHaveBeenCalledWith("/");

    aucationsStore.setIsAucationDeleted(true);
    await new Promise((r) => setTimeout(r, 10));
    expect(mockRouter.push).toHaveBeenCalledWith("/");
  });

  it("should reload detail when route id changes", async () => {
    const { aucationsStore } = renderWithProviders(DetailPage, {
      preloadedState: {
        profile: mockProfile,
        aucation: mockAucation,
      },
    });

    const setSpy = vi.spyOn(aucationsStore, "asyncSetAucationById").mockResolvedValue();
    mockRoute.params.id = "99";
    await new Promise((r) => setTimeout(r, 10));

    expect(setSpy).toHaveBeenCalledWith("99");
  });

  it("should handle permissions for regular non-admin user", () => {
    // 1. Regular user who is the author
    const regularAuthorProfile = { id: 1, name: "Author User", role: "user" };
    const { wrapper: wrapperAuthor } = renderWithProviders(DetailPage, {
      preloadedState: {
        profile: regularAuthorProfile,
        aucation: mockAucation,
      },
    });
    expect(wrapperAuthor.find('[data-testid="edit-detail-aucation-btn"]').exists()).toBe(true);

    // 2. Regular user who is NOT the author
    const regularOtherProfile = { id: 99, name: "Other User", role: "user" };
    const { wrapper: wrapperOther } = renderWithProviders(DetailPage, {
      preloadedState: {
        profile: regularOtherProfile,
        aucation: mockAucation,
      },
    });
    expect(wrapperOther.find('[data-testid="edit-detail-aucation-btn"]').exists()).toBe(false);
    expect(wrapperOther.find('[data-testid="delete-bid-btn-101"]').exists()).toBe(false);
  });

  it("should handle dismissing cancel bid dialog and handle isAucation true when auction exists", async () => {
    const { wrapper, aucationsStore } = renderWithProviders(DetailPage, {
      preloadedState: {
        profile: mockProfile,
        aucation: mockAucation,
      },
    });

    const cancelBidSpy = vi.spyOn(aucationsStore, "asyncDeleteBid").mockResolvedValue();
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false });

    const cancelBtn = wrapper.find('[data-testid="delete-bid-btn-101"]');
    await cancelBtn.trigger("click");
    expect(cancelBidSpy).not.toHaveBeenCalled();

    // Trigger isAucation true with aucation non-null
    aucationsStore.setIsAucation(true);
    await new Promise((r) => setTimeout(r, 10));

    // Route param empty
    mockRoute.params.id = "";
    await new Promise((r) => setTimeout(r, 10));
  });

  it("should handle null profile in canManage and canCancelBid and zero bid amount", () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      preloadedState: {
        profile: null,
        aucation: {
          ...mockAucation,
          bids: [{ id: 99, bid: 0, user: { id: 1 } }],
        },
      },
    });

    expect(wrapper.vm.canManage).toBe(false);
    expect(wrapper.vm.canCancelBid({ user: { id: 1 } })).toBe(false);
    expect(wrapper.vm.highestBid).toBe(0);

    const { wrapper: wrapperNoAucation } = renderWithProviders(DetailPage, {
      preloadedState: {
        profile: mockProfile,
        aucation: null,
      },
    });
    expect(wrapperNoAucation.vm.bidsList).toEqual([]);

    const { wrapper: wrapperStartBidNull } = renderWithProviders(DetailPage, {
      preloadedState: {
        profile: mockProfile,
        aucation: { id: 88, title: "Test", start_bid: null, bids: [] },
      },
    });
    expect(wrapperStartBidNull.vm.highestBid).toBe(0);
  });
});

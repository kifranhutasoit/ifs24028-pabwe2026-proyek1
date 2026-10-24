import { describe, it, expect, vi, beforeEach } from "vitest";
import HomePage from "./HomePage.vue";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

const mockRouter = {
  push: vi.fn(),
};

vi.mock("vue-router", async () => {
  const actual = await vi.importActual("vue-router");
  return {
    ...actual,
    useRouter: () => mockRouter,
  };
});

describe("HomePage", () => {
  const mockProfile = { id: 1, name: "Yogi", email: "yogi@delcom.org", role: "admin" };
  const mockAucations = [
    {
      id: 1,
      title: "MacBook Pro M2",
      description: "Laptop mulus",
      start_bid: 15000000,
      closed_at: "2026-12-31 23:59:00",
      is_closed: 0,
      cover: "https://example.com/cover1.jpg",
      author_id: 1,
      author: { id: 1, name: "Yogi" },
    },
    {
      id: 2,
      title: "iPhone 15 Pro",
      description: "Kondisi baru",
      start_bid: 12000000,
      closed_at: "2026-01-01 10:00:00",
      is_closed: 1,
      cover: null,
      author_id: 2,
      author: { id: 2, name: "Budi" },
    },
    {
      id: 3,
      title: "iPad Air 5",
      description: "Tanpa author",
      start_bid: 9000000,
      closed_at: "2026-06-01 10:00:00",
      is_closed: 0,
      cover: null,
      author_id: 3,
      author: null,
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should return null/empty if profile is not present", () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: { profile: null },
    });
    expect(wrapper.find('[data-testid="add-aucation-btn"]').exists()).toBe(false);
  });

  it("should render aucations stats, rows, and empty state when empty", async () => {
    const { wrapper, aucationsStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        aucations: [],
      },
    });

    vi.spyOn(aucationsStore, "asyncSetAucations").mockResolvedValue();

    expect(wrapper.text()).toContain("Daftar Sesi Lelang");
    expect(wrapper.text()).toContain("Belum ada sesi lelang yang sesuai kriteria.");
  });

  it("should display loading indicator while loading aucations", async () => {
    const { wrapper, aucationsStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        aucations: [],
      },
    });

    vi.spyOn(aucationsStore, "asyncSetAucations").mockReturnValue(new Promise(() => {}));
    const filterActiveBtn = wrapper.find('[data-testid="filter-active-btn"]');
    await filterActiveBtn.trigger("click");

    expect(wrapper.text()).toContain("Memuat daftar lelang...");
  });

  it("should display stats count, filter and search aucations", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        aucations: mockAucations,
      },
    });

    expect(wrapper.text()).toContain("Total Lelang");
    expect(wrapper.text()).toContain("MacBook Pro M2");
    expect(wrapper.text()).toContain("iPhone 15 Pro");

    // Search filter
    const searchInput = wrapper.find('[data-testid="search-aucation-input"]');
    await searchInput.setValue("MacBook");

    expect(wrapper.text()).toContain("MacBook Pro M2");
    expect(wrapper.text()).not.toContain("iPhone 15 Pro");

    // Search by description
    await searchInput.setValue("baru");
    expect(wrapper.text()).toContain("iPhone 15 Pro");
    expect(wrapper.text()).not.toContain("MacBook Pro M2");
  });

  it("should navigate to detail page when view button clicked", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        aucations: mockAucations,
      },
    });

    const viewBtn = wrapper.find('[data-testid="view-aucation-1"]');
    await viewBtn.trigger("click");

    expect(mockRouter.push).toHaveBeenCalledWith("/aucations/1");
  });

  it("should open edit modal when edit button clicked", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        aucations: mockAucations,
      },
    });

    const editBtn = wrapper.find('[data-testid="edit-aucation-1"]');
    await editBtn.trigger("click");

    expect(wrapper.find('[data-testid="edit-aucation-modal"]').exists()).toBe(true);
  });

  it("should open add modal when add button clicked", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        aucations: mockAucations,
      },
    });

    const addBtn = wrapper.find('[data-testid="add-aucation-btn"]');
    await addBtn.trigger("click");

    expect(wrapper.find('[data-testid="add-aucation-modal"]').exists()).toBe(true);
  });

  it("should handle delete auction confirmation and cancellation", async () => {
    const { wrapper, aucationsStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        aucations: mockAucations,
      },
    });

    const deleteSpy = vi
      .spyOn(aucationsStore, "asyncDeleteAucation")
      .mockReturnValue(Promise.resolve());

    // User cancels confirm dialog
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false });
    const deleteBtn = wrapper.find('[data-testid="delete-aucation-1"]');
    await deleteBtn.trigger("click");
    expect(deleteSpy).not.toHaveBeenCalled();

    // User confirms confirm dialog
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true });
    await deleteBtn.trigger("click");
    expect(deleteSpy).toHaveBeenCalledWith(1);
  });

  it("should trigger loadAucations when filter is_me or is_closed changes or isAucationDeleted becomes true", async () => {
    const { wrapper, aucationsStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        aucations: mockAucations,
      },
    });

    const setSpy = vi.spyOn(aucationsStore, "asyncSetAucations").mockResolvedValue();

    await wrapper.find('[data-testid="filter-my-aucations-btn"]').trigger("click");
    expect(setSpy).toHaveBeenCalled();

    await wrapper.find('[data-testid="filter-all-aucations-btn"]').trigger("click");
    expect(setSpy).toHaveBeenCalled();

    await wrapper.find('[data-testid="filter-closed-btn"]').trigger("click");
    expect(setSpy).toHaveBeenCalled();

    await wrapper.find('[data-testid="filter-all-status-btn"]').trigger("click");
    expect(setSpy).toHaveBeenCalled();

    aucationsStore.setIsAucationDeleted(true);
    await new Promise((r) => setTimeout(r, 10));
    expect(setSpy).toHaveBeenCalled();
  });

  it("should handle AddModal and ChangeModal close and success events", async () => {
    const { wrapper, aucationsStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        aucations: mockAucations,
      },
    });

    const setSpy = vi.spyOn(aucationsStore, "asyncSetAucations").mockResolvedValue();

    // Trigger add modal
    await wrapper.find('[data-testid="add-aucation-btn"]').trigger("click");
    const addModal = wrapper.findComponent({ name: "AddModal" });
    expect(addModal.exists()).toBe(true);

    addModal.vm.$emit("success");
    expect(setSpy).toHaveBeenCalled();

    addModal.vm.$emit("close");
    await new Promise((r) => setTimeout(r, 10));
    expect(wrapper.find('[data-testid="add-aucation-modal"]').exists()).toBe(false);

    // Trigger change modal
    const editBtn = wrapper.find('[data-testid="edit-aucation-1"]');
    await editBtn.trigger("click");
    const changeModal = wrapper.findComponent({ name: "ChangeModal" });
    expect(changeModal.exists()).toBe(true);

    changeModal.vm.$emit("success");
    expect(setSpy).toHaveBeenCalled();

    changeModal.vm.$emit("close");
    await new Promise((r) => setTimeout(r, 10));
    expect(wrapper.find('[data-testid="edit-aucation-modal"]').exists()).toBe(false);

    // Trigger unmount
    wrapper.unmount();
  });

  it("should evaluate canManage properly for non-admin regular users", () => {
    const regularProfile = { id: 1, name: "User 1", role: "user" };
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: regularProfile,
        aucations: mockAucations,
      },
    });

    // Auction 1 belongs to user 1 (author_id = 1) -> can manage
    expect(wrapper.find('[data-testid="edit-aucation-1"]').exists()).toBe(true);
    // Auction 2 belongs to user 2 (author_id = 2) -> cannot manage
    expect(wrapper.find('[data-testid="edit-aucation-2"]').exists()).toBe(false);
  });

  it("should handle null store aucations and search filtering with null title or description", async () => {
    const { wrapper, aucationsStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        aucations: [
          { id: 91, title: null, description: null, is_closed: 0, author_id: 1 },
        ],
      },
    });

    vi.spyOn(aucationsStore, "asyncSetAucations").mockResolvedValue();
    wrapper.vm.loadingAucations = false;
    await wrapper.vm.$nextTick();

    const searchInput = wrapper.find('[data-testid="search-aucation-input"]');
    await searchInput.setValue("anything");
    expect(wrapper.text()).toContain("Belum ada sesi lelang yang sesuai kriteria.");
  });

  it("should handle author username or Penjual fallback and null profile in canManage", () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: null,
        aucations: [
          {
            id: 92,
            title: "Barang A",
            author: { username: "penjual_keren" },
          },
          {
            id: 93,
            title: "Barang B",
            author: {},
          },
        ],
      },
    });

    expect(wrapper.vm.canManage({ id: 92 })).toBe(false);
  });
});

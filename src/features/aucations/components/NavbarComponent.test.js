import { describe, it, expect, vi, beforeEach } from "vitest";
import NavbarComponent from "./NavbarComponent.vue";
import { renderWithProviders } from "../../../test-utils";

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

describe("NavbarComponent", () => {
  const mockProfileWithPhoto = {
    name: "Abdullah",
    email: "abdullah@delcom.org",
    photo: "https://example.com/photo.jpg",
  };

  const mockProfileWithoutPhoto = {
    name: "Ubaid",
    email: "ubaid@delcom.org",
    photo: null,
  };

  const mockProfileEmpty = {
    name: "",
    email: "",
    photo: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render profile photo and name correctly", () => {
    const { wrapper } = renderWithProviders(NavbarComponent, {
      props: {
        profile: mockProfileWithPhoto,
        isSidebarOpen: false,
      },
    });

    expect(wrapper.text()).toContain("Abdullah");
    expect(wrapper.text()).toContain("abdullah@delcom.org");
    const img = wrapper.find("img");
    expect(img.exists()).toBe(true);
    expect(img.attributes("src")).toBe("https://example.com/photo.jpg");
  });

  it("should render avatar initial fallback when photo is null", () => {
    const { wrapper } = renderWithProviders(NavbarComponent, {
      props: {
        profile: mockProfileWithoutPhoto,
        isSidebarOpen: true,
      },
    });

    expect(wrapper.text()).toContain("U");
  });

  it("should render default Pengguna fallback when name and email are empty", () => {
    const { wrapper } = renderWithProviders(NavbarComponent, {
      props: {
        profile: mockProfileEmpty,
        isSidebarOpen: false,
      },
    });

    expect(wrapper.text()).toContain("Pengguna");
  });

  it("should toggle sidebar on mobile menu button click", async () => {
    const { wrapper } = renderWithProviders(NavbarComponent, {
      props: {
        profile: mockProfileWithPhoto,
        isSidebarOpen: false,
      },
    });

    const toggleBtn = wrapper.find('[data-testid="toggle-sidebar-btn"]');
    await toggleBtn.trigger("click");

    expect(wrapper.emitted("toggle-sidebar")).toBeTruthy();
  });

  it("should open and close profile dropdown menu, navigate to profile and call logout", async () => {
    const { wrapper } = renderWithProviders(NavbarComponent, {
      props: {
        profile: mockProfileWithPhoto,
        isSidebarOpen: false,
      },
    });

    const dropdownBtn = wrapper.find('[data-testid="profile-dropdown-button"]');
    await dropdownBtn.trigger("click");
    expect(wrapper.find('[data-testid="profile-dropdown-menu"]').exists()).toBe(true);

    const profileLink = wrapper.find('[data-testid="dropdown-profile-link"]');
    await profileLink.trigger("click");
    expect(mockRouter.push).toHaveBeenCalledWith("/profile");

    await dropdownBtn.trigger("click");
    const logoutBtn = wrapper.find('[data-testid="dropdown-logout-button"]');
    await logoutBtn.trigger("click");
    expect(wrapper.emitted("logout")).toBeTruthy();
  });

  it("should close dropdown when clicking outside", async () => {
    const { wrapper } = renderWithProviders(NavbarComponent, {
      props: {
        profile: mockProfileWithPhoto,
        isSidebarOpen: false,
      },
      attachTo: document.body,
    });

    const dropdownBtn = wrapper.find('[data-testid="profile-dropdown-button"]');
    await dropdownBtn.trigger("click");
    expect(wrapper.find('[data-testid="profile-dropdown-menu"]').exists()).toBe(true);

    const menu = wrapper.find('[data-testid="profile-dropdown-menu"]');
    menu.element.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 10));
    expect(wrapper.find('[data-testid="profile-dropdown-menu"]').exists()).toBe(true);

    document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 10));
    expect(wrapper.find('[data-testid="profile-dropdown-menu"]').exists()).toBe(false);

    wrapper.unmount();
  });

  it("should fallback to usersStore.profile when props.profile is null and render Pengguna in dropdown", async () => {
    const { wrapper } = renderWithProviders(NavbarComponent, {
      props: {
        profile: null,
        isSidebarOpen: false,
      },
      preloadedState: {
        profile: { id: 9, name: null, email: "anon@delcom.org" },
      },
    });

    const dropdownBtn = wrapper.find('[data-testid="profile-dropdown-button"]');
    await dropdownBtn.trigger("click");

    expect(wrapper.find('[data-testid="profile-dropdown-menu"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("Pengguna");
  });
});

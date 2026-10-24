import { describe, it, expect } from "vitest";
import SidebarComponent from "./SidebarComponent.vue";
import { renderWithProviders } from "../../../test-utils";

describe("SidebarComponent", () => {
  it("should render navigation items", () => {
    const { wrapper } = renderWithProviders(SidebarComponent, {
      props: {
        isSidebarOpen: false,
      },
    });

    expect(wrapper.text()).toContain("Dashboard Barang");
    expect(wrapper.text()).toContain("Daftar Pengguna");
    expect(wrapper.text()).toContain("Profil Saya");
    expect(wrapper.find('[data-testid="sidebar-backdrop"]').exists()).toBe(false);
  });

  it("should render backdrop and emit close-mobile on click when open", async () => {
    const { wrapper } = renderWithProviders(SidebarComponent, {
      props: {
        isSidebarOpen: true,
      },
    });

    const backdrop = wrapper.find('[data-testid="sidebar-backdrop"]');
    expect(backdrop.exists()).toBe(true);

    await backdrop.trigger("click");
    expect(wrapper.emitted("close-mobile")).toBeTruthy();
  });

  it("should emit close-mobile when clicking navigation link", async () => {
    const { wrapper } = renderWithProviders(SidebarComponent, {
      props: {
        isSidebarOpen: true,
      },
    });

    const links = wrapper.findAll("a");
    const usersLink = links.find((l) => l.text().includes("Daftar Pengguna"));
    expect(usersLink).toBeDefined();
    await usersLink.trigger("click");
    expect(wrapper.emitted("close-mobile")).toBeTruthy();
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import ProfilePage from "./ProfilePage.vue";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("ProfilePage", () => {
  const mockProfile = {
    id: 1,
    name: "Abdullah Ubaid",
    email: "ifs18005@del.ac.id",
    photo: "https://example.com/photo.jpg",
  };

  const mockProfileEmptyName = {
    id: 3,
    name: "",
    email: "",
    photo: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show loading indicator when profile is null", () => {
    const { wrapper } = renderWithProviders(ProfilePage, {
      preloadedState: { profile: null },
    });
    expect(wrapper.text()).toContain("Memuat data profil...");
  });

  it("should display profile information and initial avatar fallback", () => {
    const { wrapper } = renderWithProviders(ProfilePage, {
      preloadedState: {
        profile: {
          id: 2,
          name: "Budi",
          email: "budi@del.ac.id",
          photo: null,
        },
      },
    });

    expect(wrapper.text()).toContain("Budi");
    expect(wrapper.text()).toContain("budi@del.ac.id");
    expect(wrapper.text()).toContain("B");
  });

  it("should handle profile with empty name and email using fallback avatar initial", () => {
    const { wrapper } = renderWithProviders(ProfilePage, {
      preloadedState: {
        profile: mockProfileEmptyName,
      },
    });

    expect(wrapper.text()).toContain("U");
  });

  it("should validate and submit update profile", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    const { wrapper, usersStore } = renderWithProviders(ProfilePage, {
      preloadedState: { profile: mockProfile },
    });

    const putProfileSpy = vi
      .spyOn(usersStore, "asyncPutProfile")
      .mockReturnValue(Promise.resolve());

    const nameInput = wrapper.find('[data-testid="profile-name-input"]');
    const emailInput = wrapper.find('[data-testid="profile-email-input"]');

    // Empty name
    await nameInput.setValue("   ");
    await wrapper.findAll("form")[0].trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Nama tidak boleh kosong!");

    // Empty email
    await nameInput.setValue("Abdullah Baru");
    await emailInput.setValue("   ");
    await wrapper.findAll("form")[0].trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Email tidak boleh kosong!");

    // Valid
    await emailInput.setValue("baru@del.ac.id");
    await wrapper.findAll("form")[0].trigger("submit");
    expect(putProfileSpy).toHaveBeenCalledWith("Abdullah Baru", "baru@del.ac.id");

    // Trigger watch isChangeProfile
    usersStore.setIsChangeProfile(true);
    await wrapper.vm.$nextTick();
  });

  it("should validate and upload photo", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    const { wrapper, usersStore } = renderWithProviders(ProfilePage, {
      preloadedState: { profile: mockProfile },
    });

    const photoSpy = vi
      .spyOn(usersStore, "asyncPostProfilePhoto")
      .mockReturnValue(Promise.resolve());

    const fileInput = wrapper.find('[data-testid="profile-photo-file-input"]');

    // No file selected
    await fileInput.trigger("change");
    expect(photoSpy).not.toHaveBeenCalled();

    // Invalid file type
    const textFile = new File(["dummy"], "doc.txt", { type: "text/plain" });
    Object.defineProperty(fileInput.element, "files", {
      value: [textFile],
      writable: true,
    });
    await fileInput.trigger("change");
    expect(errorSpy).toHaveBeenCalledWith("Pilih file gambar yang valid!");

    // File oversized (>3MB)
    const bigFile = new File([new ArrayBuffer(4 * 1024 * 1024)], "big.png", {
      type: "image/png",
    });
    Object.defineProperty(fileInput.element, "files", {
      value: [bigFile],
      writable: true,
    });
    await fileInput.trigger("change");
    expect(errorSpy).toHaveBeenCalledWith("Ukuran file foto maksimal 3MB!");

    // Valid file
    const validFile = new File(["img content"], "avatar.png", { type: "image/png" });
    Object.defineProperty(fileInput.element, "files", {
      value: [validFile],
      writable: true,
    });
    await fileInput.trigger("change");
    expect(photoSpy).toHaveBeenCalledWith(validFile);

    // Trigger watch isChangeProfilePhoto
    usersStore.setIsChangeProfilePhoto(true);
    await wrapper.vm.$nextTick();
  });

  it("should validate and update password", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    const { wrapper, usersStore } = renderWithProviders(ProfilePage, {
      preloadedState: { profile: mockProfile },
    });

    const passSpy = vi
      .spyOn(usersStore, "asyncPutProfilePassword")
      .mockReturnValue(Promise.resolve());

    const oldPassInput = wrapper.find('[data-testid="current-password-input"]');
    const newPassInput = wrapper.find('[data-testid="new-password-input"]');
    const confirmPassInput = wrapper.find('[data-testid="confirm-password-input"]');
    const passForm = wrapper.findAll("form")[1];

    // Missing old password
    await oldPassInput.setValue("");
    await newPassInput.setValue("newPass123");
    await confirmPassInput.setValue("newPass123");
    await passForm.trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Kata sandi lama wajib diisi!");

    // New password short (< 6)
    await oldPassInput.setValue("oldPass");
    await newPassInput.setValue("123");
    await confirmPassInput.setValue("123");
    await passForm.trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Kata sandi baru minimal 6 karakter!");

    // Confirm password mismatch
    await newPassInput.setValue("validPassword");
    await confirmPassInput.setValue("differentPassword");
    await passForm.trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Konfirmasi kata sandi tidak cocok!");

    // Valid submission
    await confirmPassInput.setValue("validPassword");
    await passForm.trigger("submit");
    expect(passSpy).toHaveBeenCalledWith("oldPass", "validPassword", "validPassword");

    // Trigger watch isChangeProfilePassword
    usersStore.setIsChangeProfilePassword(true);
    await wrapper.vm.$nextTick();
  });

  it("should sync form fields when usersStore.profile updates", async () => {
    const { wrapper, usersStore } = renderWithProviders(ProfilePage, {
      preloadedState: { profile: mockProfile },
    });

    usersStore.setProfile({ ...mockProfile, name: "Nama Baru Terupdate" });
    await wrapper.vm.$nextTick();

    const nameInput = wrapper.find('[data-testid="profile-name-input"]');
    expect(nameInput.element.value).toBe("Nama Baru Terupdate");
  });
});

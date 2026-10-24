import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import MarkdownViewer from "./MarkdownViewer.vue";

const mockSetMarkdown = vi.fn();
const mockDestroy = vi.fn();

vi.mock("@toast-ui/editor/dist/toastui-editor-viewer", () => {
  return {
    default: vi.fn().mockImplementation(function (options) {
      this.options = options;
      this.setMarkdown = mockSetMarkdown;
      this.destroy = mockDestroy;
    }),
  };
});

describe("MarkdownViewer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize viewer with initial content and update on content prop change", async () => {
    const wrapper = mount(MarkdownViewer, {
      props: {
        content: "Deskripsi Lelang",
      },
    });

    expect(wrapper.find('[data-testid="markdown-viewer"]').exists()).toBe(true);

    await wrapper.setProps({ content: "Deskripsi Diperbarui" });
    expect(mockSetMarkdown).toHaveBeenCalledWith("Deskripsi Diperbarui");

    await wrapper.setProps({ content: "" });
    expect(mockSetMarkdown).toHaveBeenCalledWith("");

    wrapper.unmount();
    expect(mockDestroy).toHaveBeenCalled();
  });

  it("should initialize viewer with default empty content", () => {
    const wrapper = mount(MarkdownViewer);
    expect(wrapper.find('[data-testid="markdown-viewer"]').exists()).toBe(true);
  });
});

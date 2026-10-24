import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import process from "process";

// Menyisipkan CSS hasil build ke index.html agar tidak ada request CSS yang memblokir render
function inlineCss() {
  return {
    name: "inline-css",
    apply: "build",
    enforce: "post",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        const bundle = ctx.bundle;
        if (!bundle) return html;
        return html.replace(
          /<link rel="stylesheet"[^>]*href="\/?([^"]+\.css)"[^>]*>/g,
          (match, file) => {
            const asset = bundle[file];
            if (!asset || asset.type !== "asset") return match;
            delete bundle[file];
            return `<style>${asset.source}</style>`;
          }
        );
      },
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [vue(), tailwindcss(), inlineCss()],
    server: { port: Number(env.APP_PORT) || 3000 },
    preview: { port: Number(env.APP_PORT) || 3000 },
    build: {
      target: "es2022",
      cssMinify: true,
    },
    define: {
      DELCOM_BASEURL: JSON.stringify(
        env.VITE_DELCOM_BASEURL || "http://localhost:8000/api/v1"
      ),
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/setupTests.js",
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html", "lcov"],
        include: ["src/**/*.{js,vue}"],
        exclude: [
          "src/main.js",
          "src/setupTests.js",
          "src/test-utils.js",
          "**/*.test.{js,jsx}",
          "node_modules/**",
          ".docs/**",
        ],
        thresholds: { lines: 100, functions: 100, branches: 100, statements: 100 },
      },
    },
  };
});
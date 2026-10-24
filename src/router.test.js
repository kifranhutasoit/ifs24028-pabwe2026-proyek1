import { describe, it, expect } from "vitest";
import router, { routes, createAppRouter } from "./router";
import { createMemoryHistory } from "vue-router";

describe("Router Configuration", () => {
  it("should have correct routes defined", () => {
    expect(routes).toBeInstanceOf(Array);
    expect(routes.length).toBeGreaterThan(0);

    const authRoute = routes.find((r) => r.path === "/auth");
    expect(authRoute).toBeDefined();
    expect(authRoute.children.length).toBe(2);

    const homeRoute = routes.find((r) => r.path === "/");
    expect(homeRoute).toBeDefined();

    const notFoundRoute = routes.find((r) => r.path === "/:pathMatch(.*)*");
    expect(notFoundRoute).toBeDefined();
  });

  it("should create app router with custom memory history", () => {
    const memoryHistory = createMemoryHistory();
    const appRouter = createAppRouter(memoryHistory);
    expect(appRouter).toBeDefined();
    expect(appRouter.options.history).toBe(memoryHistory);
  });

  it("should export default router instance", () => {
    expect(router).toBeDefined();
    expect(typeof router.push).toBe("function");
  });
});

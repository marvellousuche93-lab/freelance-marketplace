import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ContentState from "./ContentState";

describe("ContentState", () => {
  it("renders the loading fallback while loading", () => {
    render(
      <ContentState loading loadingFallback={<p>Loading…</p>}>
        <p>Done</p>
      </ContentState>
    );
    expect(screen.getByText("Loading…")).toBeInTheDocument();
    expect(screen.queryByText("Done")).not.toBeInTheDocument();
  });

  it("renders the error card with retry", async () => {
    const onRetry = vi.fn();
    render(
      <ContentState loading={false} error="Nope" onRetry={onRetry}>
        <p>Done</p>
      </ContentState>
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalled();
  });

  it("renders the empty card", () => {
    render(
      <ContentState
        loading={false}
        isEmpty
        emptyTitle="No jobs"
        emptyDescription="Try later."
      >
        <p>Done</p>
      </ContentState>
    );
    expect(screen.getByText("No jobs")).toBeInTheDocument();
    expect(screen.getByText("Try later.")).toBeInTheDocument();
  });

  it("renders children when successful", () => {
    render(
      <ContentState loading={false} isEmpty={false}>
        <p>Done</p>
      </ContentState>
    );
    expect(screen.getByText("Done")).toBeInTheDocument();
  });
});
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import JobCard from "./JobCard";
import { makeJob } from "../../test/fixtures";

function renderCard(job) {
  return render(
    <MemoryRouter>
      <JobCard job={job} />
    </MemoryRouter>
  );
}

describe("JobCard", () => {
  it("shows the title", () => {
    renderCard(makeJob({ title: "Build an API" }));
    expect(screen.getByText("Build an API")).toBeInTheDocument();
  });

  it("shows the 'Fixed' badge for fixed-price jobs", () => {
    renderCard(makeJob({ budget_type: "FIXED_PRICE" }));
    expect(screen.getByText("Fixed")).toBeInTheDocument();
  });

  it("shows the 'Hourly' badge for hourly jobs", () => {
    renderCard(makeJob({ budget_type: "HOURLY", min_budget: "30.00", max_budget: "50.00" }));
    expect(screen.getByText("Hourly")).toBeInTheDocument();
  });

  it("links to the job detail page", () => {
    renderCard(makeJob({ slug: "abc" }));
    const link = screen.getByRole("link", { name: /view/i });
    expect(link).toHaveAttribute("href", "/jobs/abc");
  });
});
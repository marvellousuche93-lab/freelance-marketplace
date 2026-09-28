import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import Input from "./Input";

describe("Input", () => {
  it("renders label and input", () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("shows error and marks aria-invalid", () => {
    render(<Input label="Email" error="Required" />);
    expect(screen.getByText("Required")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
  });

  it("hides helper when error is present", () => {
    render(<Input label="Email" helper="Optional" error="Bad" />);
    expect(screen.queryByText("Optional")).not.toBeInTheDocument();
    expect(screen.getByText("Bad")).toBeInTheDocument();
  });

  it("shows helper when no error", () => {
    render(<Input label="Email" helper="Optional" />);
    expect(screen.getByText("Optional")).toBeInTheDocument();
  });
});
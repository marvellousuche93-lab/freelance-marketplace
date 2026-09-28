import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import Skeleton from "./Skeleton";

describe("Skeleton", () => {
  it("renders a base block with shimmer animation on ::before", () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild;
    // The shimmer is applied via the ::before pseudo-element.
    expect(el).toHaveClass("before:animate-shimmer");
    // It also has the base placeholder color classes.
    expect(el).toHaveClass("bg-slate-200");
  });

  it("renders Text with N lines", () => {
    const { container } = render(<Skeleton.Text lines={4} />);
    expect(container.firstChild.children.length).toBe(4);
  });

  it("renders Avatar with circle class", () => {
    const { container } = render(<Skeleton.Avatar size="lg" />);
    expect(container.firstChild).toHaveClass("rounded-full");
  });

  it("renders StatGrid with N placeholders", () => {
    const { container } = render(<Skeleton.StatGrid count={4} />);
    expect(container.firstChild.children.length).toBe(4);
  });

  it("renders ChatBubbles with N bubbles", () => {
    const { container } = render(<Skeleton.ChatBubbles count={5} />);
    expect(container.firstChild.children.length).toBe(5);
  });
});
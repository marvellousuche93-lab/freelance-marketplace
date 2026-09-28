import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { useMinimumDelay } from "./useMinimumDelay";

describe("useMinimumDelay", () => {
  it("returns true immediately when value starts true", () => {
    const { result } = renderHook(() => useMinimumDelay(true, 100));
    expect(result.current).toBe(true);
  });

  it("stays true for at least minMs after value flips to false", async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useMinimumDelay(value, 100),
      { initialProps: { value: true } }
    );

    expect(result.current).toBe(true);

    rerender({ value: false });
    // Still true immediately after — the minimum hasn't elapsed yet.
    expect(result.current).toBe(true);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 150));
    });
    expect(result.current).toBe(false);
  });

  it("stays false when value starts false", () => {
    const { result } = renderHook(() => useMinimumDelay(false, 100));
    expect(result.current).toBe(false);
  });

  it("holds true through a quick true→false→true sequence", async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useMinimumDelay(value, 100),
      { initialProps: { value: false } }
    );

    rerender({ value: true });
    expect(result.current).toBe(true);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 150));
    });
    // Still true — value is still true.
    expect(result.current).toBe(true);

    rerender({ value: false });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 150));
    });
    expect(result.current).toBe(false);
  });
});
/**
 * TopProgressBar — a thin animated bar at the top of the viewport that
 * animates while in-flight requests are running.
 *
 * It is event-driven, not prop-driven. The Axios client in `src/api/client.js`
 * fires:
 *   window.dispatchEvent(new Event("progress:start"))
 *   window.dispatchEvent(new Event("progress:stop"))
 *
 * Requests that set the `X-No-Progress` header (background polls) do not
 * fire these events, so the bar stays quiet during routine polling.
 *
 * Multiple concurrent fetches keep the bar visible until all have stopped.
 */

import { useEffect, useRef, useState } from "react";

export default function TopProgressBar() {
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState(0);
  const pending = useRef(0);
  const tickTimer = useRef(null);
  const hideTimer = useRef(null);

  useEffect(() => {
    function tick() {
      setValue((v) => (v >= 90 ? v : v + Math.max(1, (95 - v) / 8)));
    }

    function start() {
      pending.current += 1;
      if (pending.current === 1) {
        if (hideTimer.current) {
          clearTimeout(hideTimer.current);
          hideTimer.current = null;
        }
        setValue(8);
        setVisible(true);
        if (tickTimer.current) clearInterval(tickTimer.current);
        tickTimer.current = setInterval(tick, 220);
      }
    }

    function stop() {
      pending.current = Math.max(0, pending.current - 1);
      if (pending.current === 0) {
        if (tickTimer.current) {
          clearInterval(tickTimer.current);
          tickTimer.current = null;
        }
        setValue(100);
        hideTimer.current = setTimeout(() => {
          setVisible(false);
          setValue(0);
          hideTimer.current = null;
        }, 220);
      }
    }

    window.addEventListener("progress:start", start);
    window.addEventListener("progress:stop", stop);

    return () => {
      window.removeEventListener("progress:start", start);
      window.removeEventListener("progress:stop", stop);
      if (tickTimer.current) clearInterval(tickTimer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  return (
    <>
      {visible && (
        <div
          role="progressbar"
          aria-label="Loading"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(value)}
          className="fixed left-0 right-0 top-0 z-[100] h-0.5 bg-transparent"
        >
          <div
            className="h-full bg-brand-600 transition-[width] duration-200 ease-out dark:bg-brand-500"
            style={{ width: `${value}%` }}
          />
        </div>
      )}

      {/* Live region announces only the start/finish of a batch, not every tick. */}
      <div role="status" aria-live="polite" className="sr-only">
        {visible ? "Loading" : ""}
      </div>
    </>
  );
}
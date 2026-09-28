/**
 * MessageComposer — textarea + send button.
 *
 * Enter sends. Shift+Enter inserts a newline.
 * Grows with content up to a cap.
 *
 * On iOS, the composer respects the home indicator's safe area.
 */

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";

import Button from "../ui/Button";
import { cn } from "../../utils/cn";

const MAX_HEIGHT = 140;

export default function MessageComposer({ onSend, disabled = false }) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, MAX_HEIGHT) + "px";
  }, [value]);

  async function submit() {
    const body = value.trim();
    if (!body || sending || disabled) return;
    setSending(true);
    try {
      await onSend(body);
      setValue("");
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="flex items-end gap-2 p-3 pb-safe border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Type a message…"
        rows={1}
        disabled={disabled}
        aria-label="Message"
        className={cn(
          "flex-1 resize-none rounded-2xl px-3 py-2.5 sm:py-2 bg-slate-100 dark:bg-slate-900",
          "border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-slate-950",
          "outline-none transition-colors",
          "disabled:opacity-50"
        )}
        style={{ maxHeight: MAX_HEIGHT }}
      />
      <Button
        onClick={submit}
        disabled={!value.trim() || sending || disabled}
        size="icon"
        aria-label="Send message"
      >
        <Send size={16} />
      </Button>
    </div>
  );
}
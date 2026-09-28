/**
 * MessageThread — the right-hand pane showing the current conversation.
 *
 * Behavior:
 *   - Loads messages on mount and when conversationId changes.
 *   - Polls for new messages every 8 s while mounted.
 *   - Sends optimistically: adds to the list instantly, replaces on success.
 *   - Auto-scrolls to the bottom when new messages arrive (if the user is
 *     already near the bottom; otherwise leaves them alone).
 *   - Marks the conversation as read on mount and after receiving new
 *     messages from the other participant.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

import Button from "../ui/Button";
import Avatar from "../ui/Avatar";
import Skeleton from "../loaders/Skeleton";
import ContentState from "../loaders/ContentState";
import MessageBubble from "./MessageBubble";
import MessageComposer from "./MessageComposer";
import { displayName } from "./ConversationItem";
import useFetch from "../../hooks/useFetch";
import { useAuth } from "../../context/AuthContext";
import {
  getConversation,
  listMessages,
  markConversationRead,
  sendMessage,
} from "../../api/messaging";
import { extractErrorMessage } from "../../api/errors";
import { formatDayLabel, sameDay } from "../../utils/format";
import { cn } from "../../utils/cn";

const POLL_INTERVAL_MS = 8000;

export default function MessageThread({ conversationId, onBack }) {
  const { user } = useAuth();

  const conversation = useFetch(
    () => getConversation(conversationId),
    [conversationId]
  );

  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [messagesError, setMessagesError] = useState("");
  const [pending, setPending] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const scrollRef = useRef(null);
  const lastMessageCount = useRef(0);

  // ---------- Load + poll ----------
  const loadMessages = useCallback(
    async ({ silent = false } = {}) => {
      if (!conversationId) return;
      if (!silent) setLoadingMessages(true);
      setMessagesError("");
      try {
        const data = await listMessages(conversationId, { page: 1 });
        setMessages(data.results || data || []);
      } catch (err) {
        const msg = extractErrorMessage(err, "Could not load messages.");
        setMessagesError(msg);
        if (!silent) toast.error(msg);
      } finally {
        if (!silent) setLoadingMessages(false);
      }
    },
    [conversationId]
  );

  useEffect(() => {
    setMessages([]);
    setPending([]);
    lastMessageCount.current = 0;
    loadMessages();
    markConversationRead(conversationId).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;
    const id = setInterval(() => {
      loadMessages({ silent: true });
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [conversationId, loadMessages]);

  // ---------- Auto-scroll on new messages ----------
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const combined = messages.length + pending.length;
    const grew = combined > lastMessageCount.current;
    lastMessageCount.current = combined;

    if (!grew) return;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom < 200) {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    }
  }, [messages, pending]);

  // ---------- Send ----------
  async function handleSend(body) {
    const tempId = `tmp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      body,
      sender: user,
      created_at: new Date().toISOString(),
      is_read: false,
      _optimistic: true,
    };
    setPending((prev) => [...prev, optimistic]);

    try {
      const real = await sendMessage(conversationId, body);
      setPending((prev) => prev.filter((m) => m.id !== tempId));
      setMessages((prev) => [...prev, real]);
    } catch (err) {
      setPending((prev) => prev.filter((m) => m.id !== tempId));
      toast.error(extractErrorMessage(err, "Could not send message."));
    }
  }

  // ---------- Manual refresh ----------
  async function refresh() {
    setRefreshing(true);
    await loadMessages({ silent: true });
    markConversationRead(conversationId).catch(() => {});
    setRefreshing(false);
  }

  // ---------- Render ----------
  const other = conversation.data?.other_participant;
  const combined = [...messages, ...pending];

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to conversations"
            className="md:hidden inline-flex items-center justify-center h-11 w-11 rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ArrowLeft size={18} />
          </button>
        ) : null}

        <Avatar user={other} size="md" />

        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">
            {displayName(other) || "Conversation"}
          </p>
          {other?.role ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {other.role === "EMPLOYER" ? "Employer" : "Freelancer"}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={refresh}
          disabled={refreshing}
          aria-label="Refresh messages"
          className={cn(
            "inline-flex items-center justify-center h-11 w-11 sm:h-9 sm:w-9 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800",
            refreshing && "opacity-50"
          )}
        >
          <RefreshCw size={16} className={cn(refreshing && "animate-spin")} />
        </button>
      </div>

      {/* Body */}
      <ContentState
        loading={loadingMessages}
        error={messagesError}
        isEmpty={false}
        onRetry={loadMessages}
        className="flex-1 min-h-0 flex flex-col"
        loadingFallback={<Skeleton.ChatBubbles count={6} />}
      >
        <div
          ref={scrollRef}
          className="flex-1 min-h-0 overflow-y-auto px-3 py-4 space-y-2"
        >
          {combined.length === 0 ? (
            <div className="text-center text-slate-500 dark:text-slate-400 py-12 text-sm">
              No messages yet. Say hi!
            </div>
          ) : (
            combined.map((m, i) => {
              const prev = combined[i - 1];
              const showDay =
                !prev || !sameDay(prev.created_at, m.created_at);

              return (
                <div key={m.id} className="space-y-2">
                  {showDay ? (
                    <div className="flex items-center justify-center my-3">
                      <span className="text-[10px] uppercase tracking-wide text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        {formatDayLabel(m.created_at)}
                      </span>
                    </div>
                  ) : null}
                  <MessageBubble
                    message={m}
                    mine={
                      m.sender?.id === user?.id ||
                      m.sender?.username === user?.username
                    }
                    pending={!!m._optimistic}
                  />
                </div>
              );
            })
          )}
        </div>
      </ContentState>

      {/* Composer */}
      <MessageComposer onSend={handleSend} />
    </div>
  );
}
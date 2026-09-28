/**
 * MessagesPage — conversations list + active thread.
 *
 * Selection is URL-driven: /dashboard/messages?c=<conversationId>
 *   - Desktop (md+): list on the left, thread on the right.
 *   - Mobile (< md): list OR thread, full width.
 *
 * Height uses dvh so the mobile keyboard doesn't crop the composer.
 */

import { MessageSquare } from "lucide-react";

import Skeleton from "../../components/loaders/Skeleton";
import ContentState from "../../components/loaders/ContentState";
import EmptyState from "../../components/dashboard/EmptyState";
import ConversationItem from "../../components/messaging/ConversationItem";
import MessageThread from "../../components/messaging/MessageThread";
import useFetch from "../../hooks/useFetch";
import useQueryParams from "../../hooks/useQueryParams";
import { listConversations } from "../../api/messaging";

export default function MessagesPage() {
  const { params, setParam } = useQueryParams();
  const selectedId = params.c ? Number(params.c) : null;

  const conversations = useFetch(() => listConversations(), []);
  const items = conversations.data?.results ?? [];

  function select(id) {
    setParam("c", id, { resetPage: false });
  }

  function back() {
    setParam("c", "", { resetPage: false });
  }

  return (
    <div className="h-[calc(100dvh-9.5rem)] md:h-[calc(100dvh-8rem)] flex rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      {/* Left: list */}
      <aside
        className={`w-full md:w-80 md:border-r md:border-slate-200 md:dark:border-slate-800 flex-col ${
          selectedId ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <h1 className="text-lg font-semibold">Messages</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Your conversations.
          </p>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <ContentState
            loading={conversations.loading}
            error={conversations.error}
            isEmpty={
              !conversations.loading &&
              !conversations.error &&
              items.length === 0
            }
            onRetry={conversations.refetch}
            loadingFallback={<Skeleton.ChatList rows={6} />}
            emptyFallback={
              <div className="p-2">
                <EmptyState
                  icon={MessageSquare}
                  title="No conversations yet"
                  description="Start a conversation from a job or a freelancer's profile."
                />
              </div>
            }
          >
            <div className="space-y-1 p-2">
              {items.map((c) => (
                <ConversationItem
                  key={c.id}
                  conversation={c}
                  active={selectedId === c.id}
                  onClick={() => select(c.id)}
                />
              ))}
            </div>
          </ContentState>
        </div>
      </aside>

      {/* Right: thread or placeholder */}
      <section
        className={`flex-1 min-w-0 flex-col ${
          selectedId ? "flex" : "hidden md:flex"
        }`}
      >
        {selectedId ? (
          <MessageThread conversationId={selectedId} onBack={back} />
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center">
            <div className="max-w-sm space-y-3">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center">
                <MessageSquare size={24} />
              </div>
              <p className="font-medium">Select a conversation</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Choose a conversation on the left, or start a new one from a
                job or profile page.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
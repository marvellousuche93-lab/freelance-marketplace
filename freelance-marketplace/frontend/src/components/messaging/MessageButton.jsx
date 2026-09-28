/**
 * MessageButton — starts or opens a conversation with a user.
 *
 * Behavior:
 *   - Anonymous users are redirected to login with a ?next= back-link.
 *   - Logged-in users get an idempotent conversation via the API and are
 *     sent to /dashboard/messages?c=<id>.
 *   - A user cannot message themselves: the button renders disabled.
 *   - Employers and freelancers can message each other freely.
 */

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

import Button from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import { startConversation } from "../../api/messaging";
import { extractErrorMessage } from "../../api/errors";

export default function MessageButton({
  userId,
  variant = "outline",
  size = "md",
  className = "",
  children = "Message",
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [starting, setStarting] = useState(false);

  const isSelf = user?.id === userId;

  async function onClick() {
    if (!user) {
      navigate(
        `/login?next=${encodeURIComponent(location.pathname + location.search)}`
      );
      return;
    }
    if (isSelf) return;

    setStarting(true);
    try {
      const conv = await startConversation(userId);
      navigate(`/dashboard/messages?c=${conv.id}`);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not start conversation."));
    } finally {
      setStarting(false);
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      loading={starting}
      disabled={isSelf}
      className={className}
    >
      <MessageSquare size={16} />
      {isSelf ? "This is you" : children}
    </Button>
  );
}
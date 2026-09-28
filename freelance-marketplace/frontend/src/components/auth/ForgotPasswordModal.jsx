/**
 * ForgotPasswordModal — asks for the user's email, then submits a
 * password-reset request. The response is the same whether or not the
 * email belongs to an account, so we always show the same "check your
 * inbox" message.
 */

import { useState } from "react";
import toast from "react-hot-toast";

import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import { requestPasswordReset } from "../../api/authCompletion";
import { extractErrorMessage } from "../../api/errors";

export default function ForgotPasswordModal({ open, onClose }) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  function reset() {
    setEmail("");
    setError("");
    setDone(false);
  }

  function handleClose() {
    if (submitting) return;
    reset();
    onClose();
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await requestPasswordReset(email.trim());
      setDone(true);
    } catch (err) {
      const msg = extractErrorMessage(err, "Could not request reset.");
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Forgot password"
      size="md"
      footer={
        done ? (
          <Button variant="primary" onClick={handleClose}>
            Close
          </Button>
        ) : (
          <>
            <Button variant="ghost" onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={submitting}
              onClick={onSubmit}
              disabled={!email}
            >
              Send reset link
            </Button>
          </>
        )
      }
    >
      {done ? (
        <div className="space-y-3 text-sm">
          <p>
            If an account exists with the email <strong>{email}</strong>, a
            password reset link has been sent.
          </p>
          <p className="text-slate-500 dark:text-slate-400">
            Check your inbox (and spam folder). The link expires in 2 hours.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Enter the email address associated with your account. We'll send
            you a link to reset your password.
          </p>

          {error ? (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm dark:border-red-900 dark:bg-red-950 dark:text-red-300"
            >
              {error}
            </div>
          ) : null}

          <Input
            label="Email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </form>
      )}
    </Modal>
  );
}
/**
 * ChangeEmailModal — asks for a new email and current password, then
 * submits the request. The actual email change requires clicking a
 * link sent to the new address.
 */

import { useState } from "react";
import toast from "react-hot-toast";

import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import { requestEmailChange } from "../../api/authCompletion";
import { extractErrorMessage } from "../../api/errors";
import { useAuth } from "../../context/AuthContext";

export default function ChangeEmailModal({ open, onClose }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ newEmail: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function reset() {
    setForm({ newEmail: "", password: "" });
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
      await requestEmailChange({
        newEmail: form.newEmail.trim(),
        password: form.password,
      });
      setDone(true);
      toast.success("Confirmation email sent.");
    } catch (err) {
      const msg = extractErrorMessage(err, "Could not request email change.");
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
      title="Change email address"
      size="md"
      footer={
        done ? (
          <Button
            variant="primary"
            onClick={handleClose}
            className="w-full sm:w-auto"
          >
            Done
          </Button>
        ) : (
          <>
            <Button
              variant="ghost"
              onClick={handleClose}
              disabled={submitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={submitting}
              onClick={onSubmit}
              disabled={!form.newEmail || !form.password}
              className="w-full sm:w-auto"
            >
              Send confirmation
            </Button>
          </>
        )
      }
    >
      {done ? (
        <div className="space-y-3 text-sm">
          <p>
            A confirmation link has been sent to{" "}
            <strong className="break-anywhere">{form.newEmail}</strong>. Click
            the link in that email to complete the change.
          </p>
          <p className="text-slate-500 dark:text-slate-400">
            Your email address will not change until you click the link.
            The link expires in 24 hours.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 break-anywhere">
            Current email: <strong>{user?.email}</strong>
          </div>

          {error ? (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm dark:border-red-900 dark:bg-red-950 dark:text-red-300 break-anywhere"
            >
              {error}
            </div>
          ) : null}

          <Input
            label="New email address"
            type="email"
            required
            autoComplete="email"
            value={form.newEmail}
            onChange={update("newEmail")}
            helper="We'll send a confirmation link to this address."
          />

          <Input
            label="Current password"
            type="password"
            required
            autoComplete="current-password"
            value={form.password}
            onChange={update("password")}
            helper="Confirms this is really you."
          />
        </form>
      )}
    </Modal>
  );
}
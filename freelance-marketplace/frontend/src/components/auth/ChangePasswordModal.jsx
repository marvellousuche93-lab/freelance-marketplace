/**
 * ChangePasswordModal — asks for the current password and the new one.
 * On success, sends a security alert email to the user.
 */

import { useState } from "react";
import toast from "react-hot-toast";

import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import { changePassword } from "../../api/authCompletion";
import { extractErrorMessage } from "../../api/errors";

export default function ChangePasswordModal({ open, onClose }) {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function reset() {
    setForm({ currentPassword: "", newPassword: "", newPasswordConfirm: "" });
    setError("");
    setFieldErrors({});
  }

  function handleClose() {
    if (submitting) return;
    reset();
    onClose();
  }

  function clientValidate() {
    const errs = {};
    if (form.newPassword.length < 8) {
      errs.newPassword = "Password must be at least 8 characters.";
    }
    if (form.newPassword !== form.newPasswordConfirm) {
      errs.newPasswordConfirm = "New passwords do not match.";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!clientValidate()) return;

    setSubmitting(true);
    try {
      await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        newPasswordConfirm: form.newPasswordConfirm,
      });
      toast.success("Password updated.");
      reset();
      onClose();
    } catch (err) {
      const data = err?.response?.data;
      if (data && typeof data === "object" && !data.detail) {
        const fe = {};
        for (const [k, v] of Object.entries(data)) {
          fe[k] = Array.isArray(v) ? v.join(" ") : String(v);
        }
        setFieldErrors(fe);
      }
      const msg = extractErrorMessage(err, "Could not change password.");
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
      title="Change password"
      size="md"
      footer={
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
            disabled={
              !form.currentPassword ||
              !form.newPassword ||
              !form.newPasswordConfirm
            }
            className="w-full sm:w-auto"
          >
            Update password
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {error ? (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm dark:border-red-900 dark:bg-red-950 dark:text-red-300 break-anywhere"
          >
            {error}
          </div>
        ) : null}

        <Input
          label="Current password"
          type="password"
          required
          autoComplete="current-password"
          value={form.currentPassword}
          onChange={update("currentPassword")}
          error={fieldErrors.current_password}
        />

        <Input
          label="New password"
          type="password"
          required
          autoComplete="new-password"
          value={form.newPassword}
          onChange={update("newPassword")}
          error={fieldErrors.newPassword || fieldErrors.new_password}
          helper="At least 8 characters."
        />

        <Input
          label="Confirm new password"
          type="password"
          required
          autoComplete="new-password"
          value={form.newPasswordConfirm}
          onChange={update("newPasswordConfirm")}
          error={
            fieldErrors.newPasswordConfirm || fieldErrors.new_password_confirm
          }
        />
      </form>
    </Modal>
  );
}
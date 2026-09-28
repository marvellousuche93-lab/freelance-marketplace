/**
 * ResetPasswordPage — the page a user lands on after clicking the
 * reset link in their email. URL: /reset-password/:token
 */

import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card, { CardBody } from "../../components/ui/Card";
import { confirmPasswordReset } from "../../api/authCompletion";
import { extractErrorMessage } from "../../api/errors";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    newPassword: "",
    newPasswordConfirm: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.newPassword !== form.newPasswordConfirm) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await confirmPasswordReset({
        token,
        newPassword: form.newPassword,
        newPasswordConfirm: form.newPasswordConfirm,
      });
      setDone(true);
      toast.success("Password reset. You can now log in.");
      setTimeout(() => navigate("/login", { replace: true }), 1500);
    } catch (err) {
      const msg = extractErrorMessage(
        err,
        "This reset link is invalid or has expired."
      );
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Reset your password</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Choose a new password for your account.
        </p>
      </div>

      <Card>
        <CardBody className="space-y-4">
          {done ? (
            <div className="text-center space-y-3 py-4">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center">
                <CheckCircle2 size={22} />
              </div>
              <p className="font-medium">Password updated</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Redirecting you to log in...
              </p>
              <Link
                to="/login"
                className="text-brand-600 hover:underline text-sm"
              >
                Go to login
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              {error ? (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm dark:border-red-900 dark:bg-red-950 dark:text-red-300"
                >
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              ) : null}

              <Input
                label="New password"
                type="password"
                required
                autoComplete="new-password"
                value={form.newPassword}
                onChange={update("newPassword")}
                helper="At least 8 characters."
              />

              <Input
                label="Confirm new password"
                type="password"
                required
                autoComplete="new-password"
                value={form.newPasswordConfirm}
                onChange={update("newPasswordConfirm")}
              />

              <Button
                type="submit"
                className="w-full"
                loading={submitting}
                disabled={!form.newPassword || !form.newPasswordConfirm}
              >
                Reset password
              </Button>
            </form>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

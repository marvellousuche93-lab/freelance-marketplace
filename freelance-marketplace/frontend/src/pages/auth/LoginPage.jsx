/**
 * LoginPage — POST /api/auth/login/
 *
 * On successful login, redirects to ?next= (or /dashboard). The
 * redirect runs in a useEffect that fires when the auth context
 * publishes a non-null user, so it works regardless of whether the
 * login was triggered by the form or by a pre-existing session.
 */

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card, { CardBody } from "../../components/ui/Card";
import ForgotPasswordModal from "../../components/auth/ForgotPasswordModal";
import { useAuth } from "../../context/AuthContext";
import { extractErrorMessage } from "../../api/errors";

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const [form, setForm] = useState({ username: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);

  // Guard against firing the redirect twice under React 18 StrictMode.
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (redirectedRef.current) return;
    redirectedRef.current = true;
    navigate(next, { replace: true });
  }, [user, loading, navigate, next]);

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(form);
      toast.success("Welcome back!");
      // Do NOT call navigate() here. The effect above handles it once
      // the auth context publishes the user.
    } catch (err) {
      const msg = extractErrorMessage(err, "Could not log in.");
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Log in to continue to your dashboard.
        </p>
      </div>

      <Card>
        <CardBody className="space-y-4">
          {error ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm dark:border-red-900 dark:bg-red-950 dark:text-red-300 break-anywhere"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              label="Username"
              autoComplete="username"
              required
              value={form.username}
              onChange={update("username")}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={update("password")}
            />

            <div className="flex justify-end -mt-1">
              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="text-sm text-brand-600 hover:underline focus-ring rounded px-1"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={submitting}
              disabled={!form.username || !form.password}
            >
              Log in
            </Button>
          </form>

          <p className="text-center text-sm text-slate-600 dark:text-slate-400">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-brand-600 hover:underline">
              Sign up
            </Link>
          </p>
        </CardBody>
      </Card>

      <ForgotPasswordModal
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
      />
    </div>
  );
}
/**
 * RegisterPage — POST /api/auth/register/, then log in.
 *
 * Same redirect strategy as LoginPage: watch `user` and navigate when
 * it's set. Avoids the setUser/navigate race.
 */

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card, { CardBody } from "../../components/ui/Card";
import { useAuth } from "../../context/AuthContext";
import { extractErrorMessage } from "../../api/errors";
import { cn } from "../../utils/cn";

const ROLES = [
  {
    value: "FREELANCER",
    title: "I'm a freelancer",
    subtitle: "Find work, apply to jobs, build a portfolio.",
  },
  {
    value: "EMPLOYER",
    title: "I'm an employer",
    subtitle: "Post jobs, hire freelancers, manage applicants.",
  },
];

export default function RegisterPage() {
  const { user, loading, register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password_confirm: "",
    first_name: "",
    last_name: "",
    role: "FREELANCER",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Redirect when authenticated.
  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function setRole(role) {
    setForm((prev) => ({ ...prev, role }));
  }

  function clientValidate() {
    const errs = {};
    if (!form.username.trim()) errs.username = "Username is required.";
    if (!form.email.trim()) errs.email = "Email is required.";
    if (form.password.length < 8) errs.password = "Password must be at least 8 characters.";
    if (form.password !== form.password_confirm)
      errs.password_confirm = "Passwords do not match.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!clientValidate()) return;

    setSubmitting(true);
    try {
      await register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        password_confirm: form.password_confirm,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        role: form.role,
      });
      toast.success("Account created!");
      // Do NOT navigate here. The useEffect above handles it.
    } catch (err) {
      const data = err?.response?.data;
      if (data && typeof data === "object" && !data.detail) {
        const fe = {};
        for (const [k, v] of Object.entries(data)) {
          fe[k] = Array.isArray(v) ? v.join(" ") : String(v);
        }
        setFieldErrors(fe);
      }
      const msg = extractErrorMessage(err, "Could not create account.");
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-14">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Choose how you want to use the marketplace.
        </p>
      </div>

      <Card>
        <CardBody className="space-y-6">
          {error ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm dark:border-red-900 dark:bg-red-950 dark:text-red-300"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          <div className="grid sm:grid-cols-2 gap-3">
            {ROLES.map((r) => {
              const active = form.role === r.value;
              return (
                <button
                  type="button"
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  aria-pressed={active}
                  className={cn(
                    "text-left p-4 rounded-xl border-2 transition-colors",
                    active
                      ? "border-brand-500 bg-brand-50 dark:bg-brand-950"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  )}
                >
                  <p className="font-semibold">{r.title}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {r.subtitle}
                  </p>
                </button>
              );
            })}
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="First name"
                value={form.first_name}
                onChange={update("first_name")}
                autoComplete="given-name"
              />
              <Input
                label="Last name"
                value={form.last_name}
                onChange={update("last_name")}
                autoComplete="family-name"
              />
            </div>

            <Input
              label="Username"
              required
              value={form.username}
              onChange={update("username")}
              error={fieldErrors.username}
              autoComplete="username"
            />
            <Input
              label="Email"
              type="email"
              required
              value={form.email}
              onChange={update("email")}
              error={fieldErrors.email}
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              required
              value={form.password}
              onChange={update("password")}
              error={fieldErrors.password}
              helper="At least 8 characters."
              autoComplete="new-password"
            />
            <Input
              label="Confirm password"
              type="password"
              required
              value={form.password_confirm}
              onChange={update("password_confirm")}
              error={fieldErrors.password_confirm}
              autoComplete="new-password"
            />

            <Button type="submit" className="w-full" loading={submitting}>
              Create account
            </Button>
          </form>

          <p className="text-center text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="text-brand-600 hover:underline">
              Log in
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
/**
 * VerifyEmailPage — the page a user lands on after clicking the email
 * change confirmation link. URL: /verify-email/:token
 */

import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

import Button from "../../components/ui/Button";
import Card, { CardBody } from "../../components/ui/Card";
import { confirmEmailChange } from "../../api/authCompletion";
import { extractErrorMessage } from "../../api/errors";
import { useAuth } from "../../context/AuthContext";

export default function VerifyEmailPage() {
  const { token } = useParams();
  const { refreshUser } = useAuth();

  const [status, setStatus] = useState("loading");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    async function confirm() {
      try {
        const data = await confirmEmailChange(token);
        setResult(data);
        setStatus("success");
        try {
          await refreshUser();
        } catch {
          // Not logged in — ignore.
        }
      } catch (err) {
        setError(
          extractErrorMessage(err, "This confirmation link is invalid or has expired.")
        );
        setStatus("error");
      }
    }

    confirm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <Card>
        <CardBody className="text-center py-10 space-y-4">
          {status === "loading" ? (
            <>
              <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center">
                <Loader2 size={22} className="animate-spin" />
              </div>
              <p className="font-medium">Confirming your email…</p>
            </>
          ) : status === "success" ? (
            <>
              <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center">
                <CheckCircle2 size={22} />
              </div>
              <h1 className="text-xl font-semibold">Email updated</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Your email has been changed to{" "}
                <strong>{result?.email || "your new address"}</strong>. You
                can keep using the app as normal.
              </p>
              <div className="pt-2">
                <Button as={Link} to="/dashboard">
                  Go to dashboard
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="mx-auto w-12 h-12 rounded-2xl bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300 flex items-center justify-center">
                <AlertCircle size={22} />
              </div>
              <h1 className="text-xl font-semibold">Couldn&apos;t confirm</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {error}
              </p>
              <div className="pt-2 flex items-center justify-center gap-2">
                <Button as={Link} to="/" variant="outline">
                  Go home
                </Button>
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
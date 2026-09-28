/**
 * NotFoundPage — a proper 404 page.
 */

import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

import Button from "../../components/ui/Button";
import Card, { CardBody } from "../../components/ui/Card";

export default function NotFoundPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-24">
      <Card>
        <CardBody className="text-center py-12 space-y-4">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-300 flex items-center justify-center">
            <Compass size={26} />
          </div>
          <p className="text-5xl font-bold">404</p>
          <h1 className="text-xl font-semibold">Page not found</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button as={Link} to="/">
              Go home
            </Button>
            <Button as={Link} to="/jobs" variant="outline">
              Browse jobs
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
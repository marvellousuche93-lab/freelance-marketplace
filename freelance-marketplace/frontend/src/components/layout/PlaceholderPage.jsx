/**
 * PlaceholderPage — used during scaffolding so routes have visible content.
 * Phase 21+ replaces each of these with a real page.
 */

import { Link } from "react-router-dom";
import { Construction } from "lucide-react";

import Card, { CardBody } from "../ui/Card";
import Button from "../ui/Button";

export default function PlaceholderPage({ title, description, backTo = "/" }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <Card>
        <CardBody className="text-center space-y-4 py-10">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-300 flex items-center justify-center">
            <Construction size={22} />
          </div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            {description || "This page will be built in an upcoming phase."}
          </p>
          <div>
            <Button as={Link} to={backTo} variant="outline">
              Back
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
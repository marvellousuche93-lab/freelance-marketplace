/**
 * AboutPage — a short, honest description of the marketplace.
 */

import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

import Button from "../../components/ui/Button";
import Card, { CardBody, CardHeader } from "../../components/ui/Card";

const PRINCIPLES = [
  "Open profiles — freelancers control what's public.",
  "Transparent budgets — no hidden numbers, ever.",
  "Real reviews — only after a job is completed.",
  "Direct messaging — talk to the other party, no middlemen.",
  "Free to join — for both freelancers and employers.",
];

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-14">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
        About the marketplace
      </h1>
      <p className="mt-3 text-slate-600 dark:text-slate-400 text-lg">
        A straightforward place to find work and hire talent.
      </p>

      <Card className="mt-8">
        <CardHeader>
          <h2 className="font-semibold">Why we built this</h2>
        </CardHeader>
        <CardBody className="space-y-4 text-slate-700 dark:text-slate-300">
          <p>
            Most freelance platforms hide the important parts: budget,
            expectations, reviews. We think that's backwards. This
            marketplace shows what matters up front — the job, the budget,
            the skills, and the people.
          </p>
          <p>
            Freelancers publish a portfolio and apply to work they want.
            Employers post jobs with clear numbers and pick the people
            they trust. Reviews only happen after a completed job, so
            they mean something.
          </p>
        </CardBody>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <h2 className="font-semibold">What we care about</h2>
        </CardHeader>
        <CardBody>
          <ul className="space-y-2">
            {PRINCIPLES.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm">
                <CheckCircle2
                  size={16}
                  className="mt-0.5 text-emerald-600 shrink-0"
                />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      <div className="mt-8 flex gap-3">
        <Button as={Link} to="/register">
          Create an account
        </Button>
        <Button as={Link} to="/jobs" variant="outline">
          Browse jobs
        </Button>
      </div>
    </div>
  );
}
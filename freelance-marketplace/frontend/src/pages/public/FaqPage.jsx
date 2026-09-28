/**
 * FaqPage — a collapsible Q&A list.
 */

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import Card, { CardBody } from "../../components/ui/Card";
import { cn } from "../../utils/cn";

const FAQS = [
  {
    q: "Is it free to use?",
    a: "Yes. Creating an account, posting jobs, and applying to jobs are all free. Payments between users are handled outside the platform for now.",
  },
  {
    q: "How do I choose between freelancer and employer?",
    a: "You pick a role at signup. Freelancers apply to jobs and build a portfolio. Employers post jobs and hire. If you need to change your role, contact support.",
  },
  {
    q: "Can I apply to a job I posted?",
    a: "No — applications can only come from freelancers, and only on jobs they don't own. The system enforces this.",
  },
  {
    q: "When can I leave a review?",
    a: "Reviews unlock after a job is marked as completed. Only the two parties of the job — the employer and the accepted freelancer — can review each other.",
  },
  {
    q: "How do I contact another user?",
    a: "Once logged in, you can start a conversation from the other user's profile or from a job. Conversations are private to the two participants.",
  },
  {
    q: "What happens if I withdraw an application?",
    a: "The employer is notified, and the application moves to a withdrawn state. You cannot withdraw an accepted application.",
  },
  {
    q: "How do I close a job?",
    a: "Employers can change a job's status to Closed at any time from their dashboard. Closed jobs stop receiving new applications.",
  },
  {
    q: "Can I delete my account?",
    a: "Yes — from Settings. Deletion removes your profile, portfolio, and applications. Messages you've sent remain visible to the other party.",
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="max-w-3xl mx-auto px-4 py-14">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
        Frequently asked questions
      </h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Short answers to common questions.
      </p>

      <div className="mt-8 space-y-2">
        {FAQS.map((item, i) => {
          const open = openIndex === i;
          return (
            <Card key={item.q}>
              <button
                type="button"
                onClick={() => setOpenIndex(open ? -1 : i)}
                aria-expanded={open}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left focus-ring rounded-xl"
              >
                <span className="font-medium">{item.q}</span>
                <ChevronDown
                  size={18}
                  className={cn(
                    "text-slate-400 transition-transform shrink-0",
                    open && "rotate-180"
                  )}
                />
              </button>
              {open ? (
                <CardBody className="pt-0 text-sm text-slate-600 dark:text-slate-400 animate-fade-in">
                  {item.a}
                </CardBody>
              ) : null}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
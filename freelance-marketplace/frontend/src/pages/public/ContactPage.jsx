/**
 * ContactPage — static contact information and a demo form.
 *
 * The form currently validates client-side and shows a toast on submit;
 * a backend endpoint can be wired later (POST /api/contact/).
 */

import { useState } from "react";
import { Mail, MapPin, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card, { CardBody, CardHeader } from "../../components/ui/Card";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    // No backend call yet. Give honest feedback to the user.
    setTimeout(() => {
      setSubmitting(false);
      toast.success(
        "Thanks for reaching out! We'll get back to you shortly."
      );
      setForm({ name: "", email: "", message: "" });
    }, 400);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-14">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
        Get in touch
      </h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Questions, feedback, partnership ideas — we read everything.
      </p>

      <div className="mt-8 grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <h2 className="font-semibold">Contact details</h2>
          </CardHeader>
          <CardBody className="space-y-4 text-sm">
            <Detail icon={Mail} label="Email" value="support@example.com" />
            <Detail icon={MessageSquare} label="Response time" value="Usually within 24 hours" />
            <Detail icon={MapPin} label="Location" value="Remote-first" />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold">Send a message</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={onSubmit} className="space-y-4">
              <Input
                label="Your name"
                value={form.name}
                onChange={update("name")}
                required
              />
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={update("email")}
                required
              />
              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  value={form.message}
                  onChange={update("message")}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus-ring resize-y"
                />
              </div>
              <Button type="submit" className="w-full" loading={submitting}>
                Send message
              </Button>
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                Demo form: no message is actually sent yet.
              </p>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function Detail({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-300 flex items-center justify-center shrink-0">
        <Icon size={16} />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <p className="text-slate-800 dark:text-slate-200">{value}</p>
      </div>
    </div>
  );
}
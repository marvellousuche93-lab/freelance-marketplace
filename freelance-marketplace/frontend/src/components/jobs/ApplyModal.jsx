/**
 * ApplyModal — freelancer's application form for a job.
 *
 * Posts to POST /api/applications/. On success, closes and calls
 * onApplied() so the parent can update the UI.
 */

import { useState } from "react";
import toast from "react-hot-toast";

import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import { applyToJob } from "../../api/applications";
import { extractErrorMessage } from "../../api/errors";

export default function ApplyModal({ open, onClose, job, onApplied }) {
  const [form, setForm] = useState({
    cover_letter: "",
    proposed_price: "",
    estimated_duration: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function reset() {
    setForm({ cover_letter: "", proposed_price: "", estimated_duration: "" });
    setError("");
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await applyToJob({
        job: job.id,
        cover_letter: form.cover_letter,
        proposed_price: form.proposed_price,
        estimated_duration: form.estimated_duration,
      });
      toast.success("Application submitted!");
      reset();
      onApplied?.();
      onClose();
    } catch (err) {
      const msg = extractErrorMessage(err, "Could not submit application.");
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    if (submitting) return;
    reset();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`Apply to "${job?.title ?? ""}"`}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={submitting}
            onClick={onSubmit}
            disabled={
              !form.cover_letter ||
              form.cover_letter.length < 20 ||
              !form.proposed_price
            }
          >
            Submit application
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {error ? (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm dark:border-red-900 dark:bg-red-950 dark:text-red-300"
          >
            {error}
          </div>
        ) : null}

        <div>
          <label
            htmlFor="apply-cover"
            className="block text-sm font-medium mb-1.5"
          >
            Cover letter
          </label>
          <textarea
            id="apply-cover"
            rows={6}
            value={form.cover_letter}
            onChange={update("cover_letter")}
            placeholder="Explain why you're a great fit. Minimum 20 characters."
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus-ring resize-y"
            required
            minLength={20}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {form.cover_letter.length} characters
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Proposed price"
            type="number"
            min={0}
            step="0.01"
            required
            value={form.proposed_price}
            onChange={update("proposed_price")}
            helper="Your total (or hourly) price."
          />
          <Input
            label="Estimated duration"
            placeholder="e.g. 2 weeks"
            value={form.estimated_duration}
            onChange={update("estimated_duration")}
          />
        </div>
      </form>
    </Modal>
  );
}
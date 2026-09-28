/**
 * PostJobPage — the employer creates a new job.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import PageHeader from "../../components/dashboard/PageHeader";
import JobForm from "../../components/jobs/JobForm";
import { createJob } from "../../api/jobs";
import { extractErrorMessage } from "../../api/errors";

export default function PostJobPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(payload) {
    setError("");
    setSubmitting(true);
    try {
      const job = await createJob(payload);
      toast.success("Job posted!");
      if (payload.status === "DRAFT") {
        navigate("/dashboard/jobs");
      } else {
        navigate(`/jobs/${job.slug}`);
      }
    } catch (err) {
      const msg = extractErrorMessage(err, "Could not create job.");
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Post a job"
        description="Describe the work. You can save it as a draft first."
      />
      <JobForm
        onSubmit={onSubmit}
        submitting={submitting}
        error={error}
        submitLabel="Post Job"
        onCancel={() => navigate("/dashboard/jobs")}
      />
    </div>
  );
}
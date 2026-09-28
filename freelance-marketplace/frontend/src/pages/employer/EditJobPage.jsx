/**
 * EditJobPage — update an existing job.
 *
 * Loads the job by slug, then submits via updateJob.
 */

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import PageHeader from "../../components/dashboard/PageHeader";
import JobForm from "../../components/jobs/JobForm";
import Skeleton from "../../components/loaders/Skeleton";
import ContentState from "../../components/loaders/ContentState";
import useFetch from "../../hooks/useFetch";
import { getJob, updateJob } from "../../api/jobs";
import { extractErrorMessage } from "../../api/errors";

export default function EditJobPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const job = useFetch(() => getJob(slug), [slug]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
  }, [slug]);

  async function onSubmit(payload) {
    setError("");
    setSubmitting(true);
    try {
      const updated = await updateJob(slug, payload);
      toast.success("Job updated.");
      navigate(`/jobs/${updated.slug}`);
    } catch (err) {
      const msg = extractErrorMessage(err, "Could not update job.");
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Edit job"
        description="Update the details, budget, or status."
      />

      <ContentState
        loading={job.loading}
        error={job.error}
        isEmpty={false}
        onRetry={job.refetch}
        loadingFallback={<Skeleton.Card withHeader withFooter />}
      >
        {job.data ? (
          <JobForm
            initial={job.data}
            onSubmit={onSubmit}
            submitting={submitting}
            error={error}
            submitLabel="Save Changes"
            onCancel={() => navigate("/dashboard/jobs")}
          />
        ) : null}
      </ContentState>
    </div>
  );
}
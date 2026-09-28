/**
 * PortfolioCreatePage — create a new portfolio project.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import PageHeader from "../../components/dashboard/PageHeader";
import PortfolioForm from "../../components/portfolio/PortfolioForm";
import { createPortfolio } from "../../api/portfolios";
import { extractErrorMessage } from "../../api/errors";
import { toFormData } from "../../utils/formData";

export default function PortfolioCreatePage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(payload) {
    setError("");
    setSubmitting(true);
    try {
      const fd = toFormData(payload);
      await createPortfolio(fd);
      toast.success("Project added.");
      navigate("/dashboard/portfolio");
    } catch (err) {
      const msg = extractErrorMessage(err, "Could not save project.");
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="New portfolio project"
        description="Add one piece of work. You can attach more images after saving."
      />
      <PortfolioForm
        onSubmit={onSubmit}
        submitting={submitting}
        error={error}
        submitLabel="Add project"
        onCancel={() => navigate("/dashboard/portfolio")}
      />
    </div>
  );
}
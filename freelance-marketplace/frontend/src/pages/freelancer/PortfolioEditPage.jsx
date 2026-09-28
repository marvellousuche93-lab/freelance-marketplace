/**
 * PortfolioEditPage — update a portfolio project, manage gallery images.
 *
 * On load: fetches the project by slug.
 * Gallery: shows existing images, allows upload and delete.
 */

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Trash2, Upload } from "lucide-react";
import toast from "react-hot-toast";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card, { CardBody, CardHeader } from "../../components/ui/Card";
import Skeleton from "../../components/loaders/Skeleton";
import ContentState from "../../components/loaders/ContentState";
import PageHeader from "../../components/dashboard/PageHeader";
import PortfolioForm from "../../components/portfolio/PortfolioForm";
import useFetch from "../../hooks/useFetch";
import {
  getPortfolio,
  updatePortfolio,
  addPortfolioImage,
  deletePortfolioImage,
} from "../../api/portfolios";
import { extractErrorMessage } from "../../api/errors";
import { toFormData } from "../../utils/formData";

export default function PortfolioEditPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const portfolio = useFetch(() => getPortfolio(slug), [slug]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(payload) {
    setError("");
    setSubmitting(true);
    try {
      const fd = toFormData(payload);
      await updatePortfolio(slug, fd);
      toast.success("Project updated.");
      portfolio.refetch();
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
        title="Edit project"
        description="Update the details, cover image, and gallery."
      />

      <ContentState
        loading={portfolio.loading}
        error={portfolio.error}
        isEmpty={false}
        onRetry={portfolio.refetch}
        loadingFallback={<Skeleton.Card withHeader withFooter />}
      >
        {portfolio.data ? (
          <>
            <PortfolioForm
              initial={portfolio.data}
              onSubmit={onSubmit}
              submitting={submitting}
              error={error}
              submitLabel="Save changes"
              onCancel={() => navigate("/dashboard/portfolio")}
            />

            <GalleryManager
              slug={slug}
              images={portfolio.data.images || []}
              onChanged={portfolio.refetch}
            />
          </>
        ) : null}
      </ContentState>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function GalleryManager({ slug, images, onChanged }) {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [order, setOrder] = useState("");
  const [uploading, setUploading] = useState(false);

  async function upload() {
    if (!file) {
      toast.error("Choose an image first.");
      return;
    }
    setUploading(true);
    try {
      await addPortfolioImage(slug, {
        image: file,
        caption: caption || undefined,
        order: order === "" ? undefined : Number(order),
      });
      toast.success("Image added.");
      setFile(null);
      setCaption("");
      setOrder("");
      onChanged?.();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not upload image."));
    } finally {
      setUploading(false);
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete this image?")) return;
    try {
      await deletePortfolioImage(slug, id);
      toast.success("Image removed.");
      onChanged?.();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not delete image."));
    }
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold">Gallery</h2>
      </CardHeader>
      <CardBody className="space-y-4">
        {/* Existing images */}
        {images.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No gallery images yet. Add a few screenshots or mockups.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((img) => (
              <div
                key={img.id}
                className="relative rounded-lg overflow-hidden group aspect-square bg-slate-100 dark:bg-slate-800"
              >
                <img
                  src={img.image}
                  alt={img.caption || ""}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => remove(img.id)}
                  aria-label="Delete image"
                  className="absolute top-2 right-2 inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 text-red-600 shadow border border-slate-200 dark:border-slate-800 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
                {img.caption ? (
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-white text-xs truncate">
                    {img.caption}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}

        {/* Upload new */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-3">
          <h3 className="text-sm font-medium">Add image</h3>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-slate-600 dark:text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-brand-600 file:text-white hover:file:bg-brand-700 file:cursor-pointer"
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <Input
              label="Caption (optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
            <Input
              label="Order (optional)"
              type="number"
              min={0}
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              helper="Lower numbers appear first."
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={upload} loading={uploading} variant="outline">
              <Upload size={14} /> Upload image
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
/**
 * PortfolioPage — the freelancer's portfolio manager.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { Edit3, LayoutGrid, PlusCircle, Star, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import Button from "../../components/ui/Button";
import Card, { CardBody } from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import Skeleton from "../../components/loaders/Skeleton";
import ContentState from "../../components/loaders/ContentState";
import PageHeader from "../../components/dashboard/PageHeader";
import EmptyState from "../../components/dashboard/EmptyState";
import useFetch from "../../hooks/useFetch";
import { listMyPortfolios, deletePortfolio } from "../../api/portfolios";
import { extractErrorMessage } from "../../api/errors";
import { formatDate } from "../../utils/format";

export default function PortfolioPage() {
  const portfolios = useFetch(() => listMyPortfolios(), []);
  const items = portfolios.data?.results ?? [];

  const [toDelete, setToDelete] = useState(null);

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await deletePortfolio(toDelete.slug);
      toast.success("Project deleted.");
      setToDelete(null);
      portfolios.refetch();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not delete."));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My portfolio"
        description="Showcase your best work to employers."
        actions={
          <Button as={Link} to="/dashboard/portfolio/new">
            <PlusCircle size={16} /> Add project
          </Button>
        }
      />

      <ContentState
        loading={portfolios.loading}
        error={portfolios.error}
        isEmpty={!portfolios.loading && !portfolios.error && items.length === 0}
        onRetry={portfolios.refetch}
        loadingFallback={
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton.Card key={i} withHeader withFooter />
            ))}
          </div>
        }
        emptyFallback={
          <EmptyState
            icon={LayoutGrid}
            title="No portfolio projects yet"
            description="Add your best work — screenshots, links, and a short description for each."
            actionLabel="Add your first project"
            actionTo="/dashboard/portfolio/new"
          />
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((project) => (
            <PortfolioCard
              key={project.id}
              project={project}
              onDelete={() => setToDelete(project)}
            />
          ))}
        </div>
      </ContentState>

      <Modal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Delete this project?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-700 dark:text-slate-300">
          Deleting <strong>{toDelete?.title}</strong> is permanent. The cover
          image and any gallery images will also be removed.
        </p>
      </Modal>
    </div>
  );
}

function PortfolioCard({ project, onDelete }) {
  return (
    <Card className="flex flex-col overflow-hidden">
      {project.featured_image ? (
        <div className="aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <img
            src={project.featured_image}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-video bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
          <LayoutGrid size={26} />
        </div>
      )}
      <CardBody className="flex-1 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight line-clamp-2">
            {project.title}
          </h3>
          {project.is_featured ? (
            <span
              className="inline-flex items-center gap-1 text-amber-600 shrink-0"
              title="Featured"
            >
              <Star size={14} fill="currentColor" />
            </span>
          ) : null}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {project.image_count || 0} image
          {(project.image_count || 0) === 1 ? "" : "s"}
          {project.start_date ? ` · ${formatDate(project.start_date)}` : ""}
        </p>
      </CardBody>
      <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
        <Button
          as={Link}
          to={`/dashboard/portfolio/${project.slug}/edit`}
          variant="outline"
          size="sm"
        >
          <Edit3 size={14} /> Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
          aria-label={`Delete ${project.title}`}
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </Card>
  );
}
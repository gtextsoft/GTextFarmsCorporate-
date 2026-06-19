import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPage } from "@/components/admin/AdminPage";
import { DetailFieldGrid, RecordDetailDialog } from "@/components/admin/RecordDetailDialog";
import { PublishedBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { listAdminNewsFn } from "@/lib/api/admin.news.functions";

type NewsRow = Awaited<ReturnType<typeof listAdminNewsFn>> extends (infer U)[] ? U : never;

export const Route = createFileRoute("/admin/news/")({
  loader: () => listAdminNewsFn(),
  component: AdminNewsPage,
});

function AdminNewsPage() {
  const posts = Route.useLoaderData();
  const [selected, setSelected] = useState<NewsRow | null>(null);

  if ("error" in posts) {
    return (
      <AdminPage title="News" description="Manage news and updates.">
        <p className="text-muted-foreground">{posts.error}</p>
      </AdminPage>
    );
  }

  return (
    <AdminPage
      title="News & updates"
      description="Farm activity, harvest reports, and investor updates on the public /news page."
      stats={[
        { label: "Total posts", value: posts.length },
        { label: "Published", value: posts.filter((p) => p.published).length },
      ]}
      actions={
        <>
          <Button variant="outline" asChild>
            <Link to="/news">View public page</Link>
          </Button>
          <Button asChild>
            <Link to="/admin/news/new">Add post</Link>
          </Button>
        </>
      }
    >
      <AdminDataTable
        data={posts}
        getRowKey={(row) => row.slug}
        onRowClick={setSelected}
        emptyMessage="No posts yet."
        columns={[
          { id: "title", header: "Title", cell: (post) => post.title },
          {
            id: "category",
            header: "Category",
            hideOnMobile: true,
            cell: (post) => post.categoryLabel,
            className: "text-muted-foreground",
          },
          {
            id: "published",
            header: "Status",
            cell: (post) => <PublishedBadge published={post.published} />,
          },
          {
            id: "date",
            header: "Date",
            hideOnMobile: true,
            cell: (post) =>
              post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "—",
            className: "text-muted-foreground",
          },
        ]}
      />

      <RecordDetailDialog
        open={selected != null}
        onOpenChange={(open) => !open && setSelected(null)}
        title={selected?.title ?? "News post"}
        description={selected?.categoryLabel}
        size="lg"
        footer={
          selected && (
            <Button asChild>
              <Link to="/admin/news/$postSlug" params={{ postSlug: selected.slug }}>
                Edit post
              </Link>
            </Button>
          )
        }
      >
        {selected && (
          <DetailFieldGrid
            fields={[
              { label: "Slug", value: selected.slug },
              {
                label: "Published",
                value: <PublishedBadge published={selected.published} />,
              },
              {
                label: "Published date",
                value: selected.publishedAt
                  ? new Date(selected.publishedAt).toLocaleString()
                  : "—",
              },
            ]}
          />
        )}
      </RecordDetailDialog>
    </AdminPage>
  );
}

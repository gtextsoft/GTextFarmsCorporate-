import { Link, createFileRoute, useRouteContext, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import { changePasswordFn, updateProfileFn } from "@/lib/api/auth.functions";
import { formatNgPhoneDisplay } from "@/lib/phone";

export const Route = createFileRoute("/field/profile/")({
  head: () => ({ meta: [{ title: "Profile — Field Officer" }] }),
  component: FieldProfilePage,
});

function FieldProfilePage() {
  const { user } = useRouteContext({ from: "__root__" });
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [passwordPending, setPasswordPending] = useState(false);

  if (!user) return null;

  const phoneDisplay = user.phone ? formatNgPhoneDisplay(user.phone) : "";

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-lg">
        <Link to="/field" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to reports
        </Link>
        <SectionHeader
          eyebrow="Account"
          title="Field officer profile."
          sub="Update your contact details and password."
        />

        <div className="mt-8 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft text-sm">
            <dl className="space-y-3">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Email</dt>
                <dd>{user.email}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Role</dt>
                <dd className="capitalize">{user.role.replace("_", " ")}</dd>
              </div>
            </dl>
          </div>

          <form
            className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft"
            onSubmit={async (e) => {
              e.preventDefault();
              setPending(true);
              const form = new FormData(e.currentTarget);
              try {
                const result = await updateProfileFn({
                  data: {
                    fullName: String(form.get("fullName")),
                    phone: String(form.get("phone")),
                  },
                });
                if ("error" in result && result.error) toast.error(result.error);
                else {
                  toast.success("Profile updated");
                  await router.invalidate();
                }
              } finally {
                setPending(false);
              }
            }}
          >
            <h3 className="font-semibold">Contact</h3>
            <label className="block text-sm">
              <span className="font-medium">Full name</span>
              <input
                name="fullName"
                defaultValue={user.fullName}
                required
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Phone</span>
              <input
                name="phone"
                type="tel"
                defaultValue={phoneDisplay}
                placeholder="08012345678"
                required
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              />
            </label>
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save"}
            </button>
          </form>

          <form
            className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft"
            onSubmit={async (e) => {
              e.preventDefault();
              setPasswordPending(true);
              const form = new FormData(e.currentTarget);
              try {
                const result = await changePasswordFn({
                  data: {
                    currentPassword: String(form.get("currentPassword")),
                    newPassword: String(form.get("newPassword")),
                  },
                });
                if ("error" in result && result.error) toast.error(result.error);
                else {
                  toast.success("Password updated");
                  e.currentTarget.reset();
                }
              } finally {
                setPasswordPending(false);
              }
            }}
          >
            <h3 className="font-semibold">Change password</h3>
            <label className="block text-sm">
              <span className="font-medium">Current password</span>
              <input
                name="currentPassword"
                type="password"
                required
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">New password</span>
              <input
                name="newPassword"
                type="password"
                required
                minLength={8}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              />
            </label>
            <button
              type="submit"
              disabled={passwordPending}
              className="w-full rounded-full border border-border px-4 py-2.5 text-sm font-medium hover:bg-secondary disabled:opacity-60"
            >
              {passwordPending ? "Updating…" : "Update password"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CirclePlus,
  FileText,
  Headphones,
  HelpCircle,
  Mail,
  MapPin,
  Phone,
  Receipt,
  ShieldCheck,
  Sprout,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { submitContactFn } from "@/lib/api/contact.functions";
import { brand } from "@/lib/brand";
import type { SafeUser } from "@/lib/types";
import { cn } from "@/lib/utils";

type FaqItem = { q: string; a: string };

const QUICK_HELP = [
  {
    title: "KYC verification",
    description: "Identity checks, document uploads, and approval status.",
    icon: ShieldCheck,
    to: "/auth/kyc" as const,
    tone: "bg-emerald-50 text-emerald-700",
  },
  {
    title: "Fund wallet",
    description: "Deposits via Paystack and balance questions.",
    icon: Wallet,
    to: "/app/wallet" as const,
    tone: "bg-sky-50 text-sky-700",
  },
  {
    title: "Invest in a cycle",
    description: "Browse opportunities and complete investments.",
    icon: CirclePlus,
    to: "/app/invest" as const,
    tone: "bg-lime/20 text-forest-deep",
  },
  {
    title: "Withdrawals",
    description: "Bank transfers and pending withdrawal requests.",
    icon: Receipt,
    to: "/app/wallet" as const,
    tone: "bg-violet-50 text-violet-700",
  },
  {
    title: "Farm performance",
    description: "Field reports, mortality, and production metrics.",
    icon: Sprout,
    to: "/app/activity" as const,
    tone: "bg-amber-50 text-amber-700",
  },
  {
    title: "Transactions",
    description: "Receipts, deposits, and payout history.",
    icon: FileText,
    to: "/app/reports" as const,
    tone: "bg-rose-50 text-rose-700",
  },
] as const;

const SUPPORT_TOPICS = [
  { value: "kyc", label: "KYC verification", subject: "KYC support request" },
  { value: "wallet", label: "Wallet & deposits", subject: "Wallet support request" },
  { value: "investment", label: "Investments", subject: "Investment support request" },
  { value: "withdrawal", label: "Withdrawals", subject: "Withdrawal support request" },
  { value: "returns", label: "Returns & payouts", subject: "Returns support request" },
  { value: "technical", label: "Technical issue", subject: "Technical support request" },
  { value: "other", label: "Other", subject: "Investor support request" },
] as const;

export function InvestorSupportDashboard({
  faq,
  user,
}: {
  faq: FaqItem[];
  user?: SafeUser | null;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [topic, setTopic] = useState<string>("investment");
  const [subject, setSubject] = useState("Investment support request");

  function handleTopicChange(value: string) {
    setTopic(value);
    const match = SUPPORT_TOPICS.find((t) => t.value === value);
    if (match) setSubject(match.subject);
  }

  return (
    <div className="mt-8 space-y-8">
      <section className="rounded-2xl border border-forest/15 bg-forest/5 p-5 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-forest/10 text-forest-deep">
              <Headphones className="size-5" />
            </span>
            <div>
              <h2 className="font-semibold">Investor support</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                We typically respond within one business day. For urgent wallet issues, include
                your transaction reference.
              </p>
            </div>
          </div>
          <a
            href={`mailto:${brand.contact.investEmail}`}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-forest-deep px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            <Mail className="size-4" />
            {brand.contact.investEmail}
          </a>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Quick help
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {QUICK_HELP.map((item) => (
            <Link
              key={item.title}
              to={item.to}
              className="group rounded-2xl border border-border/70 bg-card p-4 shadow-soft transition hover:border-forest/20 hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <span className={cn("grid size-10 place-items-center rounded-xl", item.tone)}>
                  <item.icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium group-hover:text-forest-deep">{item.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                </div>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="lg:col-span-2">
          <div className="flex items-center gap-2">
            <HelpCircle className="size-5 text-forest-deep" />
            <h2 className="font-semibold">Frequently asked questions</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Common questions from investors on the platform.
          </p>

          {faq.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              No FAQ entries published yet. Send us a message and we&apos;ll help directly.
            </p>
          ) : (
            <Accordion type="single" collapsible className="mt-4 rounded-2xl border border-border bg-card px-4 shadow-soft">
              {faq.map((item, index) => (
                <AccordionItem key={item.q} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left hover:no-underline">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}

          <div className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h3 className="font-semibold">Contact channels</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 size-4 text-forest-deep" />
                <div>
                  <dt className="font-medium">Investor relations</dt>
                  <dd>
                    <a
                      href={`mailto:${brand.contact.investEmail}`}
                      className="text-muted-foreground hover:text-forest-deep hover:underline"
                    >
                      {brand.contact.investEmail}
                    </a>
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 size-4 text-forest-deep" />
                <div>
                  <dt className="font-medium">Phone</dt>
                  <dd className="font-numeric text-muted-foreground">{brand.contact.phone}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 text-forest-deep" />
                <div>
                  <dt className="font-medium">Office</dt>
                  <dd className="text-muted-foreground">{brand.contact.office}</dd>
                </div>
              </div>
            </dl>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-soft lg:col-span-3">
          {submitted ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
              <span className="grid size-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
                <Mail className="size-7" />
              </span>
              <h3 className="mt-4 text-xl font-semibold">Message received</h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Thanks for reaching out. Our investor support team will reply to{" "}
                <span className="font-medium text-foreground">{user?.email ?? "your email"}</span>{" "}
                within one business day.
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-6 rounded-xl"
                onClick={() => setSubmitted(false)}
              >
                Send another message
              </Button>
            </div>
          ) : (
            <>
              <h2 className="font-semibold">Send a support request</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Describe your issue and we&apos;ll route it to the right team member.
              </p>

              <form
                className="mt-6 space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setPending(true);
                  const form = new FormData(e.currentTarget);
                  try {
                    const result = await submitContactFn({
                      data: {
                        name: String(form.get("name")),
                        email: String(form.get("email")),
                        phone: String(form.get("phone") || "") || undefined,
                        subject: String(form.get("subject")),
                        message: String(form.get("message")),
                        intent: "investment",
                      },
                    });
                    if ("error" in result && result.error) {
                      toast.error(String(result.error));
                    } else {
                      setSubmitted(true);
                      toast.success("Support request sent");
                    }
                  } catch {
                    toast.error("Could not send message. Please email us directly.");
                  } finally {
                    setPending(false);
                  }
                }}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="support-name">Full name</Label>
                    <Input
                      id="support-name"
                      name="name"
                      required
                      defaultValue={user?.fullName ?? ""}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="support-email">Email</Label>
                    <Input
                      id="support-email"
                      name="email"
                      type="email"
                      required
                      defaultValue={user?.email ?? ""}
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="support-phone">Phone</Label>
                    <Input
                      id="support-phone"
                      name="phone"
                      type="tel"
                      defaultValue={user?.phone ?? ""}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="support-topic">Topic</Label>
                    <Select value={topic} onValueChange={handleTopicChange}>
                      <SelectTrigger id="support-topic" className="mt-1.5 rounded-xl">
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPORT_TOPICS.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="support-subject">Subject</Label>
                  <Input
                    id="support-subject"
                    name="subject"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="support-message">Message</Label>
                  <Textarea
                    id="support-message"
                    name="message"
                    rows={5}
                    required
                    placeholder="Include any transaction references, cycle names, or screenshots that help us assist you faster."
                    className="mt-1.5"
                  />
                </div>

                <Button type="submit" disabled={pending} className="w-full rounded-xl">
                  {pending ? "Sending…" : "Submit support request"}
                </Button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useTransition } from "react";
import { Bot, CheckCircle2, Copy, Link2, MessageCircle, RefreshCw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { createTelegramLinkCode } from "@/lib/actions/telegram/accounts";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type TelegramAccount = {
  telegram_username: string | null;
  telegram_first_name: string | null;
  telegram_last_name: string | null;
  linked_at: string;
  last_seen_at: string;
  is_active: boolean;
};

type LinkCodeState = {
  code: string;
  expiresAt: string;
} | null;

function formatTimeRemaining(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) {
    return "Expired";
  }

  const totalSeconds = Math.floor(diff / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")} left`;
}

function formatLinkedIdentity(account: TelegramAccount) {
  if (account.telegram_username) {
    return `@${account.telegram_username}`;
  }

  const fullName = [account.telegram_first_name, account.telegram_last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || "Telegram account linked";
}

export function TelegramLinkPanel() {
  const [account, setAccount] = useState<TelegramAccount | null>(null);
  const [linkCode, setLinkCode] = useState<LinkCodeState>(null);
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    async function loadConnectionState() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (!cancelled) {
            setLoading(false);
          }
          return;
        }

        const [{ data: accountData }, { data: linkCodeData }] = await Promise.all([
          supabase
            .from("telegram_accounts")
            .select("telegram_username, telegram_first_name, telegram_last_name, linked_at, last_seen_at, is_active")
            .eq("user_id", user.id)
            .maybeSingle(),
          supabase
            .from("telegram_link_codes")
            .select("code, expires_at, consumed_at")
            .eq("user_id", user.id)
            .is("consumed_at", null)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);

        if (cancelled) {
          return;
        }

        setAccount(accountData ?? null);

        if (linkCodeData && new Date(linkCodeData.expires_at).getTime() > Date.now()) {
          setLinkCode({
            code: linkCodeData.code,
            expiresAt: linkCodeData.expires_at,
          });
        } else {
          setLinkCode(null);
        }
      } catch (error) {
        console.error("Error loading Telegram connection state:", error);
        if (!cancelled) {
          toast.error("Failed to load Telegram connection status.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadConnectionState();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!linkCode) {
      setTimeRemaining(null);
      return;
    }

    setTimeRemaining(formatTimeRemaining(linkCode.expiresAt));
    const timer = window.setInterval(() => {
      const remaining = formatTimeRemaining(linkCode.expiresAt);
      setTimeRemaining(remaining);
      if (remaining === "Expired") {
        setLinkCode(null);
        window.clearInterval(timer);
      }
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [linkCode]);

  const commandText = linkCode ? `/link ${linkCode.code}` : "";

  const handleGenerateCode = () => {
    startTransition(async () => {
      const result = await createTelegramLinkCode();
      if (result.error) {
        toast.error(result.error);
        return;
      }

      setLinkCode({
        code: result.code,
        expiresAt: result.expiresAt,
      });
      toast.success("Telegram link code generated.");
    });
  };

  const handleCopy = async (value: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(successMessage);
    } catch (error) {
      console.error("Clipboard write failed:", error);
      toast.error("Could not copy to clipboard.");
    }
  };

  if (loading) {
    return (
      <Card className="overflow-hidden border-orange-100">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="h-6 w-40 animate-pulse rounded bg-orange-100" />
          <div className="h-4 w-72 animate-pulse rounded bg-orange-100" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-24 animate-pulse rounded-xl bg-stone-100" />
          <div className="h-20 animate-pulse rounded-xl bg-stone-100" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-orange-100 shadow-[0_18px_60px_-32px_rgba(234,88,12,0.45)]">
      <CardHeader className="bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.24),_transparent_45%),linear-gradient(135deg,rgba(255,247,237,1),rgba(255,237,213,0.72))]">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-950 text-amber-300">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl">Connect Telegram</CardTitle>
                <CardDescription>
                  Link your Addis GigFind account to the bot so you can receive workflow updates inside Telegram.
                </CardDescription>
              </div>
            </div>
          </div>
          <Badge
            variant={account?.is_active ? "default" : "outline"}
            className={account?.is_active ? "bg-emerald-600 text-white hover:bg-emerald-600" : "border-orange-200 bg-white/80 text-orange-700"}
          >
            {account?.is_active ? "Connected" : "Not linked"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-stone-900">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Link flow
            </div>
            <div className="space-y-3 text-sm text-stone-600">
              <div className="flex gap-3 rounded-xl bg-white p-3 shadow-sm">
                <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">1</div>
                <p>Generate a one-time code here. The code expires after 10 minutes.</p>
              </div>
              <div className="flex gap-3 rounded-xl bg-white p-3 shadow-sm">
                <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">2</div>
                <p>Open Telegram and send the exact command to <span className="font-medium text-stone-900">@gigaddisbot</span>.</p>
              </div>
              <div className="flex gap-3 rounded-xl bg-white p-3 shadow-sm">
                <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">3</div>
                <p>Once linked, the bot will recognize your role and future messages will route to your Addis GigFind account.</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-stone-900">
              <Link2 className="h-4 w-4 text-orange-600" />
              Current status
            </div>

            {account ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                    <CheckCircle2 className="h-4 w-4" />
                    Linked to {formatLinkedIdentity(account)}
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-emerald-900/80">
                    <p>Linked on {new Date(account.linked_at).toLocaleString()}</p>
                    <p>Last seen {new Date(account.last_seen_at).toLocaleString()}</p>
                  </div>
                </div>
                <p className="text-xs text-stone-500">
                  You can generate a new code only if you want to relink or move to another Telegram account later.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-xl border border-dashed border-orange-200 bg-orange-50/60 p-4 text-sm text-orange-900">
                  No Telegram account is linked to this profile yet.
                </div>
                <p className="text-xs text-stone-500">
                  After you link once, this panel will show the Telegram identity connected to your Addis GigFind account.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-stone-200 bg-stone-950 p-5 text-stone-50">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
                <MessageCircle className="h-4 w-4" />
                One-time Telegram command
              </div>
              <p className="mt-1 text-sm text-stone-300">
                Generate a code and send it to the bot exactly once.
              </p>
            </div>
            <Button
              onClick={handleGenerateCode}
              disabled={isPending}
              className="bg-amber-500 text-stone-950 hover:bg-amber-400"
            >
              {isPending ? "Generating..." : linkCode ? "Refresh Code" : "Generate Code"}
              <RefreshCw className={`ml-2 h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {linkCode ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Link code</p>
                    <p className="mt-2 font-mono text-3xl font-semibold tracking-[0.3em] text-amber-300">
                      {linkCode.code}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-white/10 text-white hover:bg-white/10">{timeRemaining ?? "..."}</Badge>
                    <Button
                      variant="outline"
                      className="border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
                      onClick={() => handleCopy(linkCode.code, "Link code copied.")}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy code
                    </Button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Send this to Telegram</p>
                <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <code className="overflow-x-auto rounded-xl bg-black/40 px-4 py-3 text-sm text-emerald-300">
                    {commandText}
                  </code>
                  <Button
                    variant="outline"
                    className="border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
                    onClick={() => handleCopy(commandText, "Telegram command copied.")}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy command
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-5 text-sm text-stone-300">
              No active link code yet. Generate one when you are ready to message the bot.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

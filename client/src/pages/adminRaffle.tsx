import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Trophy, Download, Shuffle, Eye, EyeOff } from "lucide-react";

interface RaffleEntry {
  id: number;
  email: string;
  name: string | null;
  ticketTierId: string;
  entryCount: number;
  entryNumbers: string[];
  stripeSessionId: string;
  purchasedAt: string;
  paymentStatus: string;
}

interface Winner {
  name: string;
  email: string;
  entryNumber: string;
}

const TIER_LABELS: Record<string, string> = {
  single:    "Single Entry",
  supporter: "Supporter Pack",
  champion:  "Champion Pack",
};

export default function AdminRaffle() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [entries, setEntries] = useState<RaffleEntry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [entriesError, setEntriesError] = useState<string | null>(null);

  const [winner, setWinner] = useState<Winner | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch("/api/admin/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setAuthenticated(true);
        loadEntries(password);
      } else {
        const data = await res.json();
        setAuthError(data.error || "Invalid password.");
      }
    } catch {
      setAuthError("Connection error. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function loadEntries(pw: string) {
    setEntriesLoading(true);
    setEntriesError(null);
    try {
      const res = await fetch("/api/admin/raffle-entries", {
        headers: { "x-admin-password": pw },
      });
      if (!res.ok) {
        setEntriesError("Failed to load entries.");
        return;
      }
      const data = await res.json();
      setEntries(data.data ?? []);
    } catch {
      setEntriesError("Connection error while loading entries.");
    } finally {
      setEntriesLoading(false);
    }
  }

  function handleExportCSV() {
    const paidEntries = entries.filter((e) => e.paymentStatus === "paid");
    const headers = ["Name", "Email", "Tier", "Entry Numbers", "Purchase Date", "Status"];
    const rows = paidEntries.map((e) => [
      e.name ?? "",
      e.email,
      TIER_LABELS[e.ticketTierId] ?? e.ticketTierId,
      e.entryNumbers.join("; "),
      new Date(e.purchasedAt).toLocaleDateString("en-US"),
      e.paymentStatus,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `raffle-entries-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleSelectWinner() {
    const paidEntries = entries.filter((e) => e.paymentStatus === "paid");
    const pool: Array<{ entryNumber: string; entry: RaffleEntry }> = [];
    paidEntries.forEach((entry) => {
      entry.entryNumbers.forEach((num) => {
        pool.push({ entryNumber: num, entry });
      });
    });
    if (pool.length === 0) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setWinner({
      name: pick.entry.name ?? "Unknown",
      email: pick.entry.email,
      entryNumber: pick.entryNumber,
    });
  }

  const confirmedEntries = entries.filter((e) => e.paymentStatus === "paid");
  const totalConfirmedEntryNumbers = confirmedEntries.reduce(
    (sum, e) => sum + e.entryNumbers.length,
    0
  );

  // ── Password screen ──────────────────────────────────────────────────────
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#0D1B2A] flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-bold leading-tight">Admin Access</h1>
              <p className="text-xs text-muted-foreground">Rising Promise Raffle</p>
            </div>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="admin-password">
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]"
                  placeholder="Enter admin password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {authError && (
              <p className="text-sm text-red-600">{authError}</p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={authLoading || !password}
            >
              {authLoading ? "Verifying…" : "Access Admin"}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  // ── Admin dashboard ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header style={{ background: "#0D1B2A" }} className="px-6 py-4 flex items-center justify-between">
        <div>
          <span className="text-white font-heading font-bold text-lg">Rising Promise</span>
          <span className="text-white/50 text-sm ml-3">/ Raffle Admin</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-white/70 hover:text-white hover:bg-white/10"
          onClick={() => setAuthenticated(false)}
        >
          Sign out
        </Button>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Confirmed Purchasers</p>
            <p className="text-4xl font-heading font-bold text-primary">{confirmedEntries.length}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Total Entry Numbers</p>
            <p className="text-4xl font-heading font-bold text-primary">{totalConfirmedEntryNumbers}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Pending / Unconfirmed</p>
            <p className="text-4xl font-heading font-bold text-muted-foreground">
              {entries.filter((e) => e.paymentStatus !== "paid").length}
            </p>
          </Card>
        </div>

        {/* Winner display */}
        {winner && (
          <Card className="p-8 mb-8 border-2 border-amber-400 bg-amber-50">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-8 h-8 text-amber-500" />
              <h2 className="font-heading text-2xl font-bold">Selected Winner</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Name</p>
                <p className="text-xl font-bold">{winner.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Email</p>
                <p className="text-xl font-bold">{winner.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Winning Entry</p>
                <p className="text-xl font-bold font-mono text-amber-700">{winner.entryNumber}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              This result is not automatically sent. Contact the winner directly.
            </p>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button
            onClick={() => loadEntries(password)}
            variant="outline"
            disabled={entriesLoading}
          >
            {entriesLoading ? "Loading…" : "Refresh"}
          </Button>
          <Button
            onClick={handleExportCSV}
            variant="outline"
            disabled={confirmedEntries.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button
            onClick={handleSelectWinner}
            disabled={totalConfirmedEntryNumbers === 0}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            <Shuffle className="w-4 h-4 mr-2" />
            Select Winner
          </Button>
        </div>

        {/* Entries table */}
        {entriesError && (
          <p className="text-red-600 text-sm mb-4">{entriesError}</p>
        )}

        {entries.length === 0 && !entriesLoading ? (
          <Card className="p-12 text-center text-muted-foreground">
            No raffle entries yet.
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 font-semibold">Name</th>
                    <th className="text-left px-4 py-3 font-semibold">Email</th>
                    <th className="text-left px-4 py-3 font-semibold">Tier</th>
                    <th className="text-left px-4 py-3 font-semibold">Entry Numbers</th>
                    <th className="text-left px-4 py-3 font-semibold">Date</th>
                    <th className="text-left px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="px-4 py-3">{entry.name ?? <span className="text-muted-foreground italic">—</span>}</td>
                      <td className="px-4 py-3">{entry.email}</td>
                      <td className="px-4 py-3">{TIER_LABELS[entry.ticketTierId] ?? entry.ticketTierId}</td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {entry.entryNumbers.length > 0
                          ? entry.entryNumbers.join(", ")
                          : <span className="text-muted-foreground italic">pending</span>
                        }
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Date(entry.purchasedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={
                            entry.paymentStatus === "paid"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : entry.paymentStatus === "failed"
                              ? "bg-red-100 text-red-800 hover:bg-red-100"
                              : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                          }
                        >
                          {entry.paymentStatus}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

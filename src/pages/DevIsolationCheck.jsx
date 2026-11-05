import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, RefreshCw, ShieldAlert, XCircle } from "lucide-react";
import { runIsolationChecks } from "../tenancy/isolationChecks.js";
import { isMockEnabled } from "../mocks/index.js";

function DevIsolationCheck() {
  const [result, setResult] = useState(() => runIsolationChecks());

  return (
    <main className="min-h-dvh bg-[#edf5ff] p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-4">
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 no-underline hover:text-slate-800"
            >
              <ArrowLeft className="w-3 h-3" />
              Back
            </Link>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
              Tenant isolation checks
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              The same matrix that runs in <code className="text-[11px]">npm run test:tenancy</code>.
              A failure here means a UI filter is leaking data.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setResult(runIsolationChecks())}
            className="inline-flex items-center gap-2 rounded-xl bg-[#053561] hover:bg-[#04294b] px-4 py-2.5 text-xs font-bold text-white cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Re-run
          </button>
        </header>

        {!isMockEnabled && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[11px] font-semibold text-amber-800">
            Mock mode is off, so these checks run against the seed module only. Enable
            <code className="mx-1">VITE_USE_MOCK_API=true</code> for the full prototype.
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl bg-white border border-slate-200 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Checks</p>
            <p className="text-2xl font-extrabold text-slate-900">{result.checks.length}</p>
          </div>
          <div className="rounded-2xl bg-white border border-emerald-200 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-500">Passed</p>
            <p className="text-2xl font-extrabold text-emerald-600">{result.passed}</p>
          </div>
          <div className="rounded-2xl bg-white border border-rose-200 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wide text-rose-500">Failed</p>
            <p className="text-2xl font-extrabold text-rose-600">{result.failed}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {result.checks.map((check) => (
              <li key={check.name} className="px-4 py-3 flex items-start gap-3">
                {check.pass ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800">{check.name}</p>
                  <p className={`text-[10px] ${check.pass ? "text-slate-500" : "text-rose-600"}`}>
                    {check.detail}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <ShieldAlert className="w-3 h-3" />
          Seed data contains deliberate cross-tenant traps. Passing checks prove they stay separated.
        </p>
      </div>
    </main>
  );
}

export default DevIsolationCheck;

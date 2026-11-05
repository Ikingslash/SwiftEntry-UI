import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  CalendarClock,
  ClipboardList,
  DoorOpen,
  Users,
  UserCog,
  UserPlus,
} from "lucide-react";
import AdminTopHeader from "./admin/include/AdminTopHeader";
import { useTenant } from "../context/TenantContext";
import api from "../context/api";
import { VISIT_STATUS_LABEL } from "../tenancy/constants";

function StatCard({ icon: Icon, label, value, tone = "blue" }) {
  const tones = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tones[tone]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">{value}</p>
      <p className="text-[11px] font-semibold text-slate-500">{label}</p>
    </div>
  );
}

function formatWhen(value) {
  if (!value) return "—";
  const date = new Date(value);
  return date.toLocaleString(undefined, {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TenantHome() {
  const { activeTenant, effectiveSetting } = useTenant();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get("/visits", { params: { per_page: 6 } })
      .then((response) => {
        if (!cancelled) {
          setVisits(response.data?.visits ?? response.data?.data ?? []);
        }
      })
      .catch(() => {
        if (!cancelled) setVisits([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const tenantName = activeTenant?.name ?? "Your tenant";

  return (
    <>
      <AdminTopHeader />

      <div className="max-w-[1140px] mx-auto px-4 pt-8 pb-16 space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
              <Building2 className="w-3 h-3" />
              Tenant workspace
            </span>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
              {tenantName}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {activeTenant?.floor ? `Floor ${activeTenant.floor}` : "Tenant dashboard"}
              {activeTenant?.suite ? ` · ${activeTenant.suite}` : ""} · visits are limited to your
              organisation.
            </p>
          </div>
          <Link
            to="/tenant-dashboard/new-guest"
            className="inline-flex items-center gap-2 rounded-xl bg-[#053561] hover:bg-[#04294b] px-4 py-2.5 text-xs font-bold text-white no-underline transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Register a guest
          </Link>
        </header>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            icon={CalendarClock}
            label="Visits today"
            value={activeTenant?.today_visits ?? 0}
            tone="blue"
          />
          <StatCard
            icon={DoorOpen}
            label="Currently checked in"
            value={activeTenant?.active_visits ?? 0}
            tone="emerald"
          />
          <StatCard
            icon={Users}
            label="Active users"
            value={activeTenant?.user_count ?? 0}
            tone="violet"
          />
          <StatCard
            icon={ClipboardList}
            label="Total visits"
            value={activeTenant?.visit_count ?? 0}
            tone="amber"
          />
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-slate-100">
            <h2 className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
              Recent visits
            </h2>
            <Link
              to="/tenant-dashboard/visitors"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0b63b6] no-underline hover:underline"
            >
              View all
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="px-5 py-8 text-center text-xs text-slate-400">Loading visits…</div>
          ) : visits.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-xs font-semibold text-slate-600">No visits yet.</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Register your first guest and the host will be notified automatically.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {visits.map((visit) => (
                <li key={visit.id} className="px-4 sm:px-5 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {visit.visitor?.name ?? visit.host_name ?? "Visitor"}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {visit.purpose} · host {visit.host?.name ?? visit.host_name ?? "—"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] font-semibold text-slate-600">
                      {formatWhen(visit.visit_time)}
                    </p>
                    <span className="inline-block mt-0.5 rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600">
                      {VISIT_STATUS_LABEL[visit.visit_status] ?? visit.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              to: "/tenant-dashboard/new-guest",
              icon: UserPlus,
              title: "Register a guest",
              body: "Pre-register an individual or a group. The host is notified straight away.",
            },
            {
              to: "/tenant-dashboard/visitors",
              icon: Users,
              title: "Visitor history",
              body: "Search and filter only the visitors that belong to your organisation.",
            },
            {
              to: "/tenant-dashboard/staffs",
              icon: UserCog,
              title: "Your team",
              body: "Manage the staff and tenant front-desk accounts inside your tenant.",
            },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group bg-white rounded-2xl border border-slate-200 p-4 no-underline hover:border-blue-200 hover:shadow-sm transition-all"
            >
              <span className="w-9 h-9 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <item.icon className="w-4 h-4" />
              </span>
              <p className="mt-3 text-xs font-bold text-slate-900">{item.title}</p>
              <p className="mt-1 text-[10px] leading-relaxed text-slate-500">{item.body}</p>
            </Link>
          ))}
        </section>

        <p className="text-[10px] text-slate-400">
          Tenant notification copy: {effectiveSetting("visitor_email_copy")?.subject ?? "Building default"}
        </p>
      </div>
    </>
  );
}

export default TenantHome;

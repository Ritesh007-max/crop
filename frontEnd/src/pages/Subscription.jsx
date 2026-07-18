import { useMemo, useState } from "react";
import {
  Menu,
  X,
  LogOut,
  BadgeIndianRupee,
  CheckCircle2,
  QrCode,
  Crown,
} from "lucide-react";
import PhaseNavigation from "../components/PhaseNavigation";
import SidebarFooter from "../components/SidebarFooter";

const PAYMENT_UPI_ID = "seed2success@upi";

const SUBSCRIPTION_PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 199,
    period: "month",
    badge: "Basic Access",
    description: "Essential farm planning and crop support for individual farmers.",
    features: ["Crop recommendations", "Health analysis access", "Basic harvest guidance"],
  },
  {
    id: "growth",
    name: "Growth",
    price: 499,
    period: "month",
    badge: "Most Popular",
    description: "Balanced plan for active growers who need regular AI guidance.",
    features: ["Everything in Starter", "Priority crop health scans", "Selling insights support"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 999,
    period: "month",
    badge: "Advanced",
    description: "Full workflow support for power users, agri-entrepreneurs, and teams.",
    features: ["Everything in Growth", "Advanced advisory workflow", "Premium support experience"],
  },
];

function buildQrUrl(plan) {
  const upiPayload = `upi://pay?pa=${PAYMENT_UPI_ID}&pn=Seed2Success&am=${plan.price}&cu=INR&tn=${encodeURIComponent(`${plan.name} Plan`)}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(upiPayload)}`;
}

function SubscriptionInterface({
  
  sidebarOpen,
  onToggleSidebar,
  user,
  onLogout,
  onEditProfile,
}) {
  const [selectedPlanId, setSelectedPlanId] = useState(SUBSCRIPTION_PLANS[1].id);

  const selectedPlan = useMemo(
    () => SUBSCRIPTION_PLANS.find((plan) => plan.id === selectedPlanId) || SUBSCRIPTION_PLANS[0],
    [selectedPlanId]
  );

  const qrCodeUrl = useMemo(() => buildQrUrl(selectedPlan), [selectedPlan]);

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.05),_transparent_40%),linear-gradient(180deg,#ffffff_0%,#fafafa_100%)]">
      {sidebarOpen ? <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onToggleSidebar} /> : null}

      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen w-[300px]
          bg-brand-950 text-white flex flex-col
          border-r border-brand-900/50
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          sidebar-scroll overflow-y-auto
        `}
      >
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/25">
                <Crown size={20} />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg leading-tight">Subscriptions</h1>
                <p className="text-[11px] text-brand-300/70 tracking-wide uppercase">Plans & Payments</p>
              </div>
            </div>
            <button type="button" onClick={onToggleSidebar} className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-brand-300">
              <X size={18} />
            </button>
          </div>

          <PhaseNavigation   className="mb-5" />

          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-400">Why Upgrade</p>
            <div className="space-y-2 text-[13px] text-brand-200">
              <p>Unlock guided support across planning, crop health, harvesting, and selling.</p>
              <p>Choose a plan and pay by scanning the QR code from any UPI app.</p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 pb-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-400 mb-3">Selected Plan</p>
            <div className="rounded-2xl bg-white/[0.06] p-4">
              <p className="text-lg font-display font-bold text-white">{selectedPlan.name}</p>
              <p className="text-brand-300 text-sm mt-1">{selectedPlan.badge}</p>
              <div className="mt-4 flex items-end gap-1 text-white">
                <span className="text-3xl font-bold">Rs. {selectedPlan.price}</span>
                <span className="text-brand-400 text-sm mb-1">/{selectedPlan.period}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <SidebarFooter user={user} onLogout={onLogout} onEditProfile={onEditProfile} />
      </aside>

      <main className="flex-1 min-w-0">
        <div className="w-full sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-gray-200/60 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button type="button" onClick={onToggleSidebar} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
                <Menu size={20} />
              </button>
              <div>
                <h2 className="text-[15px] sm:text-lg font-display font-bold text-gray-900">Choose Your Seed2Success Plan</h2>
                <p className="text-[12px] text-gray-500">Select a subscription and complete payment with QR scan.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
          <section className="space-y-5">
            <div className="grid gap-4 md:grid-cols-3">
              {SUBSCRIPTION_PLANS.map((plan) => {
                const active = selectedPlan.id === plan.id;

                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`text-left rounded-3xl border p-5 transition-all duration-200 shadow-sm ${
                      active
                        ? "border-brand-500 bg-gradient-to-br from-brand-50 to-white shadow-brand-200/60 shadow-lg"
                        : "border-brand-100 bg-white hover:border-brand-300 hover:-translate-y-0.5"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-brand-700">{plan.badge}</p>
                        <h3 className="mt-2 text-2xl font-display font-bold text-gray-900">{plan.name}</h3>
                      </div>
                      <div className={`rounded-full px-3 py-1 text-[11px] font-semibold ${active ? "bg-brand-600 text-white" : "bg-brand-100 text-brand-700"}`}>
                        {active ? "Selected" : "Select"}
                      </div>
                    </div>

                    <div className="mt-5 flex items-end gap-1">
                      <span className="text-3xl font-bold text-gray-900">Rs. {plan.price}</span>
                      <span className="text-sm text-gray-500 mb-1">/{plan.period}</span>
                    </div>

                    <p className="mt-4 text-sm text-gray-600 leading-6">{plan.description}</p>

                    <div className="mt-5 space-y-2">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                          <CheckCircle2 size={16} className="text-brand-600 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm h-fit xl:sticky xl:top-24">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center">
                <QrCode size={22} />
              </div>
              <div>
                <p className="text-sm font-semibold text-brand-700">Scan To Pay</p>
                <h3 className="text-xl font-display font-bold text-gray-900">{selectedPlan.name} Plan</h3>
              </div>
            </div>

            <div className="mt-6 rounded-[2rem] border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-5">
              <div className="rounded-[1.5rem] bg-white p-4 shadow-inner border border-brand-100">
                <img
                  src={qrCodeUrl}
                  alt={`${selectedPlan.name} subscription QR code`}
                  className="w-full rounded-2xl"
                />
              </div>

              <div className="mt-5 space-y-2 text-sm text-gray-700">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-semibold text-gray-900 inline-flex items-center gap-1">
                    <BadgeIndianRupee size={15} />
                    {selectedPlan.price}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-500">Billing</span>
                  <span className="font-semibold text-gray-900">Per {selectedPlan.period}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-500">UPI ID</span>
                  <span className="font-semibold text-gray-900">{PAYMENT_UPI_ID}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-800">
              Open any UPI app, scan the QR code, and complete the payment for the selected plan.
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default SubscriptionInterface;

import {
  BadgeIndianRupee,
  Boxes,
  ChartColumn,
  CircleDollarSign,
  Clock3,
  MapPinned,
  PackageCheck,
  Store,
  Truck,
} from "lucide-react";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function CardShell({ icon, title, subtitle, className = "", children }) {
  return (
    <div className={`rounded-3xl p-6 border shadow-sm relative overflow-hidden ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center shadow-sm border border-white/80">
          {icon}
        </div>
        <div>
          <h4 className="font-display font-bold leading-tight text-gray-900">{title}</h4>
          {subtitle ? <p className="text-[12px] text-black/55 mt-0.5">{subtitle}</p> : null}
        </div>
      </div>
      {children}
    </div>
  );
}

function SellingCards({ result }) {
  if (!result || !result.cards) return null;

  const {
    saleReadiness,
    qualitySnapshot,
    estimatedPriceRange,
    historicalPriceContext,
    costAndMarginView,
    sellNowVsStore,
    storagePartnerOptions,
    transportOptions,
    buyerVisibility,
  } = result.cards;

  return (
    <div className="mt-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-6 px-2">
        <h3 className="font-display font-bold text-xl text-brand-900">Selling Strategy</h3>
        <div className="h-px flex-1 bg-brand-200"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <CardShell icon={<PackageCheck size={20} className="text-brand-700" />} title="Sale Readiness" subtitle="Basic lot readiness check" className="bg-gradient-to-br from-brand-50 to-white border-brand-200/70">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-gray-900 mb-4">
            {saleReadiness?.rating}
            <span className="text-xs text-gray-500">{saleReadiness?.score}/100</span>
          </div>
          <p className="text-[13px] text-brand-950">{saleReadiness?.note}</p>
        </CardShell>

        <CardShell icon={<Boxes size={20} className="text-brand-700" />} title="Quality Snapshot" subtitle={qualitySnapshot?.rating} className="bg-gradient-to-br from-brand-50 to-white border-brand-200/70">
          <div className="space-y-3">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wide text-brand-700 mb-2">Strengths</p>
              <div className="space-y-2">
                {(qualitySnapshot?.strengths || []).map((item) => (
                  <div key={item} className="bg-white/70 rounded-xl p-3 border border-brand-100 text-[13px] text-brand-950">{item}</div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wide text-brand-700 mb-2">Watch-outs</p>
              <div className="space-y-2">
                {(qualitySnapshot?.defects || ["No major issues flagged"]).map((item) => (
                  <div key={item} className="bg-white/70 rounded-xl p-3 border border-brand-100 text-[13px] text-brand-950">{item}</div>
                ))}
              </div>
            </div>
          </div>
        </CardShell>

        <CardShell icon={<BadgeIndianRupee size={20} className="text-brand-700" />} title="Estimated Price Range" subtitle={estimatedPriceRange?.unit} className="bg-gradient-to-br from-brand-50 to-white border-brand-200/70">
          <p className="text-2xl font-display font-bold text-brand-950 mb-2">
            {formatCurrency(estimatedPriceRange?.low)} - {formatCurrency(estimatedPriceRange?.high)}
          </p>
          <p className="text-[13px] text-brand-900">Expected revenue around {formatCurrency(estimatedPriceRange?.expectedRevenue)}</p>
        </CardShell>

        <CardShell icon={<ChartColumn size={20} className="text-brand-700" />} title="Historical Price Context" subtitle={historicalPriceContext?.trend} className="bg-gradient-to-br from-brand-50 to-white border-brand-200/70">
          <p className="text-[13px] text-brand-950">{historicalPriceContext?.note}</p>
        </CardShell>

        <CardShell icon={<CircleDollarSign size={20} className="text-brand-700" />} title="Cost and Margin View" subtitle="Selling scenario view" className="bg-gradient-to-br from-brand-50 to-white border-brand-200/70">
          <div className="space-y-2">
            <div className="bg-white/70 rounded-xl p-3 border border-brand-100 text-[13px] text-brand-950">Best case margin: {formatCurrency(costAndMarginView?.bestCaseMargin)}</div>
            <div className="bg-white/70 rounded-xl p-3 border border-brand-100 text-[13px] text-brand-950">Average case margin: {formatCurrency(costAndMarginView?.averageCaseMargin)}</div>
            <div className="bg-white/70 rounded-xl p-3 border border-brand-100 text-[13px] text-brand-950">Cautious case margin: {formatCurrency(costAndMarginView?.cautiousCaseMargin)}</div>
            <div className="bg-white/70 rounded-xl p-3 border border-brand-100 text-[13px] font-semibold text-brand-950">Estimated selling cost: {formatCurrency(costAndMarginView?.totalSellingCost)}</div>
          </div>
        </CardShell>

        <CardShell icon={<Clock3 size={20} className="text-brand-700" />} title="Sell Now vs Store" subtitle="Action recommendation" className="bg-gradient-to-br from-brand-50 to-white border-brand-200/70">
          <div className="inline-flex items-center rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-brand-950 mb-4">
            {sellNowVsStore?.recommendation}
          </div>
          <p className="text-[13px] text-brand-900">{sellNowVsStore?.rationale}</p>
        </CardShell>

        <CardShell icon={<Store size={20} className="text-brand-700" />} title="Storage Partner Options" subtitle="Platform utility panel" className="bg-gradient-to-br from-brand-50 to-white border-brand-200/70">
          <div className="space-y-3">
            {(storagePartnerOptions?.options || []).map((option) => (
              <div key={option.name} className="bg-white/70 rounded-xl p-3 border border-brand-100">
                <p className="text-[13px] font-bold text-brand-950">{option.name}</p>
                <p className="text-[12px] text-brand-900 mt-1">Capacity: {option.capacity}</p>
                <p className="text-[12px] text-brand-900">Cost: {option.cost}</p>
                <p className="text-[12px] text-brand-900">Distance: {option.distance}</p>
              </div>
            ))}
          </div>
        </CardShell>

        <CardShell icon={<Truck size={20} className="text-brand-700" />} title="Transport Options" subtitle="Platform utility panel" className="bg-gradient-to-br from-brand-50 to-white border-brand-200/70">
          <div className="space-y-3">
            {(transportOptions?.options || []).map((option) => (
              <div key={option.route} className="bg-white/70 rounded-xl p-3 border border-brand-100">
                <p className="text-[13px] font-bold text-brand-950">{option.route}</p>
                <p className="text-[12px] text-brand-900 mt-1">{option.vehicle} • {option.eta}</p>
                <p className="text-[12px] text-brand-900">Estimated cost: {option.cost}</p>
                <p className="text-[12px] text-brand-900">{option.note}</p>
              </div>
            ))}
          </div>
        </CardShell>

        <CardShell icon={<MapPinned size={20} className="text-brand-700" />} title="Buyer and Contractor Visibility" subtitle={buyerVisibility?.preferredChannel} className="bg-gradient-to-br from-brand-50 to-white border-brand-200/70">
          <div className="space-y-3">
            {(buyerVisibility?.buyers || []).map((buyer) => (
              <div key={buyer.name} className="bg-white/70 rounded-xl p-3 border border-brand-100">
                <p className="text-[13px] font-bold text-brand-950">{buyer.name}</p>
                <p className="text-[12px] text-brand-900 mt-1">{buyer.channel} • {buyer.priceRange}</p>
                <p className="text-[12px] text-brand-900">{buyer.note}</p>
              </div>
            ))}
          </div>
        </CardShell>
      </div>
    </div>
  );
}

export default SellingCards;

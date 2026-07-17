import {
  AlertTriangle,
  BadgeCheck,
  CalendarRange,
  CloudSunRain,
  IndianRupee,
  PackageCheck,
  Pickaxe,
  Route,
} from "lucide-react";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function InfoRow({ label, value, valueClassName = "" }) {
  if (value === undefined || value === null || value === "") return null;

  return (
    <div className="flex items-start gap-2 mb-2 pb-2 border-b border-black/5 last:border-0 last:mb-0 last:pb-0">
      <span className="text-[12px] font-bold text-black/60 w-28 flex-shrink-0">{label}</span>
      <span className={`text-[13px] font-medium text-black/80 ${valueClassName}`}>
        {Array.isArray(value) ? value.join(", ") : value}
      </span>
    </div>
  );
}

function CardShell({ icon, title, subtitle, className = "", children }) {
  return (
    <div className={`rounded-3xl p-6 border shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-center gap-3 mb-4 relative">
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

function HarvestActionCards({ result }) {
  if (!result || !result.cards) return null;

  const {
    harvestReadiness,
    bestHarvestWindow,
    weatherRiskOutlook,
    labourAndTimeEstimate,
    harvestCostEstimate,
    postHarvestCare,
    harvestActionPlan,
  } = result.cards;

  return (
    <div className="mt-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-6 px-2">
        <h3 className="font-display font-bold text-xl text-brand-900">Harvest Intelligence</h3>
        <div className="h-px flex-1 bg-brand-200"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <CardShell icon={<BadgeCheck size={20} className="text-brand-700" />} title="Harvest Readiness" subtitle={`Confidence: ${harvestReadiness?.confidence || "Low"}`} className="bg-gradient-to-br from-brand-50 to-white border-brand-200/70">
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-gray-900">
              {harvestReadiness?.verdict}
              <span className="text-xs text-gray-500">{harvestReadiness?.score}/100</span>
            </div>
          </div>
          <div className="bg-white/65 rounded-xl p-3 border border-white/80 space-y-2">
            {(harvestReadiness?.reasons || []).map((reason) => (
              <p key={reason} className="text-[13px] text-gray-800">{reason}</p>
            ))}
          </div>
        </CardShell>

        <CardShell icon={<CalendarRange size={20} className="text-brand-700" />} title="Best Harvest Window" subtitle={bestHarvestWindow?.urgency} className="bg-gradient-to-br from-brand-50 to-white border-brand-200/70">
          <p className="text-[15px] font-semibold text-brand-950 mb-4">{bestHarvestWindow?.recommendation}</p>
          <div className="bg-white/70 rounded-xl p-3 border border-brand-100">
            <InfoRow label="Ideal timing" value={bestHarvestWindow?.idealTimeOfDay} />
            <InfoRow label="Priority" value={bestHarvestWindow?.urgency} />
          </div>
        </CardShell>

        <CardShell icon={<CloudSunRain size={20} className="text-brand-700" />} title="Weather Risk Outlook" subtitle={`Overall risk: ${weatherRiskOutlook?.overallRisk || "Low"}`} className="bg-gradient-to-br from-brand-50 to-white border-brand-200/70">
          <div className="space-y-3">
            {(weatherRiskOutlook?.risks || []).map((risk) => (
              <div key={risk.concern} className="bg-white/75 rounded-xl p-3 border border-brand-100">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[13px] font-bold text-brand-950">{risk.concern}</span>
                  <span className="text-[11px] font-semibold text-brand-700 bg-brand-100 px-2 py-0.5 rounded-full">{risk.severity}</span>
                </div>
                <p className="text-[13px] text-brand-900/80">{risk.note}</p>
              </div>
            ))}
          </div>
          <p className="text-[13px] text-brand-900 mt-4">{weatherRiskOutlook?.advisory}</p>
        </CardShell>

        <CardShell icon={<Pickaxe size={20} className="text-brand-700" />} title="Labour and Time Estimate" subtitle={`${labourAndTimeEstimate?.labourDaysNeeded || 0} labour-days needed`} className="bg-gradient-to-br from-brand-50 to-white border-brand-200/70">
          <div className="bg-white/70 rounded-xl p-3 border border-brand-100">
            <InfoRow label="Land size" value={labourAndTimeEstimate?.landSize} />
            <InfoRow label="Crop type" value={labourAndTimeEstimate?.cropType} />
            <InfoRow label="Workers" value={labourAndTimeEstimate?.workersAvailable} />
            <InfoRow label="Harvest time" value={`${labourAndTimeEstimate?.estimatedHarvestDays || 0} days`} />
            <InfoRow label="Bottleneck" value={labourAndTimeEstimate?.bottleneck} valueClassName="capitalize" />
          </div>
        </CardShell>

        <CardShell icon={<IndianRupee size={20} className="text-brand-700" />} title="Harvest Cost Estimate" subtitle="Expected harvesting spend" className="bg-gradient-to-br from-brand-50 to-white border-brand-200/70">
          <div className="bg-white/70 rounded-xl p-3 border border-brand-100">
            <InfoRow label="Labour" value={formatCurrency(harvestCostEstimate?.labourCost)} />
            <InfoRow label="Operations" value={formatCurrency(harvestCostEstimate?.operationsCost)} />
            <InfoRow label="Transport" value={formatCurrency(harvestCostEstimate?.transportCost)} />
            <InfoRow label="Storage prep" value={formatCurrency(harvestCostEstimate?.storagePreparationCost)} />
            <InfoRow label="Total" value={formatCurrency(harvestCostEstimate?.totalCost)} valueClassName="font-bold text-brand-900" />
          </div>
          <p className="text-[13px] text-brand-900 mt-4">{harvestCostEstimate?.note}</p>
        </CardShell>

        <CardShell icon={<PackageCheck size={20} className="text-brand-700" />} title="Post-Harvest Care" subtitle="Loss prevention after cutting" className="bg-gradient-to-br from-brand-50 to-white border-brand-200/70">
          <div className="space-y-2">
            {(postHarvestCare?.recommendations || []).map((item) => (
              <div key={item} className="bg-white/70 rounded-xl p-3 border border-brand-100 text-[13px] text-brand-950">{item}</div>
            ))}
          </div>
        </CardShell>

        <div className="md:col-span-2 xl:col-span-3">
          <CardShell icon={<Route size={20} className="text-brand-700" />} title="Harvest Action Plan" subtitle="Step-by-step priorities for the next few days" className="bg-gradient-to-br from-brand-50 to-white border-brand-200/70">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
              {(harvestActionPlan?.steps || []).map((step) => (
                <div key={`${step.day}-${step.title}`} className="bg-white/75 rounded-2xl p-4 border border-brand-100">
                  <div className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-700 bg-brand-100 px-2 py-1 rounded-full mb-3">
                    <AlertTriangle size={11} />
                    {step.day}
                  </div>
                  <h5 className="font-display font-bold text-brand-950 mb-2">{step.title}</h5>
                  <p className="text-[13px] text-brand-900/85">{step.task}</p>
                </div>
              ))}
            </div>
          </CardShell>
        </div>
      </div>
    </div>
  );
}

export default HarvestActionCards;

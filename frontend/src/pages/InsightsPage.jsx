import React from 'react';
import {
  AlertTriangle,
  BarChart3,
  Building2,
  CalendarDays,
  IndianRupee,
  Layers3,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';

import { Navbar } from '../components/Navbar.jsx';
import { insightsService } from '../services/insightsService.js';
import { formatINR } from '../utils/priceFormatter.js';

function MetricCard({
  label,
  value,
  description,
  icon: Icon,
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-emerald-200 hover:shadow-sm transition">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="text-2xl font-bold tracking-tight text-slate-900 mt-2">
            {value}
          </p>

          {description && (
            <p className="text-xs text-slate-500 mt-1">
              {description}
            </p>
          )}
        </div>

        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

export function InsightsPage() {
  const insights =
    insightsService.getInsights();

  const discrepancies =
    insightsService.getRetrievalDiscrepancies();

  const totalMonthlyRent =
    insights.rentals.totalMonthlyRentAnnaNagar;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">

        {/* Header */}
        <div className="mb-7">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
            Chennai · Data insights
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mt-1">
            Market insights
          </h1>

          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Analytics derived from the complete datasets retrieved
            from the Ivy Homes API and the API audit performed for
            this assignment.
          </p>
        </div>

        {/* Core metrics */}
        <section>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

            <MetricCard
              label="Listing records"
              value={insights.listings.retrieved.toLocaleString(
                'en-IN'
              )}
              description="Retrievable listing records"
              icon={Building2}
            />

            <MetricCard
              label="Live listings"
              value={insights.listings.live.toLocaleString(
                'en-IN'
              )}
              description={`${insights.listings.inactive.toLocaleString(
                'en-IN'
              )} inactive records`}
              icon={TrendingUp}
            />

            <MetricCard
              label="Rental records"
              value={insights.rentals.retrieved.toLocaleString(
                'en-IN'
              )}
              description="Retrievable rental records"
              icon={Layers3}
            />

            <MetricCard
              label="Projects"
              value={insights.projects.retrieved.toLocaleString(
                'en-IN'
              )}
              description="Retrievable project records"
              icon={Building2}
            />

          </div>
        </section>

        {/* Anna Nagar rent summary */}
        <section className="mt-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">

              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <IndianRupee className="w-5 h-5" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                  Anna Nagar rental market
                </p>

                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                  {formatINR(totalMonthlyRent)}
                  <span className="text-sm font-medium text-slate-500 ml-2">
                    total monthly rent
                  </span>
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Calculated across 150 retrievable rental
                  records in Anna Nagar.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Derived metrics */}
        <section className="mt-6">
          <h2 className="text-lg font-bold text-slate-900 mb-3">
            Derived market metrics
          </h2>

          <div className="grid md:grid-cols-3 gap-4">

            <MetricCard
              label="2 BHK average"
              value={`₹${insights.derived.avgPricePerSqft2Bhk.toLocaleString(
                'en-IN',
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}`}
              description="Average price per sq.ft. for eligible live 2 BHK listings"
              icon={BarChart3}
            />

            <MetricCard
              label="Listings in last 7 days"
              value={insights.dataQuality.listingsLast7Days.toLocaleString(
                'en-IN'
              )}
              description="Before the 10 Sep 2026 reference timestamp"
              icon={CalendarDays}
            />

            <MetricCard
              label="Estimated properties"
              value={insights.dataQuality.estimatedUniqueProperties.toLocaleString(
                'en-IN'
              )}
              description="Estimated after duplicate-cluster analysis"
              icon={Building2}
            />

          </div>
        </section>

        {/* Costliest project */}
        <section className="mt-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6">

            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
              Highest observed project price
            </p>

            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mt-2">

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {insights.derived.costliestProject.displayName}
                </h2>

                <p className="text-xs font-mono text-slate-400 mt-1">
                  {insights.derived.costliestProject.projectId}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-2xl font-bold text-slate-900">
                  {formatINR(
                    insights.derived.costliestProject.priceMaxInr
                  )}
                </p>

                <p className="text-xs text-slate-500">
                  observed normalized maximum price
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* API reality check */}
        <section className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />

            <h2 className="text-lg font-bold text-slate-900">
              API reality check
            </h2>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

            <div className="p-5 border-b border-slate-100">
              <p className="text-sm text-slate-600">
                The API's reported totals did not match the
                number of records retrievable through complete
                pagination.
              </p>
            </div>

            <div className="divide-y divide-slate-100">

              {discrepancies.map((item) => (
                <div
                  key={item.name}
                  className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {item.name}
                    </p>

                    <p className="text-xs text-slate-500 mt-0.5">
                      API reported{' '}
                      {item.reported.toLocaleString(
                        'en-IN'
                      )}{' '}
                      records
                    </p>
                  </div>

                  <div className="text-sm font-semibold text-emerald-700">
                    {item.retrieved.toLocaleString(
                      'en-IN'
                    )}{' '}
                    retrieved
                    <span className="text-xs font-normal text-slate-400 ml-2">
                      (+{item.difference})
                    </span>
                  </div>
                </div>
              ))}

            </div>
          </div>
        </section>

        {/* Data quality */}
        <section className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="w-5 h-5 text-rose-600" />

            <h2 className="text-lg font-bold text-slate-900">
              Data quality discoveries
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">

            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>

                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {insights.dataQuality.corruptListings}
                  </p>

                  <p className="text-sm font-semibold text-slate-700">
                    Impossible price records
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-500 mt-3">
                Listings with negative prices identified
                during dataset validation.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>

                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {insights.dataQuality.suspiciousFakeListings}
                  </p>

                  <p className="text-sm font-semibold text-slate-700">
                    Suspicious low-price listings
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-500 mt-3">
                Extremely low positive-price records
                identified as likely fake/enquiry-generation
                listings.
              </p>
            </div>

          </div>
        </section>

        {/* Methodology note */}
        <section className="mt-6 mb-4">
          <div className="rounded-xl bg-slate-100 border border-slate-200 px-5 py-4">
            <p className="text-xs text-slate-500 leading-relaxed">
              <strong className="text-slate-700">
                Methodology:
              </strong>{' '}
              Metrics shown here were derived from the complete
              datasets retrieved during the API investigation.
              The estimated property count is based on duplicate
              clustering and should be treated as an estimate,
              not an API-provided field.
            </p>
          </div>
        </section>

      </main>
    </div>
  );
}
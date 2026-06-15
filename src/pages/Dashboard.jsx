import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { slackMarkdownToHtml } from '../lib/markdown.js'
import TrendChart from '../components/TrendChart.jsx'
import PostTable from '../components/PostTable.jsx'
import PlatformBreakdown from '../components/PlatformBreakdown.jsx'

const METRICS = [
  { key: 'views', label: 'Views' },
  { key: 'reach', label: 'Reach' },
  { key: 'reactions', label: 'Reactions' },
  { key: 'comments', label: 'Comments' },
]

function formatRange(start, end) {
  const s = new Date(start)
  const e = new Date(end)
  const month = s.toLocaleDateString('en-US', { month: 'long' })
  return `${month} ${s.getDate()} — ${e.getDate()}, ${s.getFullYear()}`
}

export default function Dashboard() {
  const [reports, setReports] = useState([])
  const [selectedWeekId, setSelectedWeekId] = useState(null)
  const [posts, setPosts] = useState([])
  const [trendMetric, setTrendMetric] = useState('views')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadReports()
  }, [])

  async function loadReports() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('weekly_reports')
        .select('*')
        .order('week_start', { ascending: false })
        .limit(12)
      if (error) throw error
      setReports(data || [])
      if (data && data.length > 0) {
        setSelectedWeekId(data[0].id)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!selectedWeekId) return
    supabase
      .from('weekly_posts')
      .select('*')
      .eq('report_id', selectedWeekId)
      .order('views', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setPosts(data || [])
      })
  }, [selectedWeekId])

  const selectedReport = useMemo(
    () => reports.find(r => r.id === selectedWeekId),
    [reports, selectedWeekId]
  )

  async function signOut() {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink">
        <p className="eyebrow">Loading the week</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink">
      {/* Masthead */}
      <header className="border-b border-paper/10 px-6 lg:px-12 py-5">
        <div className="flex items-baseline justify-between gap-8 flex-wrap">
          <div>
            <p className="eyebrow">We Are Black America</p>
            <h1 className="font-display text-2xl font-light text-paper">
              Performance Signal
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <p className="hidden sm:block font-mono text-[0.7rem] text-ash tracking-widest uppercase">
              {reports.length > 0 ? `${reports.length} ${reports.length === 1 ? 'week' : 'weeks'} on file` : 'No data yet'}
            </p>
            <button
              onClick={signOut}
              className="eyebrow hover:text-paper transition-colors"
            >
              Sign out →
            </button>
          </div>
        </div>
      </header>

      {/* Empty state */}
      {reports.length === 0 && (
        <div className="max-w-2xl mx-auto px-6 py-24 text-center">
          <p className="eyebrow mb-3">No reports yet</p>
          <h2 className="font-display text-3xl font-light text-paper mb-4">
            Waiting on the first signal.
          </h2>
          <p className="font-display text-lg font-light text-bone/70 leading-relaxed">
            The weekly analytics workflow hasn't run yet, or hasn't written here. Once it does — Monday mornings — this view fills with last week's account of what worked.
          </p>
        </div>
      )}

      {error && (
        <div className="max-w-2xl mx-auto px-6 py-6">
          <p className="font-mono text-sm text-ember">{error}</p>
        </div>
      )}

      {reports.length > 0 && selectedReport && (
        <div className="px-6 lg:px-12 py-8 lg:py-12 space-y-16">
          {/* Week selector */}
          <section>
            <p className="eyebrow mb-3">Viewing</p>
            <div className="flex gap-1 flex-wrap">
              {reports.map(r => (
                <button
                  key={r.id}
                  onClick={() => setSelectedWeekId(r.id)}
                  className={`font-mono text-xs px-3 py-2 tracking-wider transition-colors ${
                    r.id === selectedWeekId
                      ? 'bg-paper text-ink'
                      : 'bg-stone text-ash hover:text-paper'
                  }`}
                >
                  {formatRange(r.week_start, r.week_end)}
                </button>
              ))}
            </div>
          </section>

          {/* Report */}
          <section>
            <div className="flex items-baseline justify-between mb-6 flex-wrap gap-4">
              <div>
                <p className="eyebrow">01 — The Read</p>
                <h2 className="font-display text-4xl lg:text-5xl font-light text-paper mt-1">
                  {formatRange(selectedReport.week_start, selectedReport.week_end)}
                </h2>
              </div>
              <p className="font-mono text-[0.7rem] text-ash tracking-widest uppercase">
                {selectedReport.total_posts} posts
              </p>
            </div>
            <div className="grid lg:grid-cols-[1fr_2fr] gap-8 lg:gap-12">
              <div>
                <p className="eyebrow mb-4">Across all platforms</p>
                <div className="space-y-4">
                  {METRICS.map(m => {
                    const total = Object.values(selectedReport.totals_by_platform || {})
                      .reduce((sum, p) => sum + (p[m.key] || 0), 0)
                    return (
                      <div key={m.key} className="flex items-baseline justify-between hairline pt-3">
                        <p className="eyebrow">{m.label}</p>
                        <p className="font-display text-2xl font-light text-paper">
                          {total.toLocaleString()}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div>
                <div
                  className="report-prose max-w-2xl"
                  dangerouslySetInnerHTML={{
                    __html: slackMarkdownToHtml(selectedReport.ai_report) || '<p class="text-ash italic">No written report for this week.</p>'
                  }}
                />
              </div>
            </div>
          </section>

          {/* Platform breakdown */}
          <section>
            <p className="eyebrow mb-4">02 — Per Channel</p>
            <PlatformBreakdown totals={selectedReport.totals_by_platform} />
          </section>

          {/* Trend */}
          {reports.length > 1 && (
            <section>
              <div className="flex items-baseline justify-between mb-4 flex-wrap gap-3">
                <p className="eyebrow">03 — Trend (last {reports.length} weeks)</p>
                <div className="flex gap-1">
                  {METRICS.map(m => (
                    <button
                      key={m.key}
                      onClick={() => setTrendMetric(m.key)}
                      className={`font-mono text-[0.65rem] tracking-widest uppercase px-2.5 py-1.5 transition-colors ${
                        trendMetric === m.key
                          ? 'bg-paper text-ink'
                          : 'bg-stone text-ash hover:text-paper'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
              <TrendChart reports={reports} metric={trendMetric} />
            </section>
          )}

          {/* Posts table */}
          <section className="pb-16">
            <p className="eyebrow mb-4">04 — Every Post</p>
            <PostTable posts={posts} />
          </section>
        </div>
      )}
    </div>
  )
}

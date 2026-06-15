const PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'Facebook']

const PLATFORM_ACCENT = {
  Instagram: 'text-ember',
  TikTok: 'text-gold',
  YouTube: 'text-mint',
  Facebook: 'text-bone',
}

function formatNumber(n) {
  if (n == null) return '—'
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return Number(n).toLocaleString()
}

export default function PlatformBreakdown({ totals }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-paper/5">
      {PLATFORMS.map(platform => {
        const t = totals?.[platform] || {}
        const primaryMetric = platform === 'Facebook' ? 'impressions' : 'views'
        const primaryLabel = primaryMetric === 'views' ? 'Views' : 'Impressions'
        return (
          <div key={platform} className="bg-ink p-6">
            <div className="flex items-baseline justify-between mb-4">
              <p className={`font-mono text-xs tracking-widest uppercase ${PLATFORM_ACCENT[platform]}`}>
                {platform}
              </p>
              <p className="font-mono text-[0.65rem] text-ash">{t.postCount || 0} posts</p>
            </div>
            <p className="font-display text-4xl font-light text-paper leading-none">
              {formatNumber(t[primaryMetric])}
            </p>
            <p className="eyebrow mt-1">{primaryLabel}</p>
            <div className="hairline mt-4 pt-4 grid grid-cols-3 gap-2 font-mono text-[0.7rem]">
              <div>
                <p className="text-ash uppercase tracking-wider mb-0.5">React.</p>
                <p className="text-paper">{formatNumber(t.reactions)}</p>
              </div>
              <div>
                <p className="text-ash uppercase tracking-wider mb-0.5">Comm.</p>
                <p className="text-paper">{formatNumber(t.comments)}</p>
              </div>
              <div>
                <p className="text-ash uppercase tracking-wider mb-0.5">Shares</p>
                <p className="text-paper">{formatNumber(t.shares)}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

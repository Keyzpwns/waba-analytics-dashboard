import { useMemo, useState } from 'react'

const COLUMNS = [
  { key: 'sent_at', label: 'Date', type: 'date', width: 'w-28' },
  { key: 'platform', label: 'Platform', type: 'string', width: 'w-28' },
  { key: 'text_preview', label: 'Post', type: 'string', width: 'flex-1' },
  { key: 'views', label: 'Views', type: 'number', width: 'w-20 text-right' },
  { key: 'reach', label: 'Reach', type: 'number', width: 'w-20 text-right' },
  { key: 'impressions', label: 'Imp.', type: 'number', width: 'w-20 text-right' },
  { key: 'reactions', label: 'React.', type: 'number', width: 'w-20 text-right' },
  { key: 'comments', label: 'Comm.', type: 'number', width: 'w-16 text-right' },
  { key: 'shares', label: 'Shares', type: 'number', width: 'w-16 text-right' },
  { key: 'engagement_rate', label: 'Eng. %', type: 'number', width: 'w-20 text-right' },
]

// Sort options offered on mobile (where column headers aren't tappable)
const MOBILE_SORTS = [
  { key: 'views', label: 'Views' },
  { key: 'reach', label: 'Reach' },
  { key: 'reactions', label: 'React.' },
  { key: 'sent_at', label: 'Date' },
]

const PLATFORM_DOT = {
  Instagram: 'bg-ember',
  TikTok: 'bg-gold',
  YouTube: 'bg-mint',
  Facebook: 'bg-bone',
}

function formatDate(iso) {
  if (!iso) return '\u2014'
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatNumber(n, key) {
  if (n == null) return '\u2014'
  if (key === 'engagement_rate') return n === 0 ? '\u2014' : `${Number(n).toFixed(1)}`
  return Number(n).toLocaleString()
}

export default function PostTable({ posts }) {
  const [sortKey, setSortKey] = useState('views')
  const [sortDir, setSortDir] = useState('desc')
  const [platformFilter, setPlatformFilter] = useState('all')

  const sorted = useMemo(() => {
    let list = posts
    if (platformFilter !== 'all') {
      list = list.filter(p => p.platform === platformFilter)
    }
    return [...list].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      if (sortKey === 'sent_at') {
        return sortDir === 'asc'
          ? new Date(av) - new Date(bv)
          : new Date(bv) - new Date(av)
      }
      if (typeof av === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      }
      return sortDir === 'asc' ? av - bv : bv - av
    })
  }, [posts, sortKey, sortDir, platformFilter])

  function toggleSort(key) {
    if (key === sortKey) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir(key === 'text_preview' || key === 'platform' ? 'asc' : 'desc')
    }
  }

  const platforms = ['all', 'Instagram', 'TikTok', 'YouTube', 'Facebook']

  return (
    <div>
      {/* Platform filter -- scrolls horizontally if it overflows on narrow screens */}
      <div className="flex gap-1 mb-4 text-xs font-mono overflow-x-auto -mx-1 px-1 pb-1">
        {platforms.map(p => (
          <button
            key={p}
            onClick={() => setPlatformFilter(p)}
            className={`px-3 py-1.5 uppercase tracking-widest transition-colors whitespace-nowrap shrink-0 ${
              platformFilter === p
                ? 'bg-paper text-ink'
                : 'bg-stone text-ash hover:text-paper'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Mobile sort control -- only visible below md */}
      <div className="md:hidden mb-4">
        <p className="eyebrow mb-2">Sort by</p>
        <div className="flex gap-1 text-xs font-mono overflow-x-auto -mx-1 px-1 pb-1">
          {MOBILE_SORTS.map(s => {
            const active = sortKey === s.key
            return (
              <button
                key={s.key}
                onClick={() => toggleSort(s.key)}
                className={`px-3 py-1.5 uppercase tracking-widest transition-colors whitespace-nowrap shrink-0 ${
                  active ? 'bg-paper text-ink' : 'bg-stone text-ash hover:text-paper'
                }`}
              >
                {s.label}{active && <span className="ml-1">{sortDir === 'asc' ? '\u2191' : '\u2193'}</span>}
              </button>
            )
          })}
        </div>
      </div>

      {sorted.length === 0 && (
        <div className="px-3 py-12 text-center eyebrow">No posts in view</div>
      )}

      {/* MOBILE: stacked cards (hidden on md+) */}
      <div className="md:hidden space-y-px bg-paper/5">
        {sorted.map(post => (
          <div key={post.id} className="bg-ink p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-2 font-mono text-xs text-paper">
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${PLATFORM_DOT[post.platform] || 'bg-ash'}`} />
                {post.platform}
              </span>
              <span className="font-mono text-xs text-ash">{formatDate(post.sent_at)}</span>
            </div>
            <p className="font-display text-bone/80 text-sm leading-snug mb-3 line-clamp-2">
              {post.text_preview || <span className="text-ash italic">(no caption)</span>}
            </p>
            <div className="grid grid-cols-3 gap-y-2 gap-x-3 font-mono text-[0.7rem]">
              <Metric label="Views" value={formatNumber(post.views, 'views')} />
              <Metric label="Reach" value={formatNumber(post.reach, 'reach')} />
              <Metric label="Imp." value={formatNumber(post.impressions, 'impressions')} />
              <Metric label="React." value={formatNumber(post.reactions, 'reactions')} />
              <Metric label="Comm." value={formatNumber(post.comments, 'comments')} />
              <Metric label="Shares" value={formatNumber(post.shares, 'shares')} />
              <Metric label="Eng. %" value={formatNumber(post.engagement_rate, 'engagement_rate')} accent />
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP: table (hidden below md) */}
      <div className="hidden md:block overflow-x-auto">
        <div className="min-w-[1080px]">
          <div className="flex gap-3 px-3 py-2 border-b border-paper/10">
            {COLUMNS.map(col => {
              const active = sortKey === col.key
              return (
                <button
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  className={`eyebrow ${col.width} ${active ? 'text-ember' : 'hover:text-paper'}`}
                >
                  {col.label}
                  {active && <span className="ml-1">{sortDir === 'asc' ? '\u2191' : '\u2193'}</span>}
                </button>
              )
            })}
          </div>

          {sorted.map(post => (
            <div
              key={post.id}
              className="flex gap-3 px-3 py-3 border-b border-paper/5 hover:bg-stone/40 transition-colors font-mono text-xs"
            >
              <div className="w-28 text-ash">{formatDate(post.sent_at)}</div>
              <div className="w-28 flex items-center gap-2 text-paper">
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${PLATFORM_DOT[post.platform] || 'bg-ash'}`} />
                {post.platform}
              </div>
              <div className="flex-1 text-bone/80 truncate" title={post.text_preview}>
                {post.text_preview || <span className="text-ash">(no caption)</span>}
              </div>
              <div className="w-20 text-right text-paper">{formatNumber(post.views, 'views')}</div>
              <div className="w-20 text-right text-paper">{formatNumber(post.reach, 'reach')}</div>
              <div className="w-20 text-right text-paper">{formatNumber(post.impressions, 'impressions')}</div>
              <div className="w-20 text-right text-paper">{formatNumber(post.reactions, 'reactions')}</div>
              <div className="w-16 text-right text-paper">{formatNumber(post.comments, 'comments')}</div>
              <div className="w-16 text-right text-paper">{formatNumber(post.shares, 'shares')}</div>
              <div className="w-20 text-right text-gold">{formatNumber(post.engagement_rate, 'engagement_rate')}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value, accent }) {
  return (
    <div>
      <p className="text-ash uppercase tracking-wider mb-0.5">{label}</p>
      <p className={accent ? 'text-gold' : 'text-paper'}>{value}</p>
    </div>
  )
}

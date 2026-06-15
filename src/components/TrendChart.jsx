import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'

const PLATFORM_COLORS = {
  Instagram: '#C73E1D',
  TikTok: '#D4A24C',
  YouTube: '#7FB069',
  Facebook: '#E8E4DA',
}

function formatWeek(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function TrendChart({ reports, metric = 'views' }) {
  // reports come in newest-first; reverse for chronological X axis
  const data = [...reports].reverse().map(r => {
    const row = { week: formatWeek(r.week_start) }
    const totals = r.totals_by_platform || {}
    for (const platform of Object.keys(PLATFORM_COLORS)) {
      row[platform] = totals[platform]?.[metric] ?? 0
    }
    return row
  })

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 16, left: -8, bottom: 0 }}>
          <CartesianGrid stroke="rgba(245,242,236,0.06)" strokeDasharray="0" />
          <XAxis
            dataKey="week"
            stroke="#8A8680"
            tick={{ fontFamily: 'JetBrains Mono', fontSize: 10, fill: '#8A8680' }}
            axisLine={{ stroke: 'rgba(245,242,236,0.12)' }}
            tickLine={false}
          />
          <YAxis
            stroke="#8A8680"
            tick={{ fontFamily: 'JetBrains Mono', fontSize: 10, fill: '#8A8680' }}
            axisLine={{ stroke: 'rgba(245,242,236,0.12)' }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: '#1A1A1C',
              border: '1px solid rgba(245,242,236,0.12)',
              borderRadius: 0,
              fontFamily: 'JetBrains Mono',
              fontSize: 11,
              color: '#F5F2EC',
            }}
            cursor={{ stroke: '#C73E1D', strokeWidth: 1, strokeDasharray: '2 4' }}
          />
          <Legend
            wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', paddingTop: 8 }}
            iconType="square"
            iconSize={8}
          />
          {Object.entries(PLATFORM_COLORS).map(([platform, color]) => (
            <Line
              key={platform}
              type="monotone"
              dataKey={platform}
              stroke={color}
              strokeWidth={1.5}
              dot={{ r: 2, fill: color }}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

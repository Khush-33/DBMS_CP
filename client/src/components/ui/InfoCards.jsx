import React, { useEffect, useRef, useState } from 'react'

const formatNumber = (v) => {
  if (v === null || v === undefined) return '—'
  if (typeof v === 'number') return v.toLocaleString('en-IN')
  return v
}

const CountUp = ({ value = 0, duration = 1200 }) => {
  const [display, setDisplay] = useState(0)
  const start = useRef(0)
  const startTs = useRef(0)
  const raf = useRef(null)

  useEffect(() => {
    cancelAnimationFrame(raf.current)
    start.current = 0
    startTs.current = 0
    const animate = (ts) => {
      if (!startTs.current) startTs.current = ts
      const elapsed = ts - startTs.current
      const t = Math.min(1, elapsed / duration)
      const eased = 1 - Math.pow(1 - t, 3) // easeOutCubic
      const next = Math.round(eased * value)
      setDisplay(next)
      if (t < 1) raf.current = requestAnimationFrame(animate)
    }
    raf.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf.current)
  }, [value, duration])

  return <>{display.toLocaleString('en-IN')}</>
}

const InfoCards = ({ items = [] }) => {
  return (
    <div className="info-cards">
      {items.map((it, idx) => (
        <div className={`info-card animate-fade-in-up ${idx === 0 ? 'stagger-1' : idx === 1 ? 'stagger-2' : idx === 2 ? 'stagger-3' : 'stagger-4'}`} key={idx}>
          <div className="label">{it.label}</div>
          <div className="value">{it.loading ? 'Loading...' : <CountUp value={typeof it.value === 'number' ? it.value : Number(it.value) || 0} />}</div>
          {it.sub && <div className="text-sm text-gray-400 mt-2">{it.sub}</div>}
        </div>
      ))}
    </div>
  )
}

export default InfoCards

import React, { useEffect, useRef, useState } from 'react'

const formatNumber = (v) => {
  if (v === null || v === undefined) return '—'
  if (typeof v === 'number') return v.toLocaleString('en-IN')
  return v
}

const CountUp = ({ value = 0, duration = 1200, precision = 0 }) => {
  const [display, setDisplay] = useState(0)
  const start = useRef(0)
  const startTs = useRef(0)
  const raf = useRef(null)

  useEffect(() => {
    cancelAnimationFrame(raf.current)
    start.current = 0
    startTs.current = 0
    const factor = Math.pow(10, precision)
    const target = value * factor
    const animate = (ts) => {
      if (!startTs.current) startTs.current = ts
      const elapsed = ts - startTs.current
      const t = Math.min(1, elapsed / duration)
      const eased = 1 - Math.pow(1 - t, 3) // easeOutCubic
      const next = Math.round(eased * target) / factor
      setDisplay(next)
      if (t < 1) raf.current = requestAnimationFrame(animate)
    }
    raf.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf.current)
  }, [value, duration, precision])

  return <>{display.toLocaleString('en-IN', { minimumFractionDigits: precision, maximumFractionDigits: precision })}</>
}

const InfoCards = ({ items = [] }) => {
  return (
    <div className="info-cards">
      {items.map((it, idx) => (
        <div className="info-card animate-fade-in-up" key={idx}>
          <div className="label">{it.label}</div>
          <div className="value">
            {(() => {
              if (it.loading) return 'Loading...'
              const numericValue = typeof it.value === 'number' ? it.value : Number(it.value)
              const hasNumericValue = Number.isFinite(numericValue)
              if (hasNumericValue) {
                return (
                  <CountUp
                    value={numericValue}
                    duration={it.duration}
                    precision={typeof it.precision === 'number' ? it.precision : 0}
                  />
                )
              }
              return it.value ?? '—'
            })()}
          </div>
          {it.sub && <div className="text-sm text-gray-400 mt-2">{it.sub}</div>}
        </div>
      ))}
    </div>
  )
}

export default InfoCards

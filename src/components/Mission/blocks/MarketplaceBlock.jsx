// src/components/Mission/blocks/MarketplaceBlock.jsx
import s from './Blocks.module.css';
export default function MarketplaceBlock({ listings, audit }) {
  return (
    <div className={s.block}>
      <div className={s.blockTitle}>🕸️ DARK WEB MARKETPLACE MONITOR</div>
      <div className={s.marketplace}>
        <div className={s.mktHeader}><span>// THREAT INTEL FEED</span><span className={s.live}>● LIVE</span></div>
        {listings.map((l) => (
          <div key={l.id} className={`${s.mktRow} ${l.fresh ? s.mktHot : ''}`}>
            <span className={s.mktTitle}>{l.title}</span>
            <span className={s.mktTs}>{l.ts}</span>
            <span className={s.mktPrice}>{l.price}</span>
            {l.tag && <span className={s.mktTag}>{l.tag.toUpperCase()}</span>}
            {l.fresh && <span className={s.mktFresh}>FRESH</span>}
          </div>
        ))}
      </div>
      <div className={s.blockTitle} style={{marginTop:14}}>☸️ KUBERNETES AUDIT LOG</div>
      <div className={s.logViewer}>
        {audit.map((l, i) => <div key={i} className={`${s.logLine} ${l.highlight ? s.logHighlight : ''}`}>{l.text}</div>)}
      </div>
    </div>
  );
}

// Produktkarte für Affiliate-Empfehlungen — genutzt an allen 3 Touchpoints
// (Onboarding-Empfehlung, Wochenseite, Check-in-Auswertung; siehe GAMEPLAN Kap. 12).
import { IconExternalLink } from '@tabler/icons-react';

export interface AffiliateProduct {
  id: string;
  partner_name: string;
  produkt_name: string;
  beschreibung: string | null;
  url: string;
  rabattcode: string | null;
}

export default function AffiliateProductCard({ product }: { product: AffiliateProduct }) {
  return (
    <div className="rounded-2xl border border-outline/50 bg-surface p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{product.partner_name}</p>
      <p className="mt-1 font-semibold text-text">{product.produkt_name}</p>
      {product.beschreibung && (
        <p className="mt-2 text-sm leading-relaxed text-text-muted">{product.beschreibung}</p>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <a
          href={product.url}
          target="_blank"
          rel="noopener noreferrer nofollow sponsored"
          className="inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition hover:bg-accent-hover"
        >
          Zum Produkt <IconExternalLink size={16} stroke={1.75} />
        </a>
        {product.rabattcode && (
          <span className="rounded-full border border-outline px-3 py-1.5 text-xs font-medium text-text-muted">
            Code: <span className="font-semibold text-text">{product.rabattcode}</span>
          </span>
        )}
      </div>
    </div>
  );
}

import ProductCard from '../../components/ui/ProductCard';
import StoreTeaser from '../../components/ui/StoreTeaser';

const PLACEHOLDER_PRODUCTS = [
  { name: 'Pro Maple Snooker Cue — 9.5mm', brand: 'Cue Masters', price: 14500 },
  { name: 'Aramith Tournament Ball Set', brand: 'Aramith', price: 28000 },
  { name: 'Leather Cue Case — Hard Shell', brand: 'ProCase', price: 6500 },
  { name: 'Triangle Blue Diamond Chalk (2pc)', brand: 'Triangle', price: 1200 },
  { name: 'Pro Rest Head — Chrome', brand: 'Cue Masters', price: 3200 },
  { name: 'Snooker Table Cloth — 6×12', brand: 'Strachan', price: 45000 },
];

export default function StorePage() {
  return (
    <div className="max-w-[1200px] mx-auto px-6 sm:px-9 py-8">
      <div className="mb-6">
        <div className="seclabel text-felt mb-1.5 flex items-center gap-2">
          <span className="badge bg-brass-tint text-brass-700"><span className="dot" />Coming soon</span>
        </div>
        <h1 className="font-display font-extrabold uppercase text-[2.125rem] leading-none">Store</h1>
        <p className="text-ink-500 text-[15px] mt-2">Pro equipment from trusted Pakistani retailers. Launching soon.</p>
      </div>

      {/* Store teaser banner */}
      <StoreTeaser compact />

      {/* Placeholder products */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {PLACEHOLDER_PRODUCTS.map((p, i) => <ProductCard key={i} product={p} />)}
      </div>
    </div>
  );
}

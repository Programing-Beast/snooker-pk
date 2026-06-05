export default function ProductCard({ product }) {
  return (
    <div className="card overflow-hidden flex flex-col">
      <div className="aspect-[4/3] bg-card-alt relative grid place-items-center">
        <span className="absolute top-3 left-3 badge bg-brass-tint text-brass-700">
          <span className="dot" />Store · soon
        </span>
        {product?.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <svg className="text-ink-300" width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M3 21L21 3M6.5 4.5l13 13" /><circle cx="5" cy="6" r="2.2" />
          </svg>
        )}
      </div>
      <div className="p-4">
        {product?.brand && <div className="seclabel text-muted text-[10px]">{product.brand}</div>}
        <h4 className="text-[14.5px] font-semibold leading-snug mt-1.5 mb-3">{product?.name || 'Product'}</h4>
        <div className="flex items-center justify-between">
          <span className="font-display font-extrabold text-[19px]">
            <span className="text-muted text-xs">PKR</span> {product?.price ? Number(product.price).toLocaleString() : '—'}
          </span>
          <button className="btn btn-secondary btn-sm" disabled>Coming soon</button>
        </div>
      </div>
    </div>
  );
}

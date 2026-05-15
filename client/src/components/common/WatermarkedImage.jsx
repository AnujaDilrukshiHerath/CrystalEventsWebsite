export default function WatermarkedImage({ src, alt, className = '', watermarkClassName = '', ...props }) {
  return (
    <div className="relative w-full h-full">
      <img
        src={src}
        alt={alt}
        className={className}
        {...props}
      />
      <div className={`pointer-events-none absolute right-3 bottom-3 z-10 rounded bg-black/35 p-2 shadow-lg ${watermarkClassName}`}>
        <img
          src="/crystalLogo.jpeg"
          alt=""
          aria-hidden="true"
          className="h-8 w-auto opacity-85"
        />
      </div>
    </div>
  )
}

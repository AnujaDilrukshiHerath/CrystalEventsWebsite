const isVideoSource = (src = '', mediaType = '') => (
  mediaType === 'video'
  || src.toLowerCase().includes('.mp4')
  || src.toLowerCase().includes('.webm')
  || src.toLowerCase().includes('.mov')
  || src.toLowerCase().includes('.m4v')
)

export default function WatermarkedImage({
  src,
  alt,
  className = '',
  watermarkClassName = '',
  mediaType = 'image',
  controls = false,
  autoPlay = false,
  muted = true,
  loop = false,
  loading,
  ...props
}) {
  const isVideo = isVideoSource(src, mediaType)

  return (
    <div className="relative w-full h-full">
      {isVideo ? (
        <video
          src={src}
          aria-label={alt}
          className={className}
          controls={controls}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          playsInline
          preload="metadata"
          {...props}
        />
      ) : (
        <img
          src={src}
          alt={alt}
          className={className}
          loading={loading}
          {...props}
        />
      )}
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

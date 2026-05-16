import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import WatermarkedImage from './WatermarkedImage'

export default function ImageLightbox({ image, onClose, onPrevious, onNext, hasPrevious = false, hasNext = false, counter }) {
  const [touchStartX, setTouchStartX] = useState(null)

  useEffect(() => {
    if (!image) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft' && hasPrevious) onPrevious?.()
      if (event.key === 'ArrowRight' && hasNext) onNext?.()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [hasNext, hasPrevious, image, onClose, onNext, onPrevious])

  if (!image) return null

  const handleTouchEnd = (event) => {
    if (touchStartX === null) return
    const touchEndX = event.changedTouches[0]?.clientX
    const distance = touchEndX - touchStartX
    if (distance > 50 && hasPrevious) onPrevious?.()
    if (distance < -50 && hasNext) onNext?.()
    setTouchStartX(null)
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
      onTouchStart={(event) => setTouchStartX(event.touches[0]?.clientX ?? null)}
      onTouchEnd={handleTouchEnd}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white/80 hover:text-white"
        aria-label="Close image"
      >
        <X size={26} />
      </button>
      {hasPrevious && (
        <button
          type="button"
          onClick={(event) => { event.stopPropagation(); onPrevious?.() }}
          className="absolute left-3 md:left-6 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
          aria-label="Previous image"
        >
          <ChevronLeft size={30} />
        </button>
      )}
      {hasNext && (
        <button
          type="button"
          onClick={(event) => { event.stopPropagation(); onNext?.() }}
          className="absolute right-3 md:right-6 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
          aria-label="Next image"
        >
          <ChevronRight size={30} />
        </button>
      )}
      <div className="max-w-6xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
        <div className="max-h-[84vh] overflow-hidden bg-black">
          <WatermarkedImage
            src={image.src}
            alt={image.alt || ''}
            className="w-full max-h-[84vh] object-contain"
            watermarkClassName="right-4 bottom-4"
          />
        </div>
        {image.title && (
          <div className="bg-white px-4 py-3 text-center text-sm font-semibold text-crystal-blue">
            {image.title}
            {counter && <span className="ml-3 text-xs font-normal text-gray-400">{counter}</span>}
          </div>
        )}
      </div>
    </div>
  )
}

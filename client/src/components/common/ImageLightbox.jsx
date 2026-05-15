import WatermarkedImage from './WatermarkedImage'

export default function ImageLightbox({ image, onClose }) {
  if (!image) return null

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 text-white/80 hover:text-white text-3xl leading-none"
        aria-label="Close image"
      >
        &times;
      </button>
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
          </div>
        )}
      </div>
    </div>
  )
}

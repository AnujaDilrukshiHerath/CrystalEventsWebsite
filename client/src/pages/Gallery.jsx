import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { getApiUrl } from '../utils/api'
import { getImageUrl } from '../utils/media'
import WatermarkedImage from '../components/common/WatermarkedImage'
import ImageLightbox from '../components/common/ImageLightbox'

const CATEGORY_SEPARATOR = ' :: '

const splitCategory = (category = '') => {
  const [mainCategory, subCategory, ...childSubCategoryParts] = category.split(CATEGORY_SEPARATOR)
  return {
    mainCategory: mainCategory || '',
    subCategory: subCategory || '',
    childSubCategory: childSubCategoryParts.join(CATEGORY_SEPARATOR)
  }
}

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSubCategory, setSelectedSubCategory] = useState('')
  const [selectedChildSubCategory, setSelectedChildSubCategory] = useState('')
  const [selectedImageIndex, setSelectedImageIndex] = useState(null)
  const { data: images, isLoading } = useQuery({
    queryKey: ['gallery'],
    queryFn: async () => {
      const res = await fetch(getApiUrl('/api/gallery'))
      if (!res.ok) throw new Error('Network response was not ok')
      return res.json()
    }
  })
  const categories = [...new Set(images?.map((image) => splitCategory(image.category).mainCategory) || [])]
  const subCategories = [...new Set(images
    ?.filter((image) => splitCategory(image.category).mainCategory === selectedCategory)
    .map((image) => splitCategory(image.category).subCategory)
    .filter(Boolean) || [])]
  const childSubCategories = [...new Set(images
    ?.filter((image) => {
      const parts = splitCategory(image.category)
      return parts.mainCategory === selectedCategory && parts.subCategory === selectedSubCategory
    })
    .map((image) => splitCategory(image.category).childSubCategory)
    .filter(Boolean) || [])]
  const filteredImages = images?.filter((image) => {
    const parts = splitCategory(image.category)
    return (!selectedCategory || parts.mainCategory === selectedCategory)
      && (!selectedSubCategory || parts.subCategory === selectedSubCategory)
      && (!selectedChildSubCategory || parts.childSubCategory === selectedChildSubCategory)
  })
  const visibleImages = filteredImages || []
  const selectedImage = selectedImageIndex !== null && visibleImages[selectedImageIndex]
    ? {
        src: getImageUrl(visibleImages[selectedImageIndex].url),
        alt: visibleImages[selectedImageIndex].title,
        title: visibleImages[selectedImageIndex].title
      }
    : null

  useEffect(() => {
    if (selectedCategory && !categories.includes(selectedCategory)) setSelectedCategory('')
  }, [categories, selectedCategory])

  useEffect(() => {
    if (subCategories.length > 0 && !subCategories.includes(selectedSubCategory)) {
      setSelectedSubCategory(subCategories[0])
    }
    if (subCategories.length === 0 && selectedSubCategory) setSelectedSubCategory('')
  }, [subCategories, selectedSubCategory])

  useEffect(() => {
    if (childSubCategories.length > 0 && !childSubCategories.includes(selectedChildSubCategory)) {
      setSelectedChildSubCategory(childSubCategories[0])
    }
    if (childSubCategories.length === 0 && selectedChildSubCategory) setSelectedChildSubCategory('')
  }, [childSubCategories, selectedChildSubCategory])

  if (isLoading) {
    return (
      <div className="pt-32 pb-24 container mx-auto px-4 min-h-screen flex justify-center items-center">
        <div className="animate-pulse text-crystal-gold text-xl font-serif">Loading Gallery...</div>
      </div>
    )
  }

  return (
    <div className="pt-32 pb-24 container mx-auto px-4 min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-serif text-crystal-blue mb-8">Our Gallery</h1>
        <p className="text-gray-600 text-lg font-light leading-relaxed">
          A collection of exquisite moments captured at our venues. Explore the elegance and grandeur of Crystal Events.
        </p>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-3 mb-10">
        <button
          onClick={() => { setSelectedCategory(''); setSelectedSubCategory(''); setSelectedChildSubCategory('') }}
          className={`px-5 py-2 text-xs uppercase tracking-widest border transition-all ${
            selectedCategory === ''
              ? 'bg-crystal-blue text-white border-crystal-blue'
              : 'bg-white text-gray-500 border-gray-200 hover:border-crystal-gold hover:text-crystal-blue'
          }`}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => { setSelectedCategory(category); setSelectedSubCategory(''); setSelectedChildSubCategory('') }}
            className={`px-5 py-2 text-xs uppercase tracking-widest border transition-all ${
              selectedCategory === category
                ? 'bg-crystal-blue text-white border-crystal-blue'
                : 'bg-white text-gray-500 border-gray-200 hover:border-crystal-gold hover:text-crystal-blue'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      {subCategories.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3 mb-10 -mt-4">
          {subCategories.map((category) => (
            <button
              key={category}
              onClick={() => { setSelectedSubCategory(category); setSelectedChildSubCategory('') }}
              className={`px-4 py-2 text-[10px] uppercase tracking-widest border transition-all ${
                selectedSubCategory === category
                  ? 'bg-crystal-gold text-crystal-dark border-crystal-gold'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-crystal-gold hover:text-crystal-blue'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}
      {childSubCategories.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3 mb-10 -mt-4">
          {childSubCategories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedChildSubCategory(category)}
              className={`px-4 py-2 text-[10px] uppercase tracking-widest border transition-all ${
                selectedChildSubCategory === category
                  ? 'bg-crystal-dark text-white border-crystal-dark'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-crystal-gold hover:text-crystal-blue'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleImages.map((image, index) => (
          <motion.div 
            key={image.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative group overflow-hidden aspect-square rounded-sm shadow-lg bg-gray-200 cursor-zoom-in"
            onClick={() => setSelectedImageIndex(index)}
          >
            <WatermarkedImage
              src={getImageUrl(image.url)}
              alt={image.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              watermarkClassName="right-4 bottom-4"
            />
            <div className="absolute inset-0 z-20 bg-crystal-dark/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-6 text-center">
              <span className="text-crystal-gold text-xs uppercase tracking-widest mb-2">{splitCategory(image.category).mainCategory}</span>
              {splitCategory(image.category).subCategory && (
                <span className="text-gray-200 text-xs mb-2">{splitCategory(image.category).subCategory}</span>
              )}
              {splitCategory(image.category).childSubCategory && (
                <span className="text-gray-300 text-[11px] mb-2">{splitCategory(image.category).childSubCategory}</span>
              )}
              <h3 className="text-white text-lg font-serif">{image.title}</h3>
            </div>
          </motion.div>
        ))}
      </div>
      <ImageLightbox
        image={selectedImage}
        onClose={() => setSelectedImageIndex(null)}
        hasPrevious={selectedImageIndex > 0}
        hasNext={selectedImageIndex !== null && selectedImageIndex < visibleImages.length - 1}
        onPrevious={() => setSelectedImageIndex((index) => Math.max((index || 0) - 1, 0))}
        onNext={() => setSelectedImageIndex((index) => Math.min((index || 0) + 1, visibleImages.length - 1))}
        counter={selectedImageIndex !== null ? `${selectedImageIndex + 1} / ${visibleImages.length}` : ''}
      />
    </div>
  )
}

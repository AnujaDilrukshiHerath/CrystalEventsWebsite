import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { getApiUrl } from '../utils/api'
import { getImageUrl } from '../utils/media'
import WatermarkedImage from '../components/common/WatermarkedImage'
import ImageLightbox from '../components/common/ImageLightbox'

const CATEGORY_SEPARATOR = ' :: '

const splitCategory = (category = '') => {
  const [mainCategory, ...subCategoryParts] = category.split(CATEGORY_SEPARATOR)
  return {
    mainCategory: mainCategory || '',
    subCategory: subCategoryParts.join(CATEGORY_SEPARATOR)
  }
}

export default function Decorations() {
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSubCategory, setSelectedSubCategory] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const { data: images, isLoading } = useQuery({
    queryKey: ['decorations'],
    queryFn: async () => {
      const res = await fetch(getApiUrl('/api/gallery?type=decorations'))
      if (!res.ok) throw new Error('Network response was not ok')
      return res.json()
    }
  })

  const categories = [...new Set(images?.map((image) => splitCategory(image.category).mainCategory) || [])]
  const subCategories = [...new Set(images
    ?.filter((image) => splitCategory(image.category).mainCategory === selectedCategory)
    .map((image) => splitCategory(image.category).subCategory)
    .filter(Boolean) || [])]
  const filteredImages = images?.filter((image) => {
    const parts = splitCategory(image.category)
    return (!selectedCategory || parts.mainCategory === selectedCategory)
      && (!selectedSubCategory || parts.subCategory === selectedSubCategory)
  })

  useEffect(() => {
    if (!selectedCategory && categories.length > 0) setSelectedCategory(categories[0])
  }, [categories, selectedCategory])

  useEffect(() => {
    if (subCategories.length > 0 && !subCategories.includes(selectedSubCategory)) {
      setSelectedSubCategory(subCategories[0])
    }
    if (subCategories.length === 0 && selectedSubCategory) setSelectedSubCategory('')
  }, [subCategories, selectedSubCategory])

  if (isLoading) {
    return (
      <div className="pt-32 pb-24 container mx-auto px-4 min-h-screen flex justify-center items-center">
        <div className="animate-pulse text-crystal-gold text-xl font-serif">Loading Decorations...</div>
      </div>
    )
  }

  return (
    <div className="pt-32 pb-24 min-h-screen">
      <section className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-serif text-crystal-blue mb-8">Decorations</h1>
          <p className="text-gray-600 text-lg font-light leading-relaxed">
            Browse stage styling, floral pieces, table settings, and event decoration ideas from Crystal Events.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => { setSelectedCategory(category); setSelectedSubCategory('') }}
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
                onClick={() => setSelectedSubCategory(category)}
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

        {filteredImages?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                className="group overflow-hidden bg-white shadow-lg border border-gray-100 cursor-zoom-in"
                onClick={() => setSelectedImage({ src: getImageUrl(image.url), alt: image.title, title: image.title })}
              >
                <div className="aspect-[4/5] bg-gray-100 overflow-hidden">
                  <WatermarkedImage
                    src={getImageUrl(image.url)}
                    alt={image.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    watermarkClassName="right-4 bottom-4"
                  />
                </div>
                <div className="p-5">
                  <div className="text-crystal-gold text-[10px] font-bold uppercase tracking-widest mb-2">{splitCategory(image.category).mainCategory}</div>
                  {splitCategory(image.category).subCategory && (
                    <div className="text-xs text-gray-400 mb-2">{splitCategory(image.category).subCategory}</div>
                  )}
                  <h2 className="text-lg font-serif text-crystal-blue">{image.title}</h2>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-gray-200 text-gray-400">
            No decoration images have been published yet.
          </div>
        )}
      </section>
      <ImageLightbox image={selectedImage} onClose={() => setSelectedImage(null)} />
    </div>
  )
}

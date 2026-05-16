import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ImageIcon } from 'lucide-react'
import { getApiUrl } from '../../utils/api'
import { getImageUrl } from '../../utils/media'
import WatermarkedImage from './WatermarkedImage'
import ImageLightbox from './ImageLightbox'

const INTERNAL_CATEGORY_PREFIX = 'Internal: '
const CATEGORY_SEPARATOR = ' :: '

const formatInternalCategory = (category = '') => (
  category.startsWith(INTERNAL_CATEGORY_PREFIX) ? category.slice(INTERNAL_CATEGORY_PREFIX.length) : category
)

const splitCategory = (category = '') => {
  const visibleCategory = formatInternalCategory(category)
  const [mainCategory, subCategory, ...childSubCategoryParts] = visibleCategory.split(CATEGORY_SEPARATOR)
  return {
    mainCategory: mainCategory || '',
    subCategory: subCategory || '',
    childSubCategory: childSubCategoryParts.join(CATEGORY_SEPARATOR)
  }
}

export default function TeamImageLibrary({ tokenKey = 'adminToken', queryKey = 'team-gallery', title = 'Customer Showcase' }) {
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSubCategory, setSelectedSubCategory] = useState('')
  const [selectedChildSubCategory, setSelectedChildSubCategory] = useState('')
  const [selectedImageIndex, setSelectedImageIndex] = useState(null)
  const { data: images, isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const res = await fetch(getApiUrl('/api/admin/team-gallery'), {
        headers: { 'Authorization': `Bearer ${localStorage.getItem(tokenKey)}` }
      })
      if (!res.ok) throw new Error('Failed to fetch team images')
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
  const visibleImages = images?.filter((image) => {
    const parts = splitCategory(image.category)
    return (!selectedCategory || parts.mainCategory === selectedCategory)
      && (!selectedSubCategory || parts.subCategory === selectedSubCategory)
      && (!selectedChildSubCategory || parts.childSubCategory === selectedChildSubCategory)
  })
  const showcaseImages = visibleImages || []
  const selectedImage = selectedImageIndex !== null && showcaseImages[selectedImageIndex]
    ? {
        src: getImageUrl(showcaseImages[selectedImageIndex].url),
        alt: showcaseImages[selectedImageIndex].title,
        title: showcaseImages[selectedImageIndex].title
      }
    : null

  useEffect(() => {
    if (!selectedCategory && categories.length > 0) setSelectedCategory(categories[0])
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

  return (
    <div className="bg-white shadow-xl rounded-sm border-t-4 border-crystal-gold overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gray-50">
        <div>
          <h2 className="text-xl font-serif text-crystal-blue">{title}</h2>
          <p className="text-xs uppercase tracking-widest text-gray-400 mt-1">Internal images only</p>
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => { setSelectedCategory(e.target.value); setSelectedSubCategory(''); setSelectedChildSubCategory('') }}
          className="bg-white border border-gray-200 px-4 py-2 text-xs uppercase tracking-widest text-gray-500 outline-none"
        >
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        {subCategories.length > 0 && (
          <select
            value={selectedSubCategory}
            onChange={(e) => { setSelectedSubCategory(e.target.value); setSelectedChildSubCategory('') }}
            className="bg-white border border-gray-200 px-4 py-2 text-xs uppercase tracking-widest text-gray-500 outline-none"
          >
            {subCategories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        )}
        {childSubCategories.length > 0 && (
          <select
            value={selectedChildSubCategory}
            onChange={(e) => setSelectedChildSubCategory(e.target.value)}
            className="bg-white border border-gray-200 px-4 py-2 text-xs uppercase tracking-widest text-gray-500 outline-none"
          >
            {childSubCategories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        )}
      </div>

      {isLoading ? (
        <div className="p-16 text-center text-crystal-gold font-serif text-xl animate-pulse">Loading images...</div>
      ) : showcaseImages.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
          {showcaseImages.map((image, index) => (
            <div
              key={image.id}
              className="border border-gray-50 cursor-zoom-in"
              onClick={() => setSelectedImageIndex(index)}
            >
              <div className="aspect-square bg-gray-100 overflow-hidden">
                <WatermarkedImage
                  src={getImageUrl(image.url)}
                  alt={image.title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                  watermarkClassName="right-3 bottom-3 p-1.5 [&_img]:h-7"
                />
              </div>
              <div className="p-4">
                <div className="text-[10px] uppercase tracking-widest text-crystal-gold font-bold">{splitCategory(image.category).mainCategory}</div>
                {splitCategory(image.category).subCategory && (
                  <div className="text-[10px] text-gray-400 mt-1">{splitCategory(image.category).subCategory}</div>
                )}
                {splitCategory(image.category).childSubCategory && (
                  <div className="text-[10px] text-gray-400 mt-1">{splitCategory(image.category).childSubCategory}</div>
                )}
                <h3 className="text-sm font-semibold text-crystal-dark mt-1">{image.title}</h3>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-16 text-center">
          <ImageIcon size={44} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-400 text-sm">No internal showcase images have been added yet.</p>
        </div>
      )}
      <ImageLightbox
        image={selectedImage}
        onClose={() => setSelectedImageIndex(null)}
        hasPrevious={selectedImageIndex > 0}
        hasNext={selectedImageIndex !== null && selectedImageIndex < showcaseImages.length - 1}
        onPrevious={() => setSelectedImageIndex((index) => Math.max((index || 0) - 1, 0))}
        onNext={() => setSelectedImageIndex((index) => Math.min((index || 0) + 1, showcaseImages.length - 1))}
        counter={selectedImageIndex !== null ? `${selectedImageIndex + 1} / ${showcaseImages.length}` : ''}
      />
    </div>
  )
}

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ImageIcon } from 'lucide-react'
import { getApiUrl } from '../../utils/api'
import { getImageUrl } from '../../utils/media'
import WatermarkedImage from './WatermarkedImage'

const INTERNAL_CATEGORY_PREFIX = 'Internal: '

const formatInternalCategory = (category = '') => (
  category.startsWith(INTERNAL_CATEGORY_PREFIX) ? category.slice(INTERNAL_CATEGORY_PREFIX.length) : category
)

export default function TeamImageLibrary({ tokenKey = 'adminToken', queryKey = 'team-gallery', title = 'Customer Showcase' }) {
  const [selectedCategory, setSelectedCategory] = useState('all')
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

  const categories = ['all', ...new Set(images?.map((image) => image.category) || [])]
  const visibleImages = images?.filter((image) => selectedCategory === 'all' || image.category === selectedCategory)

  return (
    <div className="bg-white shadow-xl rounded-sm border-t-4 border-crystal-gold overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gray-50">
        <div>
          <h2 className="text-xl font-serif text-crystal-blue">{title}</h2>
          <p className="text-xs uppercase tracking-widest text-gray-400 mt-1">Internal images only</p>
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-white border border-gray-200 px-4 py-2 text-xs uppercase tracking-widest text-gray-500 outline-none"
        >
          {categories.map((category) => (
            <option key={category} value={category}>{category === 'all' ? 'All Images' : formatInternalCategory(category)}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="p-16 text-center text-crystal-gold font-serif text-xl animate-pulse">Loading images...</div>
      ) : visibleImages?.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
          {visibleImages.map((image) => (
            <div key={image.id} className="border border-gray-50">
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
                <div className="text-[10px] uppercase tracking-widest text-crystal-gold font-bold">{formatInternalCategory(image.category)}</div>
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
    </div>
  )
}

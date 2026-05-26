import { useState } from 'react'
import { productImageUrl, productEmoji } from '../utils/productImage'

interface Props {
  name: string
  size?: 'card' | 'detail'
  className?: string
}

export default function ProductImage({ name, size = 'card', className = '' }: Props) {
  const url = productImageUrl(name, size)
  const [failed, setFailed] = useState(false)

  if (!url || failed) {
    return (
      <div className={`bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center select-none ${className}`}>
        <span className={size === 'detail' ? 'text-8xl' : 'text-4xl'}>{productEmoji(name)}</span>
      </div>
    )
  }

  return (
    <img
      src={url}
      alt={name}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`w-full h-full object-cover ${className}`}
    />
  )
}

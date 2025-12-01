import React, { useState } from 'react'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Priority loading for LCP images */
  priority?: boolean;
  /** Displayed width for responsive sizing */
  displayWidth?: number;
}

/**
 * Optimizes Unsplash URLs for better performance
 * - Reduces width to match display size
 * - Adds WebP format
 * - Adds quality optimization
 */
function optimizeImageUrl(src: string, displayWidth?: number): string {
  if (!src) return src;
  
  // Optimize Unsplash images
  if (src.includes('unsplash.com')) {
    const url = new URL(src);
    const width = displayWidth || 400;
    url.searchParams.set('w', String(width));
    url.searchParams.set('q', '75'); // Quality 75% is good balance
    url.searchParams.set('fm', 'webp'); // WebP format
    url.searchParams.set('auto', 'format'); // Auto format selection
    return url.toString();
  }
  
  return src;
}

export function ImageWithFallback(props: ImageWithFallbackProps) {
  const [didError, setDidError] = useState(false)

  const handleError = () => {
    setDidError(true)
  }

  const { src, alt, style, className, priority, displayWidth, loading, ...rest } = props
  
  // Optimize the image URL
  const optimizedSrc = optimizeImageUrl(src || '', displayWidth);
  
  // Default to lazy loading unless priority is set
  const loadingStrategy = priority ? 'eager' : (loading || 'lazy');

  return didError ? (
    <div
      className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
      style={style}
    >
      <div className="flex items-center justify-center w-full h-full">
        <img src={ERROR_IMG_SRC} alt="Error loading image" {...rest} data-original-url={src} />
      </div>
    </div>
  ) : (
    <img 
      src={optimizedSrc} 
      alt={alt} 
      className={className} 
      style={style} 
      loading={loadingStrategy}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : undefined}
      {...rest} 
      onError={handleError} 
    />
  )
}

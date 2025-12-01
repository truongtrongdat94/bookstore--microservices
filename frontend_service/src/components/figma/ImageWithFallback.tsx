import React, { useState } from 'react'

// Local placeholder images - served from /public folder
// These will be uploaded to S3 along with other static assets
const BOOK_PLACEHOLDER = '/book-placeholder.jpg'

// Author placeholder - simple SVG silhouette (inline, no network request)
const AUTHOR_PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%23e5e7eb"%3E%3Ccircle cx="50" cy="50" r="50"/%3E%3Ccircle cx="50" cy="40" r="18" fill="%23d1d5db"/%3E%3Cellipse cx="50" cy="85" rx="30" ry="20" fill="%23d1d5db"/%3E%3C/svg%3E'

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Priority loading for LCP images */
  priority?: boolean;
  /** Displayed width for responsive sizing */
  displayWidth?: number;
  /** Aspect ratio for CLS prevention (e.g., "3/4" for book covers) */
  aspectRatio?: string;
  /** Type of placeholder to use */
  placeholderType?: 'book' | 'author' | 'default';
}

/**
 * Gets local placeholder based on type - no external requests
 */
function getLocalPlaceholder(type: 'book' | 'author' | 'default' = 'book'): string {
  switch (type) {
    case 'author':
      return AUTHOR_PLACEHOLDER;
    case 'book':
    default:
      return BOOK_PLACEHOLDER;
  }
}

/**
 * Optimizes image URLs for better performance
 * - Uses local placeholders for fallbacks (no Unsplash)
 * - Optimizes external URLs when available
 */
function optimizeImageUrl(src: string, displayWidth?: number, placeholderType?: 'book' | 'author' | 'default'): string {
  if (!src) return getLocalPlaceholder(placeholderType);
  
  const width = displayWidth || 300;
  
  // Optimize Unsplash images
  if (src.includes('unsplash.com')) {
    const url = new URL(src);
    url.searchParams.set('w', String(width));
    const quality = width <= 100 ? '40' : width <= 200 ? '50' : '60';
    url.searchParams.set('q', quality);
    url.searchParams.set('fm', 'webp');
    url.searchParams.set('auto', 'format');
    return url.toString();
  }
  
  // Use local placeholder instead of picsum.photos
  if (src.includes('picsum.photos')) {
    return getLocalPlaceholder(placeholderType);
  }
  
  // Use local placeholder instead of placehold.co
  if (src.includes('placehold.co')) {
    return getLocalPlaceholder(placeholderType);
  }
  
  return src;
}

export function ImageWithFallback(props: ImageWithFallbackProps) {
  const [didError, setDidError] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  const handleError = () => {
    setDidError(true)
  }

  const handleLoad = () => {
    setIsLoaded(true)
  }

  const { src, alt, style, className, priority, displayWidth, aspectRatio, loading, width, height, placeholderType = 'book', ...rest } = props
  
  // Optimize the image URL with local placeholder fallback
  const optimizedSrc = optimizeImageUrl(src || '', displayWidth, placeholderType);
  const localPlaceholder = getLocalPlaceholder(placeholderType);
  
  // Default to lazy loading unless priority is set
  const loadingStrategy = priority ? 'eager' : (loading || 'lazy');

  // Calculate dimensions for CLS prevention
  const defaultAspectRatio = aspectRatio || '3/4';
  const [aspectW, aspectH] = defaultAspectRatio.split('/').map(Number);
  const imgWidth = width || displayWidth || 300;
  const imgHeight = height || Math.round((Number(imgWidth) * aspectH) / aspectW);

  // Combine styles with aspect-ratio for CLS prevention
  const combinedStyle: React.CSSProperties = {
    ...style,
    aspectRatio: defaultAspectRatio,
  };

  if (didError) {
    return (
      <div
        className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
        style={combinedStyle}
      >
        <img 
          src={localPlaceholder} 
          alt={alt || 'Placeholder'} 
          className="w-full h-full object-cover"
          {...rest} 
        />
      </div>
    );
  }

  return (
    <div className="relative" style={{ aspectRatio: defaultAspectRatio }}>
      {/* Local SVG placeholder - instant display, no network request */}
      {!isLoaded && (
        <img 
          src={localPlaceholder}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ aspectRatio: defaultAspectRatio }}
        />
      )}
      <img 
        src={optimizedSrc} 
        alt={alt} 
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
        style={combinedStyle} 
        loading={loadingStrategy}
        decoding="async"
        fetchPriority={priority ? 'high' : undefined}
        width={imgWidth}
        height={imgHeight}
        onLoad={handleLoad}
        onError={handleError}
        {...rest} 
      />
    </div>
  );
}

import PropTypes from 'prop-types'

/**
 * A purple-themed loading spinner component
 */
export function LoadingSpinner({ size = "md", className = "" }) {
  const sizeClasses = {
    sm: "w-6 h-6 border-2",
    md: "w-10 h-10 border-3",
    lg: "w-16 h-16 border-4",
  }
  
  const spinnerSize = sizeClasses[size] || sizeClasses.md
  
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${spinnerSize} rounded-full border-primary-300 border-t-accent-500 animate-spin`} 
           role="status" aria-label="Loading">
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  )
}

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
}

/**
 * Default export is a full-page loading screen with purple gradient background
 */
export default function LoadingScreen({ message = "Loading..." }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary-800 to-primary-950 text-white z-50">
      <LoadingSpinner size="lg" className="mb-4" />
      <p className="text-lg font-medium">{message}</p>
    </div>
  )
}

LoadingScreen.propTypes = {
  message: PropTypes.string,
}

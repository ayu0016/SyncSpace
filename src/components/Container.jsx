function Container({ children, className = "" }) {
  return (
    <div className={`w-full max-w-105 mx-auto px-6 ${className}`}>
      {children}
    </div>
  )
}

export default Container

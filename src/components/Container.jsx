import React from 'react'

function Container({ children, childern, className = "" }) {
  return (
    <div className={`w-full max-w-105 mx-auto px-6 ${className}`}>
      {children || childern}
    </div>
  )
}

export default Container
export { Container as Contatiner }

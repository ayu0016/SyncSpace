import React from 'react'

function Contatiner({childern,className}) {
  return (
    <div 
          className={`w-full max-w-105 mx-auto px-6 ${className}`}
    >{childern}</div>
  )
}

export default Contatiner
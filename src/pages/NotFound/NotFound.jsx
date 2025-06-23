import React from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/common/Button/Button'
import './NotFound.css'

export default function NotFound() {
  return (
    <div className='notfound-container'>
      <p>404 NotFound</p>
      <Button>
        <Link to="/">Ir a Inicio</Link>
      </Button>
    </div>
  )
}

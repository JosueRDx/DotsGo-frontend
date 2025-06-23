import React from 'react'
import styles from './GameButton.module.css'

export default function GameButton({ onClick, children }) {
  return (
    <button onClick={onClick} className={styles.submitButton}>
      {children}
    </button>
  )
}

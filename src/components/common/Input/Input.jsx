import React from "react";
import styles from "./Input.module.css";
import GameButton from "../Button/GameButton";

export default function Input({ placeholder, buttonText, value, onChange, onSubmit }) {
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      onSubmit();
    }
  };

  return (
    <div className={styles.inputContainer}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        className={styles.customInput}
      />
      <GameButton onClick={onSubmit}>{buttonText}</GameButton>
    </div>
  );
}

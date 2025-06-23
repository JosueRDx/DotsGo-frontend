import React, { useState, useEffect } from "react";
import styles from "./ListQuestions.module.css";

// Importamos la URL base desde la variable de entorno
const API_URL = import.meta.env.VITE_BACKEND_URL || '';

export default function ListQuestions({ onSelectQuestions }) {
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/questions`)
      .then((res) => {
        if (!res.ok) {
          console.error("Respuesta del servidor no fue OK:", res);
          throw new Error('La respuesta de la red no fue exitosa');
        }
        return res.json();
      })
      .then((data) => {
        console.log("Preguntas recibidas del backend:", data); 
        setQuestions(data);
      })
      .catch((err) => console.error("Error fetching questions:", err));
  }, []);

  const toggleQuestionSelection = (questionId) => {
    setSelectedQuestions((prevSelected) =>
      prevSelected.includes(questionId)
        ? prevSelected.filter((id) => id !== questionId)
        : [...prevSelected, questionId]
    );
  };

  useEffect(() => {
    onSelectQuestions(selectedQuestions);
  }, [selectedQuestions, onSelectQuestions]);

  return (
    <div className={styles.questionsGrid}>
      {questions.map((question) => (
        <div
          key={question._id}
          className={`${styles.questionCard} ${
            selectedQuestions.includes(question._id) ? styles.questionCardSelected : ""
          }`}
          onClick={() => toggleQuestionSelection(question._id)}
        >
          <h4>{question.title}</h4>
        </div>
      ))}
    </div>
  );
}

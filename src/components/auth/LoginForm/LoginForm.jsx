import React from 'react';
import styles from "./LoginForm.module.css";

export default function LoginForm() {
  return (
    <div className={styles.contenedorFormulario}>
      <form>
        <h2 className={styles.formularioTitulo}>Iniciar Sesion</h2>
        <label className={styles.formularioLabel}>Nombre De Usuario:</label>
        <input
          className={styles.formularioInput}
          type="text"
          placeholder="Ingresa tu usuario"
        />
        <label className={styles.formularioLabel}>Contraseña:</label>
        <input
          className={styles.formularioInput}
          type="password"
          placeholder="Ingresa tu contraseña"
        />
        <button className={styles.formularioBoton} type="submit">
          Iniciar Sesion
        </button>
      </form>
    </div>
  );
}

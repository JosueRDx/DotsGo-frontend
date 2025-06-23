
import React from 'react';
import styles from "./RegisterForm.module.css";

export default function RegisterForm() {
  return (
    <div className={styles.contenedorRegistro}>
      <form className={styles.formularioRegistro}>
        <h2 className={styles.tituloRegistro}>Crear Cuenta</h2>

        <label className={styles.labelRegistro}>Nombre De Usuario:</label>
        <input
          className={styles.inputRegistro}
          type="text"
          placeholder="Ingresa tu usuario"
        />

        <label className={styles.labelRegistro}>Contraseña:</label>
        <input
          className={styles.inputRegistro}
          type="password"
          placeholder="Ingresa tu contraseña"
        />

        <label className={styles.labelRegistro}>Confirmar Contraseña:</label>
        <input
          className={styles.inputRegistro}
          type="password"
          placeholder="Confirma tu contraseña"
        />

        <button className={styles.botonRegistro} type="submit">
          Crear Usuario
        </button>
      </form>
    </div>
  );
}


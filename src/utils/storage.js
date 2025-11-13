/**
 * Wrapper seguro para localStorage con manejo de errores
 * Protege contra fallos en modo incógnito, storage lleno, etc.
 */

 // Verifica si localStorage está disponible
 
const isLocalStorageAvailable = () => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};


 // Obtiene un item de localStorage de forma segura

export const getItem = (key, defaultValue = null) => {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage no disponible, retornando valor por defecto');
    return defaultValue;
  }

  try {
    const item = localStorage.getItem(key);
    return item !== null ? item : defaultValue;
  } catch (error) {
    console.error(`Error al leer '${key}' de localStorage:`, error);
    return defaultValue;
  }
};

 // Obtiene y parsea un objeto JSON de localStorage

export const getJSON = (key, defaultValue = null) => {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage no disponible, retornando valor por defecto');
    return defaultValue;
  }

  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error al parsear '${key}' de localStorage:`, error);
    return defaultValue;
  }
};

// Guarda un item en localStorage de forma segura

export const setItem = (key, value) => {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage no disponible, no se puede guardar');
    return false;
  }

  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.error('localStorage lleno. Considera limpiar datos antiguos.');
    } else {
      console.error(`Error al guardar '${key}' en localStorage:`, error);
    }
    return false;
  }
};

// Guarda un objeto como JSON en localStorage

export const setJSON = (key, value) => {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage no disponible, no se puede guardar');
    return false;
  }

  try {
    const jsonString = JSON.stringify(value);
    localStorage.setItem(key, jsonString);
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.error('localStorage lleno. Considera limpiar datos antiguos.');
    } else {
      console.error(`Error al guardar '${key}' en localStorage:`, error);
    }
    return false;
  }
};

// Elimina un item de localStorage de forma segura
export const removeItem = (key) => {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage no disponible');
    return false;
  }

  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error al eliminar '${key}' de localStorage:`, error);
    return false;
  }
};

// Limpia todos los items de localStorage de forma segura

export const clear = () => {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage no disponible');
    return false;
  }

  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error al limpiar localStorage:', error);
    return false;
  }
};

// Elimina múltiples items de localStorage
export const removeItems = (keys) => {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage no disponible');
    return false;
  }

  try {
    keys.forEach(key => localStorage.removeItem(key));
    return true;
  } catch (error) {
    console.error('Error al eliminar múltiples items de localStorage:', error);
    return false;
  }
};

/**
 * Objeto con métodos compatibles con localStorage nativo
 * para reemplazo directo en el código existente
 */
export const storage = {
  getItem,
  setItem,
  removeItem,
  clear,
  // Métodos adicionales
  getJSON,
  setJSON,
  removeItems,
  isAvailable: isLocalStorageAvailable
};

export default storage;

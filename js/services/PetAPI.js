/**
 * PetAPI Service
 * Cliente HTTP para todas las operaciones de swipe
 * Maneja autenticación, errores y reintentos
 */

import { API_BASE_URL } from '../config.js';

export class PetAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Obtiene el JWT del localStorage
   * @returns {string | null}
   */
  getToken() {
    return localStorage.getItem('adoptme_token');
  }

  /**
   * Headers estándar con autenticación
   * @returns {Object}
   */
  getHeaders() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  /**
   * Maneja errores de respuesta
   * @param {Response} response
   * @throws {Error}
   */
  async handleError(response) {
    let message = `Error ${response.status}`;

    if (response.status === 401 || response.status === 403) {
      // Redirigir a login (será capturado por componente superior)
      throw new Error('UNAUTHORIZED');
    }

    if (response.status === 400) {
      const data = await response.json().catch(() => ({}));
      message = data.message || 'Solicitud inválida';
    }

    throw new Error(message);
  }

  /**
   * Obtiene un lote de mascotas
   * @param {number} page - Página (0-indexed)
   * @param {number} size - Cantidad por página
   * @returns {Promise<Array>}
   */
  async fetchPets(page = 0, size = 10) {
    try {
      const url = `${this.baseURL}/pets?page=${page}&size=${size}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        await this.handleError(response);
      }

      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('❌ Error al obtener mascotas:', error.message);
      throw error;
    }
  }

  /**
   * Registra un LIKE en el backend
   * @param {number} petId - ID de mascota
   * @returns {Promise<Object>} - Respuesta backend (puede incluir match info)
   */
  async sendLike(petId) {
    try {
      const url = `${this.baseURL}/swipes`;
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ petId, action: 'like' }),
      });

      if (!response.ok) {
        await this.handleError(response);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`❌ Error al registrar like:`, error.message);
      throw error;
    }
  }

  /**
   * Registra un DISLIKE en el backend
   * @param {number} petId - ID de mascota
   * @returns {Promise<Object>} - Respuesta backend
   */
  async sendDislike(petId) {
    try {
      const url = `${this.baseURL}/swipes`;
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ petId, action: 'dislike' }),
      });

      if (!response.ok) {
        await this.handleError(response);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`❌ Error al registrar dislike:`, error.message);
      throw error;
    }
  }
}

// Singleton
export const petAPI = new PetAPI();

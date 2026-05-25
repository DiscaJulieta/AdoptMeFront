/**
 * PetAPI Service
 * Cliente HTTP para todas las operaciones de swipe
 * Maneja autenticación, errores y reintentos
 */

import { API_BASE_URL } from '../config.js';

function buildAuthHeader(token) {
  if (!token || typeof token !== 'string') return null;
  const normalized = token.replace(/^Bearer\s+/i, '').trim();
  if (!normalized) return null;
  return `Bearer ${normalized}`;
}

async function extractErrorMessage(response, fallbackMessage) {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const data = await response.json().catch(() => ({}));
    return data.message || data.error || fallbackMessage;
  }

  const text = await response.text().catch(() => '');
  return text || fallbackMessage;
}

function normalizeNetworkError(error) {
  if (error?.status !== undefined) {
    return error;
  }

  if (error instanceof TypeError) {
    const networkError = new Error('No se pudo conectar con el servidor. Revisa que el backend este activo.');
    networkError.status = 0;
    networkError.code = 'NETWORK_ERROR';
    return networkError;
  }

  return error;
}

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
    const authHeader = buildAuthHeader(token);

    return {
      'Content-Type': 'application/json',
      ...(authHeader && { Authorization: authHeader }),
    };
  }

  /**
   * Maneja errores de respuesta
   * @param {Response} response
   * @throws {Error}
   */
  async handleError(response) {
    const fallbackMessage = `Error ${response.status}`;
    const message = await extractErrorMessage(response, fallbackMessage);

    if (response.status === 401) {
      const unauthorizedError = new Error('UNAUTHORIZED');
      unauthorizedError.status = 401;
      throw unauthorizedError;
    }

    if (response.status === 403) {
      const forbiddenError = new Error(message || 'FORBIDDEN');
      forbiddenError.status = 403;
      throw forbiddenError;
    }

    const genericError = new Error(message || fallbackMessage);
    genericError.status = response.status;
    throw genericError;
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
      const normalizedError = normalizeNetworkError(error);
      console.error('❌ Error al obtener mascotas:', normalizedError.message);
      throw normalizedError;
    }
  }

  /**
   * Registra un LIKE en el backend
   * @param {number} petId - ID de mascota
   * @returns {Promise<Object>} - Respuesta backend (puede incluir match info)
   */
  async sendLike(petId) {
    try {
      const url = `${this.baseURL}/swipes/like`;
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ petId }),
      });

      if (!response.ok) {
        await this.handleError(response);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      const normalizedError = normalizeNetworkError(error);
      console.error(`❌ Error al registrar like:`, normalizedError.message);
      throw normalizedError;
    }
  }

  /**
   * Registra un DISLIKE en el backend
   * @param {number} petId - ID de mascota
   * @returns {Promise<Object>} - Respuesta backend
   */
  async sendDislike(petId) {
    try {
      const url = `${this.baseURL}/swipes/dislike`;
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ petId }),
      });

      if (!response.ok) {
        await this.handleError(response);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      const normalizedError = normalizeNetworkError(error);
      console.error(`❌ Error al registrar dislike:`, normalizedError.message);
      throw normalizedError;
    }
  }
}

// Singleton
export const petAPI = new PetAPI();

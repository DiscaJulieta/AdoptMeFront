/**
 * SwipeContainer Component
 * Gestiona el stack de tarjetas, renderización, gestos y API
 * Fase 2: Integración con API + Gesture Handler
 */

import { SwipeCard } from './SwipeCard.js';
import { SwipeGestureHandler } from '../services/SwipeGestureHandler.js';
import { petAPI } from '../services/PetAPI.js';

export class SwipeContainer {
  constructor(containerId, petsList = []) {
    this.container = document.getElementById(containerId);
    this.petsList = petsList;
    this.cards = [];
    this.currentIndex = 0;
    this.isProcessing = false; // Flag para evitar doble-click
    this.page = 0; // Para paginación API

    if (!this.container) {
      throw new Error(`Container with id "${containerId}" not found`);
    }

    // Gesture handler
    this.gestureHandler = new SwipeGestureHandler(this.container);
    this.setupSwipeListener();
  }

  /**
   * Escucha eventos de swipe del gesture handler
   */
  setupSwipeListener() {
    this.container.addEventListener('swipe', (e) => {
      const direction = e.detail.direction;
      if (direction === 'swiperight') {
        this.handleSwipeRight();
      } else if (direction === 'swipeleft') {
        this.handleSwipeLeft();
      }
    });
  }

  /**
   * Renderiza el stack de tarjetas
   * Muestra 3 tarjetas: la actual al frente y 2 de fondo ligeramente rotadas
   */
  render() {
    // Limpiar contenedor
    this.container.innerHTML = '';
    this.cards = [];

    // Mostrar máximo 3 tarjetas (actual + 2 de fondo para efecto stack)
    const visibleCount = Math.min(3, this.petsList.length - this.currentIndex);

    for (let i = 0; i < visibleCount; i++) {
      const petData = this.petsList[this.currentIndex + i];
      const card = new SwipeCard(petData);
      const cardElement = card.getElement();

      // Stack effect: las tarjetas de atrás se mueven arriba y se rotan ligeramente
      if (i === 0) {
        // Tarjeta frontal - sin transformación
        cardElement.style.zIndex = 100 + i;
      } else {
        // Tarjetas de fondo - ligeramente más arriba y rotadas
        const offsetY = i * 8; // Píxeles hacia arriba
        const rotation = i * 2; // Rotación leve
        cardElement.style.zIndex = 100 - i;
        cardElement.style.transform = `translateY(${offsetY}px) rotateZ(${rotation}deg) scale(${1 - i * 0.02})`;
      }

      this.container.appendChild(cardElement);
      this.cards.push(card);
    }

    // Si no hay más mascotas
    if (this.petsList.length === 0 || this.currentIndex >= this.petsList.length) {
      this.showEmptyState();
    }

    // Reactivar gesture handler después de renderizar
    this.gestureHandler = new SwipeGestureHandler(this.container);
    this.setupSwipeListener();
  }

  /**
   * Muestra estado vacío con opción de refresh
   */
  showEmptyState() {
    this.container.innerHTML = `
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <div class="text-6xl mb-4">🎉</div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">Sin más mascotas</h3>
        <p class="text-gray-600 text-center px-4 mb-6">
          Ya revisaste todas las mascotas. ¡Vuelve más tarde!
        </p>
        <button id="refresh-btn" class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
          Recargar
        </button>
      </div>
    `;

    // Listener para refresh
    document.getElementById('refresh-btn')?.addEventListener('click', () => {
      this.reset();
      this.loadMorePets();
    });
  }

  /**
   * Carga más mascotas de la API
   */
  async loadMorePets() {
    try {
      console.log(`📡 Obteniendo mascotas de la API (página ${this.page})...`);
      const newPets = await petAPI.fetchPets(this.page, 10);

      if (newPets.length === 0) {
        console.warn('⚠️ API retornó lista vacía');
        if (this.petsList.length === 0) {
          // No hay ninguna mascota
          this.render();
        }
        return false;
      }

      this.petsList.push(...newPets);
      this.page++;
      console.log(`✅ Total mascotas en cache: ${this.petsList.length}`);
      return true;
    } catch (error) {
      if (error.message === 'UNAUTHORIZED') {
        console.error('🔐 Token expirado o inválido');
        window.dispatchEvent(new CustomEvent('unauthorized'));
      } else {
        console.error('❌ Error cargando mascotas:', error.message);
      }
      return false;
    }
  }

  /**
   * Manejador para swipe a la DERECHA (Like)
   */
  async handleSwipeRight() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    const pet = this.getCurrentPet();
    if (!pet) {
      this.isProcessing = false;
      return;
    }

    try {
      // Animar salida a la derecha
      await this.animateCardExit('right');

      // Registrar like en API
      const result = await petAPI.sendLike(pet.id);

      // Verificar si es un match
      if (result.isMatch) {
        this.showMatchNotification(pet, result);
      }

      // Avanzar al siguiente
      this.nextPet();
      this.checkAndLoadMore();
    } catch (error) {
      console.error('❌ Error en like:', error.message);
      if (error.message === 'UNAUTHORIZED') {
        window.dispatchEvent(new CustomEvent('unauthorized'));
      }
      // Resetear card en error
      this.render();
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Manejador para swipe a la IZQUIERDA (Dislike)
   */
  async handleSwipeLeft() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    const pet = this.getCurrentPet();
    if (!pet) {
      this.isProcessing = false;
      return;
    }

    try {
      // Animar salida a la izquierda
      await this.animateCardExit('left');

      // Registrar dislike en API
      await petAPI.sendDislike(pet.id);

      // Avanzar al siguiente
      this.nextPet();
      this.checkAndLoadMore();
    } catch (error) {
      console.error('❌ Error en dislike:', error.message);
      if (error.message === 'UNAUTHORIZED') {
        window.dispatchEvent(new CustomEvent('unauthorized'));
      }
      // Resetear card en error
      this.render();
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Anima la salida de la tarjeta (derecha o izquierda)
   */
  animateCardExit(direction) {
    return new Promise((resolve) => {
      const card = this.container.querySelector('.swipe-card');
      if (!card) {
        resolve();
        return;
      }

      const distance = direction === 'right' ? 800 : -800;
      const angle = direction === 'right' ? 20 : -20;

      card.style.transition = 'all 600ms cubic-bezier(0.4, 0, 0.2, 1)';
      card.style.transform = `translateX(${distance}px) rotateZ(${angle}deg)`;
      card.style.opacity = '0';

      setTimeout(resolve, 600);
    });
  }

  /**
   * Muestra notificación de match
   */
  showMatchNotification(pet, matchData) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]';
    modal.innerHTML = `
      <div class="bg-white rounded-2xl p-8 max-w-sm text-center animate-bounce">
        <div class="text-6xl mb-4">💕</div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">¡Es un match!</h2>
        <p class="text-gray-600 mb-6">
          ¡${pet.name} también te gustó! Puedes empezar a chatear ahora.
        </p>
        <button class="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition mb-2">
          Ir al chat
        </button>
        <button id="close-match" class="w-full px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition">
          Continuar viendo
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#close-match').addEventListener('click', () => {
      modal.remove();
    });
  }

  /**
   * Verifica si necesita cargar más mascotas
   */
  async checkAndLoadMore() {
    // Si quedan pocas mascotas, cargar más
    if (this.getRemainingCount() <= 2) {
      console.log('⏳ Precargando más mascotas...');
      await this.loadMorePets();
    }
  }

  /**
   * Avanza al siguiente índice y re-renderiza
   */
  nextPet() {
    if (this.currentIndex < this.petsList.length) {
      this.currentIndex++;
      this.render();
    }
  }

  /**
   * Reinicia el stack
   */
  reset() {
    this.currentIndex = 0;
    this.petsList = [];
    this.page = 0;
    this.render();
  }

  /**
   * Obtiene la mascota actual
   */
  getCurrentPet() {
    if (this.currentIndex < this.petsList.length) {
      return this.petsList[this.currentIndex];
    }
    return null;
  }

  /**
   * Obtiene todas las mascotas pendientes
   */
  getRemainingPets() {
    return this.petsList.slice(this.currentIndex);
  }

  /**
   * Cuenta de mascotas restantes
   */
  getRemainingCount() {
    return Math.max(0, this.petsList.length - this.currentIndex);
  }
}

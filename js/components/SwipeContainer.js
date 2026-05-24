/**
 * SwipeContainer Component
 * Gestiona el stack de tarjetas, renderización, gestos, API y modales
 * Fase 3: Modal de Match + Empty States
 */

import { SwipeCard } from './SwipeCard.js';
import { SwipeGestureHandler } from '../services/SwipeGestureHandler.js';
import { MatchModal } from './MatchModal.js';
import { EmptyStateScreen } from './EmptyStateScreen.js';
import { petAPI } from '../services/PetAPI.js';

export class SwipeContainer {
  constructor(containerId, petsList = []) {
    this.container = document.getElementById(containerId);
    this.petsList = petsList;
    this.cards = [];
    this.currentIndex = 0;
    this.isProcessing = false; // Flag para evitar doble-click
    this.page = 0; // Para paginación API
    this.isAllowedToLoad = true; // Flag para prevenir carga infinita

    if (!this.container) {
      throw new Error(`Container with id "${containerId}" not found`);
    }

    // Componentes de UI
    this.matchModal = null;
    this.emptyState = null;

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
   * Muestra estado vacío con opciones de acción
   */
  showEmptyState() {
    // Destruir gesture handler
    this.gestureHandler.disable();

    // Limpiar contenedor
    this.container.innerHTML = '';

    // Crear pantalla de estado vacío
    this.emptyState = new EmptyStateScreen();

    this.emptyState
      .on('refresh', () => {
        console.log('🔄 Usuario solicitó recargar...');
        this.reset();
        this.loadMorePets();
      })
      .on('retry', () => {
        console.log('🔄 Usuario solicitó reintentar...');
        this.loadMorePets();
      })
      .showEmpty();

    const element = this.emptyState.getElement();
    if (element) {
      this.container.appendChild(element);
    }
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
        this.showMatchModal(pet, result);
        // NO avanzar inmediatamente, esperar a que el usuario cierre el modal
      } else {
        // Avanzar al siguiente si no hay match
        this.nextPet();
        this.checkAndLoadMore();
      }
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
   * Muestra modal de match (Fase 3: Completo)
   */
  showMatchModal(pet, matchData) {
    // Crear modal
    this.matchModal = new MatchModal(pet, matchData);

    // Configurar callbacks
    this.matchModal
      .on('chat', (petData, data) => {
        console.log('💬 Ir a chat para:', petData.name);
        // Será manejado por Persona D (Chat)
        window.location.href = `/chat/${data.chatId || petData.id}`;
      })
      .on('continue', () => {
        console.log('👉 Continuando con swipe flow...');
        // Avanzar al siguiente
        this.nextPet();
        this.checkAndLoadMore();
      })
      .on('close', () => {
        console.log('❌ Modal cerrado sin acción');
        // Avanzar al siguiente
        this.nextPet();
        this.checkAndLoadMore();
      });

    // Abrir modal
    this.matchModal.open();
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

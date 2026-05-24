/**
 * MatchModal Component
 * Muestra notificación de match cuando ambos usuarios se dan like
 * Fase 3: Lógica completa + interactividad
 */

export class MatchModal {
  constructor(petData, matchData = {}) {
    this.pet = petData;
    this.matchData = matchData;
    this.element = null;
    this.isOpen = false;
    this.callbacks = {
      onChat: null,
      onContinue: null,
      onClose: null,
    };
  }

  /**
   * Configura callbacks
   */
  on(event, callback) {
    if (this.callbacks.hasOwnProperty(`on${event.charAt(0).toUpperCase() + event.slice(1)}`)) {
      this.callbacks[`on${event.charAt(0).toUpperCase() + event.slice(1)}`] = callback;
    }
    return this;
  }

  /**
   * Renderiza el modal
   */
  render() {
    // Backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] transition-opacity duration-300 match-backdrop';
    backdrop.style.animation = 'fadeIn 300ms ease-out';

    // Container del modal
    const modalContainer = document.createElement('div');
    modalContainer.className = 'fixed inset-0 flex items-center justify-center z-[1001] pointer-events-none';

    // Modal content
    const modal = document.createElement('div');
    modal.className = 'bg-white rounded-3xl shadow-2xl max-w-sm w-full mx-4 pointer-events-auto transform transition-all duration-300';
    modal.style.animation = 'scaleIn 400ms cubic-bezier(0.34, 1.56, 0.64, 1)';
    modal.innerHTML = `
      <!-- Confetti effect container -->
      <div class="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
        <div class="confetti-container"></div>
      </div>

      <!-- Modal content -->
      <div class="relative p-8 text-center">
        
        <!-- Header: Match icon -->
        <div class="mb-6 flex justify-center">
          <div class="relative">
            <div class="text-6xl animate-bounce" style="animation-delay: 0s">💕</div>
            <div class="absolute inset-0 text-6xl opacity-0" style="animation: pulse 1.5s ease-in-out infinite">💕</div>
          </div>
        </div>

        <!-- Title -->
        <h2 class="text-3xl font-bold text-gray-900 mb-2">
          ¡Es un match!
        </h2>

        <!-- Subtitle -->
        <p class="text-lg text-gray-600 mb-6">
          A <span class="font-semibold text-blue-600">${this.pet.name}</span> también le gustaste 🎉
        </p>

        <!-- Pet image thumbnail -->
        <div class="mb-6 rounded-2xl overflow-hidden h-48 w-full">
          <img 
            src="${this.pet.image}" 
            alt="${this.pet.name}"
            class="w-full h-full object-cover"
            onerror="this.src='https://via.placeholder.com/300x200?text=Foto+no+disponible'"
          >
        </div>

        <!-- Description -->
        <p class="text-sm text-gray-600 mb-8 italic">
          "¡Empecemos a conocernos! Haz clic en el botón de abajo para iniciar una conversación."
        </p>

        <!-- Action buttons -->
        <div class="space-y-3">
          <!-- Primary: Go to chat -->
          <button 
            id="match-chat-btn"
            class="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
          >
            💬 Ir al Chat
          </button>

          <!-- Secondary: Continue swiping -->
          <button 
            id="match-continue-btn"
            class="w-full py-3 px-4 bg-gray-100 text-gray-900 font-semibold rounded-xl hover:bg-gray-200 transition-all transform hover:scale-105 active:scale-95"
          >
            Continuar viendo mascotas
          </button>
        </div>

        <!-- Close button (X in corner) -->
        <button 
          id="match-close-btn"
          class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>
    `;

    modalContainer.appendChild(modal);

    this.element = document.createElement('div');
    this.element.className = 'match-modal-wrapper';
    this.element.appendChild(backdrop);
    this.element.appendChild(modalContainer);

    this.attachListeners();
    return this.element;
  }

  /**
   * Adjunta listeners a botones
   */
  attachListeners() {
    const chatBtn = this.element.querySelector('#match-chat-btn');
    const continueBtn = this.element.querySelector('#match-continue-btn');
    const closeBtn = this.element.querySelector('#match-close-btn');

    chatBtn?.addEventListener('click', () => {
      console.log('💬 Navegando a chat para:', this.pet.name);
      this.callbacks.onChat?.(this.pet, this.matchData);
      this.close();
    });

    continueBtn?.addEventListener('click', () => {
      console.log('👉 Continuando con mascotas...');
      this.callbacks.onContinue?.();
      this.close();
    });

    closeBtn?.addEventListener('click', () => {
      console.log('❌ Modal cerrado');
      this.callbacks.onClose?.();
      this.close();
    });

    // Cerrar con ESC
    this.handleEsc = (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    };
    document.addEventListener('keydown', this.handleEsc);
  }

  /**
   * Abre el modal
   */
  open() {
    if (!this.element) {
      this.render();
    }

    if (!this.element.parentElement) {
      document.body.appendChild(this.element);
    }

    this.isOpen = true;
    console.log('🎉 Match modal abierto para:', this.pet.name);

    // Trigger confetti (opcional)
    this.triggerConfetti();

    return this;
  }

  /**
   * Cierra el modal
   */
  close() {
    if (!this.isOpen) return;

    const backdrop = this.element?.querySelector('.match-backdrop');
    if (backdrop) {
      backdrop.style.animation = 'fadeOut 300ms ease-out forwards';
    }

    const modal = this.element?.querySelector('.bg-white');
    if (modal) {
      modal.style.animation = 'scaleOut 300ms cubic-bezier(0.4, 0, 1, 0.2) forwards';
    }

    setTimeout(() => {
      this.destroy();
    }, 300);

    this.isOpen = false;
  }

  /**
   * Destruye el modal
   */
  destroy() {
    document.removeEventListener('keydown', this.handleEsc);
    this.element?.remove();
    this.element = null;
    this.isOpen = false;
  }

  /**
   * Efecto confetti simple (CSS-based)
   */
  triggerConfetti() {
    const container = this.element?.querySelector('.confetti-container');
    if (!container) return;

    const confettiPieces = 30;
    for (let i = 0; i < confettiPieces; i++) {
      const piece = document.createElement('div');
      piece.style.position = 'absolute';
      piece.style.width = '10px';
      piece.style.height = '10px';
      piece.style.left = Math.random() * 100 + '%';
      piece.style.top = '-10px';
      piece.style.backgroundColor = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'][Math.floor(Math.random() * 5)];
      piece.style.borderRadius = '50%';
      piece.style.animation = `fall ${1 + Math.random() * 2}s linear forwards`;
      piece.style.opacity = '0.8';
      container.appendChild(piece);
    }
  }

  /**
   * Actualiza los datos de la mascota
   */
  updatePet(petData) {
    this.pet = petData;
    if (this.isOpen) {
      this.close();
      this.render();
      this.open();
    }
    return this;
  }

  /**
   * Verifica si el modal está abierto
   */
  isDisplayed() {
    return this.isOpen;
  }
}

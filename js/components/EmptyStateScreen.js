/**
 * EmptyStateScreen Component
 * Muestra estados cuando no hay más mascotas disponibles
 * Fase 3: Estados completos + acciones
 */

export class EmptyStateScreen {
  constructor() {
    this.element = null;
    this.state = null; // 'empty', 'loading', 'error'
    this.callbacks = {
      onRefresh: null,
      onRetry: null,
      onGoHome: null,
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
   * Estado: Sin más mascotas
   */
  showEmpty() {
    this.state = 'empty';
    this.render();
    return this;
  }

  /**
   * Estado: Cargando más mascotas
   */
  showLoading() {
    this.state = 'loading';
    this.render();
    return this;
  }

  /**
   * Estado: Error al cargar
   */
  showError(errorMessage = 'Algo salió mal') {
    this.state = 'error';
    this.errorMessage = errorMessage;
    this.render();
    return this;
  }

  /**
   * Renderiza el estado actual
   */
  render() {
    // Limpiar elemento anterior
    if (this.element) {
      this.element.remove();
    }

    this.element = document.createElement('div');
    this.element.className = 'absolute inset-0 flex flex-col items-center justify-center p-8 animate-fadeIn';

    switch (this.state) {
      case 'empty':
        this.renderEmptyState();
        break;
      case 'loading':
        this.renderLoadingState();
        break;
      case 'error':
        this.renderErrorState();
        break;
      default:
        this.renderEmptyState();
    }

    return this.element;
  }

  /**
   * Render: Estado vacío (sin más mascotas)
   */
  renderEmptyState() {
    this.element.innerHTML = `
      <div class="text-center max-w-sm">
        <!-- Icon -->
        <div class="mb-6">
          <div class="text-7xl mb-4" style="animation: float 3s ease-in-out infinite">🎉</div>
        </div>

        <!-- Title -->
        <h2 class="text-3xl font-bold text-gray-900 mb-3">
          ¡Sin más mascotas!
        </h2>

        <!-- Description -->
        <p class="text-lg text-gray-600 mb-8 leading-relaxed">
          Ya revisaste todas las mascotas disponibles en tu zona. 
          <br>
          <span class="font-semibold">¡Vuelve más tarde para ver nuevas mascotas!</span>
        </p>

        <!-- Suggestion box -->
        <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 rounded text-left">
          <p class="text-sm text-blue-900">
            💡 <span class="font-semibold">Tip:</span> Mientras tanto, puedes explorar mascotas que ya likeaste o revisar tus matches.
          </p>
        </div>

        <!-- Action buttons -->
        <div class="space-y-3">
          <!-- Primary: Refresh -->
          <button 
            id="empty-refresh-btn"
            class="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
          >
            🔄 Recargar Mascotas
          </button>

          <!-- Secondary: Go to matches -->
          <button 
            id="empty-matches-btn"
            class="w-full py-3 px-6 bg-gray-100 text-gray-900 font-semibold rounded-xl hover:bg-gray-200 transition-all transform hover:scale-105 active:scale-95"
          >
            💕 Ver mis Matches
          </button>

          <!-- Tertiary: Go home -->
          <button 
            id="empty-home-btn"
            class="w-full py-3 px-6 bg-gray-50 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition text-sm"
          >
            🏠 Ir a inicio
          </button>
        </div>
      </div>
    `;

    this.attachListeners();
  }

  /**
   * Render: Estado cargando
   */
  renderLoadingState() {
    this.element.innerHTML = `
      <div class="text-center">
        <!-- Spinner -->
        <div class="mb-6">
          <div class="inline-block">
            <div class="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        </div>

        <!-- Message -->
        <h3 class="text-xl font-semibold text-gray-900 mb-2">
          Buscando mascotas...
        </h3>
        <p class="text-gray-600">
          Estamos cargando nuevas mascotas para ti.
        </p>
      </div>
    `;
  }

  /**
   * Render: Estado error
   */
  renderErrorState() {
    this.element.innerHTML = `
      <div class="text-center max-w-sm">
        <!-- Icon -->
        <div class="mb-6 text-6xl">
          ⚠️
        </div>

        <!-- Title -->
        <h2 class="text-2xl font-bold text-gray-900 mb-2">
          Oops, algo salió mal
        </h2>

        <!-- Error message -->
        <p class="text-gray-600 mb-6">
          ${this.errorMessage || 'No pudimos cargar las mascotas. Por favor, intenta de nuevo.'}
        </p>

        <!-- Troubleshooting tips -->
        <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-8 rounded text-left text-sm">
          <p class="text-yellow-900">
            <span class="font-semibold">Intenta:</span>
            <ul class="list-disc list-inside mt-2 space-y-1">
              <li>Recarga la página</li>
              <li>Verifica tu conexión a internet</li>
              <li>Cierra la app y vuelve a abrir</li>
            </ul>
          </p>
        </div>

        <!-- Action buttons -->
        <div class="space-y-3">
          <!-- Primary: Retry -->
          <button 
            id="empty-retry-btn"
            class="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
          >
            🔄 Reintentar
          </button>

          <!-- Secondary: Go home -->
          <button 
            id="empty-home-btn"
            class="w-full py-3 px-6 bg-gray-100 text-gray-900 font-semibold rounded-xl hover:bg-gray-200 transition-all transform hover:scale-105 active:scale-95"
          >
            🏠 Volver a inicio
          </button>
        </div>
      </div>
    `;

    this.attachListeners();
  }

  /**
   * Adjunta listeners
   */
  attachListeners() {
    const refreshBtn = this.element?.querySelector('#empty-refresh-btn');
    const retryBtn = this.element?.querySelector('#empty-retry-btn');
    const matchesBtn = this.element?.querySelector('#empty-matches-btn');
    const homeBtn = this.element?.querySelector('#empty-home-btn');

    refreshBtn?.addEventListener('click', () => {
      this.callbacks.onRefresh?.();
    });

    retryBtn?.addEventListener('click', () => {
      this.callbacks.onRetry?.();
    });

    matchesBtn?.addEventListener('click', () => {
      window.location.href = '/matches'; // Será Persona D
    });

    homeBtn?.addEventListener('click', () => {
      window.location.href = '/';
    });
  }

  /**
   * Obtiene el elemento DOM
   */
  getElement() {
    return this.element;
  }

  /**
   * Destruye el estado
   */
  destroy() {
    this.element?.remove();
    this.element = null;
  }
}

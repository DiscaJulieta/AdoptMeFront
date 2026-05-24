/**
 * SwipeGestureHandler
 * Detecta gestos de swipe: mouse (left/right drag) y touch (swipe)
 * Dispara eventos customizados para que SwipeContainer los maneje
 */

export class SwipeGestureHandler {
  constructor(element) {
    this.element = element;
    this.startX = 0;
    this.startY = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.isActive = false;

    // Config
    this.swipeThreshold = 50; // Píxeles mínimos para registrar swipe
    this.velocityThreshold = 0.5; // Velocidad mínima (px/ms)

    this.setupListeners();
  }

  /**
   * Configura listeners de mouse y touch
   */
  setupListeners() {
    // Mouse events
    this.element.addEventListener('mousedown', (e) => this.handlePointerStart(e));
    document.addEventListener('mousemove', (e) => this.handlePointerMove(e));
    document.addEventListener('mouseup', (e) => this.handlePointerEnd(e));

    // Touch events
    this.element.addEventListener('touchstart', (e) => this.handlePointerStart(e), false);
    document.addEventListener('touchmove', (e) => this.handlePointerMove(e), false);
    document.addEventListener('touchend', (e) => this.handlePointerEnd(e), false);

    // Prevenir selección durante drag
    this.element.addEventListener('selectstart', (e) => {
      if (this.isActive) e.preventDefault();
    });
  }

  /**
   * Inicio de gesto (mousedown o touchstart)
   */
  handlePointerStart(event) {
    // Solo detectar en la tarjeta frontal
    const card = this.element.querySelector('.swipe-card');
    if (!card) return;

    const touch = event.touches?.[0] || event;
    this.startX = touch.clientX;
    this.startY = touch.clientY;
    this.currentX = this.startX;
    this.currentY = this.startY;
    this.isActive = true;
    this.startTime = Date.now();

    // Cambiar cursor visual
    card.style.cursor = 'grabbing';
    card.style.transition = 'none';
  }

  /**
   * Movimiento durante gesto (mousemove o touchmove)
   */
  handlePointerMove(event) {
    if (!this.isActive) return;

    const card = this.element.querySelector('.swipe-card');
    if (!card) return;

    // Prevenir scroll vertical si movemos horizontalmente
    const touch = event.touches?.[0] || event;
    this.currentX = touch.clientX;
    this.currentY = touch.clientY;

    const deltaX = this.currentX - this.startX;
    const deltaY = this.currentY - this.startY;

    // Si el movimiento vertical > horizontal, es scroll (ignorar)
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      return;
    }

    // Aplicar transformación en tiempo real
    const angle = (deltaX / 200) * 15; // Rotación máxima 15°
    const opacity = Math.max(0.5, 1 - Math.abs(deltaX) / 400);

    card.style.transform = `translateX(${deltaX}px) rotateZ(${angle}deg)`;
    card.style.opacity = opacity;

    // Cambiar color de fondo según dirección
    if (deltaX > 0) {
      // Swipe derecha (Like) - verde
      card.style.backgroundColor = `rgba(34, 197, 94, ${0.1 * (deltaX / this.swipeThreshold)})`;
    } else {
      // Swipe izquierda (Dislike) - rojo
      card.style.backgroundColor = `rgba(239, 68, 68, ${0.1 * (Math.abs(deltaX) / this.swipeThreshold)})`;
    }
  }

  /**
   * Fin de gesto (mouseup o touchend)
   */
  handlePointerEnd(event) {
    if (!this.isActive) return;

    const card = this.element.querySelector('.swipe-card');
    if (!card) return;

    this.isActive = false;
    const deltaX = this.currentX - this.startX;
    const duration = Date.now() - this.startTime;
    const velocity = Math.abs(deltaX) / (duration || 1);

    // Resetear estilos
    card.style.cursor = 'grab';
    card.style.backgroundColor = '';

    // Determinar si fue un swipe válido
    const swipeThresholdMet = Math.abs(deltaX) > this.swipeThreshold;
    const velocityMet = velocity > this.velocityThreshold;
    const isSwipe = swipeThresholdMet || velocityMet;

    if (isSwipe) {
      if (deltaX > 0) {
        this.dispatchSwipeEvent('swiperight', deltaX, velocity);
      } else {
        this.dispatchSwipeEvent('swipeleft', Math.abs(deltaX), velocity);
      }
    } else {
      // Swipe inválido - resetear animación
      card.style.transition = `transform 300ms cubic-bezier(0.4, 0, 0.2, 1)`;
      card.style.transform = '';
      card.style.opacity = 1;
    }
  }

  /**
   * Dispara evento customizado
   */
  dispatchSwipeEvent(direction, distance, velocity) {
    const event = new CustomEvent('swipe', {
      detail: {
        direction, // 'swiperight' o 'swipeleft'
        distance,
        velocity,
        timestamp: Date.now(),
      },
    });
    this.element.dispatchEvent(event);
  }

  /**
   * Desabilita la detección de gestos
   */
  disable() {
    this.isActive = false;
  }

  /**
   * Habilita la detección de gestos
   */
  enable() {
    // Listeners ya están activos
  }
}

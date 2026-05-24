/**
 * SwipeCard Component
 * Renderiza una tarjeta individual de mascota
 * Estructura estática para Fase 1
 */

export class SwipeCard {
  constructor(petData) {
    this.pet = petData;
    this.element = null;
  }

  /**
   * Crea el elemento DOM de la tarjeta
   */
  render() {
    const card = document.createElement('div');
    card.className = 'swipe-card absolute inset-0 rounded-2xl overflow-hidden bg-white shadow-2xl cursor-grab active:cursor-grabbing transition-transform duration-300';
    card.dataset.petId = this.pet.id;

    card.innerHTML = `
      <!-- Imagen -->
      <div class="relative w-full h-2/3 bg-gray-200 overflow-hidden group">
        <img 
          src="${this.pet.image}" 
          alt="${this.pet.name}"
          class="w-full h-full object-cover"
          onerror="this.src='https://via.placeholder.com/400x500?text=Foto+no+disponible'"
        >
        
        <!-- Overlay degradado (texto legible abajo) -->
        <div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20"></div>

        <!-- Badge de género en esquina superior derecha -->
        <div class="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur text-xs font-semibold flex items-center gap-1">
          ${this.pet.gender === 'Macho' ? '♂️' : '♀️'}
          <span>${this.pet.gender}</span>
        </div>

        <!-- Badge de ubicación en esquina inferior izquierda -->
        <div class="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur text-xs font-medium flex items-center gap-1">
          📍 ${this.pet.location}
        </div>
      </div>

      <!-- Información (1/3 inferior) -->
      <div class="h-1/3 p-4 flex flex-col justify-between">
        
        <!-- Nombre, edad y raza -->
        <div>
          <div class="flex items-baseline gap-2 mb-1">
            <h2 class="text-2xl font-bold text-gray-900">${this.pet.name}</h2>
            <span class="text-lg text-gray-500">${this.pet.age} años</span>
          </div>
          <p class="text-sm text-gray-600">${this.pet.breed}</p>
        </div>

        <!-- Tags/badges -->
        <div class="flex flex-wrap gap-1">
          ${this.pet.tags.map(tag => `
            <span class="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
              ${tag}
            </span>
          `).join('')}
        </div>
      </div>
    `;

    this.element = card;
    return card;
  }

  /**
   * Obtiene el elemento DOM
   */
  getElement() {
    return this.element || this.render();
  }

  /**
   * Destruye la tarjeta
   */
  destroy() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
}

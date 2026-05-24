# Fase 3: Arquitectura - Modal de Match + Empty States

## 🏗️ Estructura de Componentes (Fase 3)

```
AdoptMe Swipe Motor v3.0
├── Components
│   ├── SwipeCard.js              ← Tarjeta individual (sin cambios)
│   ├── MatchModal.js             ✨ NUEVO: Modal de match completo
│   ├── EmptyStateScreen.js       ✨ NUEVO: Estados vacíos y errores
│   └── SwipeContainer.js         ← ACTUALIZADO: Integración de modales
│
├── Services
│   ├── SwipeGestureHandler.js    ← (sin cambios)
│   └── PetAPI.js                 ← (sin cambios)
│
└── App
    └── app.js                    ← (sin cambios)
```

## 🎯 Componentes Nuevos

### MatchModal.js (Fase 3 - NUEVO)

**Responsabilidad**: Mostrar modal animado cuando ambos usuarios se dan like.

**API Pública**:
```javascript
const modal = new MatchModal(petData, matchData);

modal
  .on('chat', (pet, data) => { /* navegar a chat */ })
  .on('continue', () => { /* continuar swiping */ })
  .on('close', () => { /* cierre sin acción */ })
  .open();

modal.close();
modal.isDisplayed(); // boolean
```

**Características**:
- ✅ Animación de entrada: `scaleIn` 400ms
- ✅ Animación de salida: `scaleOut` 300ms
- ✅ Backdrop con blur
- ✅ Icono 💕 animado (bounce + pulse)
- ✅ Confetti effect (30 piezas, colores variados)
- ✅ Imagen thumbnail de mascota
- ✅ 3 botones: Chat, Continuar, X (cerrar)
- ✅ Cierre con ESC
- ✅ Callbacks personalizables

**Flujo**:
```
1. Crear modal → new MatchModal(pet, data)
2. Configurar callbacks → .on('event', fn)
3. Abrir → .open()
4. Usuario interactúa → callback se dispara
5. Modal cierra automáticamente → 300ms
```

### EmptyStateScreen.js (Fase 3 - NUEVO)

**Responsabilidad**: Mostrar estados cuando no hay mascotas disponibles o hay errores.

**API Pública**:
```javascript
const emptyState = new EmptyStateScreen();

emptyState
  .on('refresh', () => { /* recargar mascotas */ })
  .on('retry', () => { /* reintentar tras error */ });

emptyState.showEmpty();   // Sin más mascotas
emptyState.showLoading(); // Cargando...
emptyState.showError('Mensaje de error');

emptyState.getElement(); // Obtener DOM
emptyState.destroy();    // Limpiar
```

**Estados**:

#### 1. Empty State (sin más mascotas)
```
Icon: 🎉 (animación float)
Title: ¡Sin más mascotas!
Description: Tips útiles
Buttons:
  - 🔄 Recargar Mascotas
  - 💕 Ver mis Matches
  - 🏠 Ir a inicio
```

#### 2. Loading State
```
Icon: Spinner animado
Title: Buscando mascotas...
Description: Estamos cargando...
```

#### 3. Error State
```
Icon: ⚠️
Title: Oops, algo salió mal
Description: Mensaje de error + troubleshooting tips
Buttons:
  - 🔄 Reintentar
  - 🏠 Volver a inicio
```

## 🔄 Flujo de Interacción

### Flujo 1: Like → Match
```
1. Usuario swipea derecha
   ↓
2. SwipeGestureHandler.handlePointerEnd('swiperight')
   ↓
3. SwipeContainer.handleSwipeRight()
   - animateCardExit('right') ← 600ms
   ↓
4. petAPI.sendLike(petId)
   ↓
5. Backend responde: {isMatch: true, ...}
   ↓
6. showMatchModal(pet, data)
   - Crear MatchModal
   - .on('chat', ...) → redirige /chat/{id}
   - .on('continue', ...) → nextPet() + render()
   - .open() ← 400ms scaleIn
   ↓
7. Usuario interactúa → Callback dispara
   ↓
8. Modal cierra (300ms scaleOut)
   ↓
9. Siguiente card con animación (300ms stackEnter)
```

### Flujo 2: Like → No Match
```
1-4. (igual que arriba)
   ↓
5. Backend responde: {success: true, isMatch: false}
   ↓
6. NO mostrar modal
   ↓
7. nextPet() inmediatamente
   ↓
8. checkAndLoadMore()
```

### Flujo 3: Agotarse Mascotas
```
1. Usuario swipea última mascota
   ↓
2. nextPet() → currentIndex excede petsList.length
   ↓
3. checkAndLoadMore()
   - petAPI.fetchPets(page++) → retorna []
   ↓
4. showEmptyState()
   - EmptyStateScreen.showEmpty()
   - Render botones de acción
   ↓
5. Usuario elige:
   - Recargar → reset() + loadMorePets()
   - Ver matches → window.location.href = '/matches'
   - Ir a inicio → window.location.href = '/'
```

## 🎨 Animaciones Nuevas (Fase 3)

### Match Modal Enter
```css
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.85) translateY(20px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
/* Duration: 400ms, easing: cubic-bezier(0.34, 1.56, 0.64, 1) */
/* Bouncy easing para feel de celebración */
```

### Match Modal Exit
```css
@keyframes scaleOut {
  from { opacity: 1; transform: scale(1) translateY(0); }
  to   { opacity: 0; transform: scale(0.85) translateY(-20px); }
}
/* Duration: 300ms */
```

### Confetti Fall
```css
@keyframes fall {
  to {
    opacity: 0;
    transform: translateY(100vh) rotate(720deg);
  }
}
/* Duration: 1-3s randomizado */
```

### Float (Empty State Icon)
```css
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-20px); }
}
/* Duration: 3s, continuous */
```

### Timeline de Animaciones Combinadas

```
User swipes left/right (0ms)
  ↓ 600ms
Card exit animation completa
  ↓ 0ms (inmediatamente)
Match modal comienza scaleIn
  ↓ 400ms
Match modal completamente visible
  [Usuario interactúa con modal]
  ↓ [onClick]
Modal comienza scaleOut
  ↓ 300ms
Modal destruido, next card stackEnter
  ↓ 300ms
Stack renderizado, listo para siguiente

TOTAL: 600 + 400 + 300 + 300 = 1600ms (en caso de match)
       600 + 300 = 900ms (sin match)
```

## 📊 Estado Interno

### SwipeContainer (Fase 3)
```javascript
{
  container: HTMLElement,
  petsList: Pet[],
  cards: SwipeCard[],
  currentIndex: number,
  isProcessing: boolean,
  page: number,
  isAllowedToLoad: boolean,
  
  matchModal: MatchModal | null,     // ✨ NUEVO
  emptyState: EmptyStateScreen | null, // ✨ NUEVO
  
  gestureHandler: SwipeGestureHandler
}
```

### MatchModal State
```javascript
{
  pet: Pet,
  matchData: Object,
  element: HTMLElement | null,
  isOpen: boolean,
  callbacks: {
    onChat: Function,
    onContinue: Function,
    onClose: Function
  },
  handleEsc: Function (para listener)
}
```

### EmptyStateScreen State
```javascript
{
  element: HTMLElement | null,
  state: 'empty' | 'loading' | 'error' | null,
  errorMessage: string,
  callbacks: {
    onRefresh: Function,
    onRetry: Function,
    onGoHome: Function
  }
}
```

## 🔌 Integration Points

### MatchModal ← SwipeContainer
```javascript
showMatchModal(pet, matchData) {
  this.matchModal = new MatchModal(pet, matchData);
  
  this.matchModal
    .on('chat', (pet, data) => {
      // Será manejado por Persona D (Chat)
      window.location.href = `/chat/${data.chatId || pet.id}`;
    })
    .on('continue', () => {
      this.nextPet();
      this.checkAndLoadMore();
    })
    .on('close', () => {
      this.nextPet();
      this.checkAndLoadMore();
    });
  
  this.matchModal.open();
}
```

### EmptyStateScreen ← SwipeContainer
```javascript
showEmptyState() {
  this.emptyState = new EmptyStateScreen();
  
  this.emptyState
    .on('refresh', () => {
      this.reset();
      this.loadMorePets();
    })
    .on('retry', () => {
      this.loadMorePets();
    });
  
  this.emptyState.showEmpty();
  
  const element = this.emptyState.getElement();
  if (element) {
    this.container.appendChild(element);
  }
}
```

## ⚙️ Z-Index Layer Management

```
Z-Index Stack (bottom to top):

0-99      → Content normal (cards, buttons)
100-109   → Card stack (z-index: 100-99-98)
1000      → Backdrop (match modal)
1001      → Modal content (match modal)
```

## 🛡️ Error Handling (Fase 3)

### Error State Flow
```
API Error → loadMorePets() fails
   ↓
showEmptyState()
   ↓
emptyState.showError("Descripción del error")
   ↓
Usuario puede:
   - Reintentar
   - Ir a inicio
```

### Edge Cases Manejados

1. **Match Modal Ya Abierto + Click Like**: ✅ Bloqueado por `isProcessing`
2. **ESC mientras cargando**: ✅ No cierra (emptyState maneja ESC)
3. **Doble Match seguido**: ✅ Modal anterior se destruye correctamente
4. **Backend 401 en Like**: ✅ Dispara 'unauthorized', redirige a login
5. **No hay más mascotas + Recargar**: ✅ Empty state persiste, intenta loadMorePets()

## 🎯 Métodos Públicos de Fase 3

### SwipeContainer
```javascript
showMatchModal(pet, matchData)  // NEW
showEmptyState()                // UPDATED
```

### MatchModal
```javascript
new MatchModal(petData, matchData?)
.on(event, callback)            // 'chat' | 'continue' | 'close'
.open()
.close()
.destroy()
.updatePet(petData)
.isDisplayed() → boolean
.getElement() → HTMLElement
```

### EmptyStateScreen
```javascript
new EmptyStateScreen()
.on(event, callback)            // 'refresh' | 'retry' | 'goHome'
.showEmpty()
.showLoading()
.showError(message)
.render()
.getElement() → HTMLElement
.destroy()
```

## 📱 Responsive Design

### Desktop (>768px)
- Modal ancho: max-w-sm (384px)
- Botones: padding py-3 px-6
- Fuente: text-3xl para títulos

### Tablet (768px-1024px)
- Modal: 90% de ancho
- Botones: padding escalado
- Confetti: 20 piezas (vs 30)

### Mobile (<768px)
- Modal: 85% de ancho + margin 1rem
- Botones: padding py-3 px-4
- Fuente: text-2xl para títulos
- Confetti: 15 piezas (menos carga)

## 🚀 Performance Targets (Fase 3)

| Métrica | Target | Verificación |
|---------|--------|---|
| Modal open animation | <400ms | Chrome DevTools Timing |
| Modal close animation | <300ms | Chrome DevTools Timing |
| Confetti FPS | 60fps | DevTools Performance tab |
| Memory (modal lifecycle) | <2MB | DevTools Memory snapshots |
| First paint empty state | <100ms | Network throttling |

## ✅ Completado en Fase 3

- ✅ MatchModal component (animaciones, confetti, callbacks)
- ✅ EmptyStateScreen component (3 estados: empty, loading, error)
- ✅ Integration en SwipeContainer
- ✅ Animaciones CSS nuevas (scaleIn, scaleOut, fall, float)
- ✅ ESC para cerrar modal
- ✅ Callbacks pattern (event-driven)
- ✅ Responsive design
- ✅ Testing checklist (15 test cases)

## 🚫 Limitaciones de Fase 3

- ❌ Confetti muy simple (CSS-only, sin library)
- ❌ No hay sonidos de match
- ❌ No hay compartir resultado en redes
- ❌ No hay undo de última acción
- ❌ Chat redirect es placeholder (Persona D)

## 🔮 Próximas Mejoras

- **Fase 4**: Sonidos y haptics (vibración mobile)
- **Fase 5**: Animaciones de confetti más avanzadas
- **Fase 6**: Share to social, undo action

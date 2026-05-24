# Fase 2: Arquitectura del Motor de Swipe

## 🏗️ Estructura de Componentes

```
AdoptMe Swipe Motor
├── UI Layer
│   ├── SwipeCard.js          ← Renderiza tarjeta individual
│   └── SwipeContainer.js     ← Stack manager + orquestación
│
├── Gesture Layer
│   └── SwipeGestureHandler.js ← Detecta mouse/touch
│
├── Data Layer
│   ├── PetAPI.js             ← HTTP client (fetch pets, post swipes)
│   └── mockData.js           ← Fallback data
│
└── App Orchestration
    └── app.js                ← Bootstrap + error handling
```

## 🔄 Flujo de Datos

```
User Gesture (Mouse/Touch)
        ↓
SwipeGestureHandler.handlePointerMove()
  - Calcula deltaX, rotación, opacidad en tiempo real
  - Aplica transform: translateX + rotateZ
  - Cambia color de fondo según dirección
        ↓
SwipeGestureHandler.handlePointerEnd()
  - Valida distancia/velocidad
  - Dispara CustomEvent('swipe', {direction, distance, velocity})
        ↓
SwipeContainer.handleSwipeRight/Left()
  - animateCardExit() → 600ms salida
  - petAPI.sendLike/Dislike() → POST a backend
  - Verifica match y muestra notificación
  - nextPet() → re-render
  - checkAndLoadMore() → carga mascotas si faltan
```

## 📡 API Integration

### GET /api/pets?page=0&size=10
```javascript
// Request
GET http://localhost:8080/api/pets?page=0&size=10
Authorization: Bearer {token}

// Response
[
  {id: 1, name: "Luna", image: "...", ...},
  {id: 2, name: "Max", image: "...", ...},
  ...
]
```

### POST /api/swipes/like
```javascript
// Request
POST http://localhost:8080/api/swipes/like
Authorization: Bearer {token}
Body: {petId: 1}

// Response (con match)
{
  success: true,
  isMatch: true,          // ← Dispara modal
  matchedPetName: "Luna",
  chatId: "chat-123"
}
```

### POST /api/swipes/dislike
```javascript
// Request
POST http://localhost:8080/api/swipes/dislike
Authorization: Bearer {token}
Body: {petId: 1}

// Response
{success: true}
```

## 🎯 Event Lifecycle

### Usuario swipea derecha
```
1. SwipeGestureHandler.handlePointerStart()
   → startX, startY guardados
   
2. SwipeGestureHandler.handlePointerMove()
   → Loop: deltaX calculado en tiempo real
   → Card rotada + opacidad en vivo
   → Fondo verde tenue
   
3. SwipeGestureHandler.handlePointerEnd()
   → deltaX > 50px? → dispatchSwipeEvent('swiperight')
   
4. CustomEvent('swipe') capturado
   → handleSwipeRight()
   
5. animateCardExit('right')
   → translateX(800px) + rotateZ(20deg) en 600ms
   
6. petAPI.sendLike(petId)
   → POST /api/swipes/like
   → Backend registra like
   
7. checkAndLoadMore()
   → Si quedan ≤2, carga siguiente página
   
8. nextPet()
   → currentIndex++
   → render() → SwipeCard nueva
   → GestureHandler re-instanciado
```

## ⚙️ Configuración Crítica

```javascript
// SwipeGestureHandler
swipeThreshold: 50          // Píxeles mínimos para registrar
velocityThreshold: 0.5      // px/ms mínima

// SwipeContainer
checkAndLoadMore()          // Trigger: remaining ≤ 2
PAGE_SIZE: 10               // Tamaño del lote

// animateCardExit()
Duration: 600ms             // Salida suave
easing: cubic-bezier(0.4, 0, 0.2, 1)
distance: 800px             // Translación final
angle: ±20deg               // Rotación final
```

## 🛡️ Error Handling

### 1. API Error (500, Network)
```
catch error in handleSwipeRight/Left
→ Log error
→ render() → resetea card a posición original
```

### 2. Authorization Error (401/403)
```
petAPI.handleError() → throw new Error('UNAUTHORIZED')
→ Capturado en handleSwipeRight/Left
→ Dispara window.dispatchEvent('unauthorized')
→ app.js redirige a /login (Persona C)
```

### 3. API No Disponible
```
app.js: loadMorePets() fails
→ console.warn('⚠️ API no disponible...')
→ Fallback a mockPets
→ App funciona para desarrollo
```

## 📊 Performance Targets

- **Frame Rate**: 60fps (animaciones smooth)
- **Memory**: <50MB (sin leaks con 100+ swipes)
- **API Latency**: <500ms (POST swipe action)
- **Touch Response**: <100ms (gesto → visual feedback)

## 🚫 Limitaciones de Fase 2

- ❌ No hay gestos avanzados (pinch, rotation)
- ❌ No hay persistencia de estado (refresh = reset)
- ❌ No hay caching de imágenes
- ❌ No hay soporte undo/redo
- ❌ Chat integration (Persona D)
- ❌ Auth (Persona C)

## ✅ Completado en Fase 2

- ✅ Detección de swipe (mouse + touch)
- ✅ API integration (GET pets, POST like/dislike)
- ✅ Precarga automática de lotes
- ✅ Animaciones de salida (600ms)
- ✅ Match notifications
- ✅ Error handling (auth, network)
- ✅ Fallback a mock data
- ✅ Estado vacío + refresh

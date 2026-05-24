# Fase 2: Testing Checklist

## Prerequisitos
- Backend corriendo en `http://localhost:8080`
- Endpoints disponibles:
  - `GET /api/pets?page=0&size=10`
  - `POST /api/swipes/like` (body: `{petId: number}`)
  - `POST /api/swipes/dislike` (body: `{petId: number}`)
- JWT token en localStorage bajo key `token` o `jwt`

## Test 1: Carga Inicial de Mascotas
**Esperado**: Al abrir la app, carga mascotas de la API (o mock data en fallback)

```bash
# 1. Abrir Dev Tools (F12) → Console
# 2. Deberías ver logs:
#    "🎯 AdoptMe Frontend Inicializando (Fase 2)..."
#    "📡 Obteniendo mascotas de la API (página 0)..."
#    "✅ App montada con 10 mascotas."
```

## Test 2: Visualización de Stack
**Esperado**: Ves 3 tarjetas (1 al frente, 2 de fondo con offset)

```bash
# 1. Abre la app
# 2. Verifica:
#    - Primera tarjeta frontal, visible completamente
#    - 2 tarjetas de fondo ligeramente desplazadas hacia arriba
#    - Efecto de profundidad visual
```

## Test 3: Swipe con Mouse (Left)
**Esperado**: Dragging izquierda → anima card salida, dislike registrado

```bash
# 1. Posiciona mouse sobre tarjeta frontal
# 2. Click y arrastra hacia la IZQUIERDA (~100px)
# 3. Suelta mouse
# Esperado:
#    - Card se anima hacia izquierda con rotación
#    - Log: "✖️ Dislike registrado para mascota X"
#    - Siguiente tarjeta aparece con animación
```

## Test 4: Swipe con Mouse (Right)
**Esperado**: Dragging derecha → anima card salida, like registrado

```bash
# 1. Posiciona mouse sobre tarjeta frontal
# 2. Click y arrastra hacia la DERECHA (~100px)
# 3. Suelta mouse
# Esperado:
#    - Card se anima hacia derecha con rotación
#    - Log: "❤️ Like registrado para mascota X"
#    - Siguiente tarjeta aparece con animación
```

## Test 5: Touch Swipe (Mobile)
**Esperado**: En mobile, swipe touch funciona igual que mouse

```bash
# En Dev Tools:
# 1. Toggle device toolbar (Ctrl+Shift+M)
# 2. Simula swipe touch sobre card
# 3. Verifica que responda como mouse
```

## Test 6: Botones Like/Dislike
**Esperado**: Botones disparan misma lógica que swipe

```bash
# 1. Haz click en botón Like (corazón rojo)
# Esperado:
#    - Card sale hacia derecha
#    - Like registrado en API
#    - Siguiente card aparece

# 2. Haz click en botón Dislike (X)
# Esperado:
#    - Card sale hacia izquierda
#    - Dislike registrado en API
#    - Siguiente card aparece
```

## Test 7: Precarga de Mascotas
**Esperado**: Cuando quedan 2 mascotas, carga más automáticamente

```bash
# 1. Swipea hasta las últimas 2 mascotas
# 2. Verifica en Console:
#    "⏳ Precargando más mascotas..."
#    "📡 Obteniendo mascotas de la API (página 1)..."
# 3. Stack nunca debe estar vacío (hasta que API retorne vacío)
```

## Test 8: Estado Vacío
**Esperado**: Cuando se agotan mascotas, muestra mensaje + botón Recargar

```bash
# 1. Swipea hasta agotar todas las mascotas
# 2. Verifica:
#    - Mensaje "Sin más mascotas"
#    - Botón "Recargar" disponible
#    - Botones Like/Dislike deshabilitados
```

## Test 9: Match Notification (si backend lo soporta)
**Esperado**: Si un like es match, muestra modal

```bash
# 1. Haz like a una mascota
# 2. Si backend responde con {isMatch: true}:
#    - Modal con 💕 y "¡Es un match!"
#    - Botones "Ir al chat" (placeholder) y "Continuar viendo"
```

## Test 10: Error de Autorización
**Esperado**: Si token inválido, redirige a login

```bash
# 1. Limpia localStorage: localStorage.removeItem('token')
# 2. Intenta hacer like/dislike
# 3. Verifica:
#    - Log: "🔐 Token expirado o inválido"
#    - Redirige a `/login` (será Persona C)
```

## Test 11: Fallback a Mock Data
**Esperado**: Si API no está disponible, usa datos mock

```bash
# 1. Detén el backend
# 2. Refresca la app
# 3. Verifica en Console:
#    "⚠️ API no disponible. Usando mock data para desarrollo..."
# 4. App debe funcionar con mascotas mock
```

## Performance Checks
- ✅ No hay lag en swipe
- ✅ Animaciones smooth (60fps)
- ✅ No hay memory leaks (abre Dev Tools → Memory)
- ✅ Touch es responsive en mobile

## Notas Finales
- **Auth**: No implementada (Persona C)
- **Chat**: No implementado (Persona D)
- **Fallback**: Mock data para desarrollo sin backend
- **Próxima fase**: Fase 3 (Touch gestures avanzadas, gestos múltiples)

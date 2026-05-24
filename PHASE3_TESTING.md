# Fase 3: Testing Checklist - Match Modal + Empty States

## Prerequisitos
- Backend corriendo en `http://localhost:8080`
- JWT token válido en localStorage
- Endpoints disponibles:
  - `GET /api/pets?page=X&size=10`
  - `POST /api/swipes/like` (puede retornar `{isMatch: true}`)
  - `POST /api/swipes/dislike`

---

## Test 1: Match Modal - Apertura
**Esperado**: Modal se abre cuando backend retorna `isMatch: true`

```bash
# 1. Hacer like a una mascota cuyo backend retorna:
# {success: true, isMatch: true, matchedPetName: "Luna"}

# 2. Esperar 600ms (animación de salida de card)

# 3. Verificar:
#    ✓ Modal aparece con animación scaleIn (400ms)
#    ✓ Backdrop con blur se ve
#    ✓ Icono 💕 con animación bounce
#    ✓ Confetti cae (animación opcional)
#    ✓ Título: "¡Es un match!"
#    ✓ Nombre de la mascota: "A {nombre} también le gustaste 🎉"
#    ✓ Foto de la mascota en thumbnail
```

## Test 2: Match Modal - Botón "Ir al Chat"
**Esperado**: Navega a chat con la mascota

```bash
# 1. Abre modal de match (ver Test 1)
# 2. Haz click en botón "💬 Ir al Chat"
# 3. Verificar:
#    ✓ Modal se cierra con animación fadeOut (300ms)
#    ✓ Redirige a: /chat/{petId} o /chat/{chatId}
#    ✓ Log en console: "💬 Navegando a chat para: Luna"
```

## Test 3: Match Modal - Botón "Continuar viendo mascotas"
**Esperado**: Cierra modal y continúa el flow de swipe

```bash
# 1. Abre modal de match
# 2. Haz click en "Continuar viendo mascotas"
# 3. Verificar:
#    ✓ Modal se cierra con animación (300ms)
#    ✓ Siguiente mascota aparece con stack effect
#    ✓ No hay redirect
#    ✓ Flow de swipe continúa normalmente
#    ✓ Log: "👉 Continuando con mascotas..."
```

## Test 4: Match Modal - Botón X (Cerrar)
**Esperado**: Cierra modal sin acción especial

```bash
# 1. Abre modal de match
# 2. Haz click en botón X (esquina superior derecha)
# 3. Verificar:
#    ✓ Modal se cierra con scaleOut animation
#    ✓ Siguiente mascota aparece
#    ✓ Log: "❌ Modal cerrado"
```

## Test 5: Match Modal - Cerrar con ESC
**Esperado**: ESC cierra el modal

```bash
# 1. Abre modal de match
# 2. Presiona ESC
# 3. Verificar:
#    ✓ Modal se cierra
#    ✓ Siguiente mascota aparece
```

## Test 6: Empty State - Sin más mascotas
**Esperado**: Muestra pantalla de estado vacío cuando no hay mascotas

```bash
# 1. Configura backend para retornar [] (lista vacía)
# 2. Swipea hasta agotar mascotas
# 3. Verificar:
#    ✓ Cards desaparecen
#    ✓ Aparece emoji 🎉 con animación float
#    ✓ Título: "¡Sin más mascotas!"
#    ✓ Descripción con tips
#    ✓ Botón "🔄 Recargar Mascotas"
#    ✓ Botón "💕 Ver mis Matches" (navbar)
#    ✓ Botón "🏠 Ir a inicio"
```

## Test 7: Empty State - Botón Recargar
**Esperado**: Reinicia el stack y carga mascotas nuevamente

```bash
# 1. Muestra empty state (ver Test 6)
# 2. Haz click en "🔄 Recargar Mascotas"
# 3. Verificar:
#    ✓ Stack se reinicia (currentIndex = 0)
#    ✓ Se carga página 0 nuevamente
#    ✓ Mascotas aparecen si hay disponibles
#    ✓ Log: "🔄 Usuario solicitó recargar..."
```

## Test 8: Empty State - Botón "Ver mis Matches"
**Esperado**: Navega a página de matches

```bash
# 1. Muestra empty state
# 2. Haz click en "💕 Ver mis Matches"
# 3. Verificar:
#    ✓ Redirige a: /matches (Persona D - Chat)
#    ✓ Log: "💕 Ir a matches..."
```

## Test 9: Empty State - Botón "Ir a inicio"
**Esperado**: Navega al home

```bash
# 1. Muestra empty state
# 2. Haz click en "🏠 Ir a inicio"
# 3. Verificar:
#    ✓ Redirige a: /
#    ✓ Log: "🏠 Ir a inicio..."
```

## Test 10: Error State - No se puede cargar
**Esperado**: Muestra pantalla de error con opciones

```bash
# 1. Detén el backend o simula error 500
# 2. Intenta cargar mascotas (refresh o recargar)
# 3. Verificar:
#    ✓ Aparece emoji ⚠️
#    ✓ Título: "Oops, algo salió mal"
#    ✓ Mensaje de error personalizado
#    ✓ Tips de troubleshooting (recarga, conexión, etc.)
#    ✓ Botón "🔄 Reintentar"
#    ✓ Botón "🏠 Volver a inicio"
```

## Test 11: Error State - Botón Reintentar
**Esperado**: Intenta cargar nuevamente

```bash
# 1. Muestra error state
# 2. Haz click en "🔄 Reintentar"
# 3. Verificar:
#    ✓ Se ejecuta loadMorePets() nuevamente
#    ✓ Si backend funciona: mascotas cargan
#    ✓ Si backend sigue fallando: error persiste
#    ✓ Log: "🔄 Reintentando carga..."
```

## Test 12: Transiciones Suaves entre Estados
**Esperado**: No hay saltos visuales, todo se anima correctamente

```bash
# 1. Card → Match Modal: 600ms (salida) + 400ms (modal) = 1s
# 2. Match Modal → Next Card: 300ms (cierre) + 300ms (entrada)
# 3. Cards → Empty State: fade + contenedor 300ms
# 4. Error → Retry → Success: Transiciones fluidas

# Verificar:
#    ✓ No hay "parpadeos" o cambios abruptos
#    ✓ Z-index correcto (modales encima)
#    ✓ Backdrop no interfiere con scroll
```

## Test 13: Mobile Responsiveness
**Esperado**: Layouts se adaptan en pantalla pequeña

```bash
# En Dev Tools:
# 1. Toggle device toolbar (Ctrl+Shift+M)
# 2. Usa iPhone SE (375px width)
# 3. Verificar:
#    ✓ Modal ocupa máximo 85% de ancho
#    ✓ Botones son tocables (min 44px altura)
#    ✓ Texto es legible
#    ✓ Confetti animation no causa lag
```

## Test 14: Confetti Effect (Visual)
**Esperado**: Confetti cae suavemente cuando hay match

```bash
# 1. Abre modal de match
# 2. Observa confetti que cae desde arriba
# 3. Verificar:
#    ✓ Piezas de confetti (min 10, máx 50)
#    ✓ Colores variados (#FF6B6B, #4ECDC4, #45B7D1, etc.)
#    ✓ Animación "fall" suave (1-3 segundos)
#    ✓ Opacidad baja para no distraer
#    ✓ No causa lag o stuttering
```

## Test 15: Accesibilidad
**Esperado**: Modal es accesible con teclado

```bash
# 1. Abre modal
# 2. Usa TAB para navegar entre botones
# 3. Presiona ENTER en botones
# 4. Presiona ESC para cerrar
# 5. Verificar:
#    ✓ Todos los botones son focusables
#    ✓ Focus visible (outline claro)
#    ✓ ESC cierra modal
```

---

## Edge Cases

### Edge Case 1: Match seguido de Match
```bash
# Backend retorna match para las próximas 2 mascotas seguidas
# 1. Like #1 → match → continúa → Like #2 → match
# Verificar: Modales se abren/cierran correctamente sin confusión
```

### Edge Case 2: Like → Dislike (sin gap)
```bash
# Usuario hace like (sin match), y antes de que aparezca 
# siguiente card, hace dislike
# Verificar: Solo se procesa el primer gesto, el segundo es ignorado
```

### Edge Case 3: Empty Estado → Recargar → Empty again
```bash
# Backend sigue retornando [] en la retirada
# 1. Empty state
# 2. Recargar
# 3. Verificar: Empty state persiste, no loop infinito
```

---

## Console Logs Esperados

```javascript
// Match modal
🎉 Match modal abierto para: Luna
💬 Navegando a chat para: Luna
👉 Continuando con mascotas...
❌ Modal cerrado

// Empty state
🔄 Usuario solicitó recargar...
⏳ Precargando más mascotas...

// Error state
❌ Error cargando mascotas: {message}
🔄 Reintentando carga...
```

---

## Checklist de QA

- [ ] Modal abre en 400ms, cierra en 300ms
- [ ] Confetti no causa lag (60fps)
- [ ] Empty state accesible con teclado
- [ ] Botones tienen hover states claros
- [ ] Mensajes de error son útiles
- [ ] Transiciones entre estados son suaves
- [ ] Mobile responsiveness verificada
- [ ] No hay memory leaks (abrir/cerrar modal 20 veces)
- [ ] Accessibility: ESC, TAB, ENTER funcionan
- [ ] Backend errors manejados correctamente

---

## Notas Finales

- **Persona B**: Solo maneja UI del swipe motor (no chat, no auth)
- **Persona D**: Maneja destino `/chat/{petId}`
- **Persona C**: Maneja redirects a `/login` si token inválido
- **No implementado**: Persistencia de estado entre reloads

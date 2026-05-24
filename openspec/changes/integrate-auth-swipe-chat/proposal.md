# Proposal: Integrate Auth, Swipe, and Chat Modules

## Intent

Unify three independently developed modules (auth, swipe, chat) into a cohesive Single Page Application (SPA). Currently each module works in isolation with inconsistent token handling, duplicate services, and no routing system. Users cannot navigate from swipe to chat after a match, and auth state is not properly guarded across features.

## Scope

### In Scope
- Implement lightweight SPA router in `index.html` with route guards
- Standardize token storage key to `adoptme_token` across all modules
- Create `chat.html` page to mount ChatModule
- Unify duplicate auth services (`js/auth/authService.js` and `js/services/authService.js`)
- Add auth guard to swipe page (redirect to login if not authenticated)
- Wire MatchModal "Ir al Chat" button to navigate to `/chat/{chatId}`
- Fix `PetAPI.js` token key inconsistency (reads `token`/`jwt`, should read `adoptme_token`)

### Out of Scope
- Backend API changes (endpoints already confirmed)
- UI/UX redesign of existing components
- New features beyond integration (e.g., profile editing, notifications)
- WebSocket implementation for real-time chat (polling already exists)

## Capabilities

### New Capabilities
- `spa-routing`: Lightweight client-side router with auth guards for protected routes
- `chat-page`: Dedicated HTML page for chat feature with ChatModule integration

### Modified Capabilities
- `user-auth`: Consolidate duplicate auth services, standardize token key to `adoptme_token`
- `pet-swiping`: Fix token retrieval in PetAPI.js to use `adoptme_token`

## Approach

**Phase 1: Auth Unification**
1. Consolidate `js/auth/authService.js` and `js/services/authService.js` into single service
2. Update all imports to reference unified service
3. Fix `PetAPI.js` to read `adoptme_token` instead of `token`/`jwt`

**Phase 2: SPA Router**
1. Create `js/router.js` with hash-based routing (`#/swipe`, `#/chat/:id`, `#/login`)
2. Add route guards: `/swipe` and `/chat` require auth, `/login` redirects if authenticated
3. Update `index.html` to mount router instead of direct component

**Phase 3: Chat Page**
1. Create `chat.html` with container for ChatModule
2. Wire MatchModal callback to navigate to `#/chat/{chatId}`
3. Update ChatModule to work with router context

**Phase 4: Auth Guards**
1. Add auth check on swipe page bootstrap
2. Redirect to `#/login` if no token found
3. Handle session expiration globally via `auth:invalid` event

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `js/auth/authService.js` | Modified | Keep as primary service, export to all modules |
| `js/services/authService.js` | Removed | Deprecate in favor of unified service |
| `js/services/PetAPI.js` | Modified | Fix `getToken()` to read `adoptme_token` |
| `js/router.js` | New | SPA router with route guards |
| `chat.html` | New | Chat page mounting ChatModule |
| `index.html` | Modified | Router entry point, auth guard for swipe |
| `js/components/MatchModal.js` | Modified | Wire chat button to router navigation |
| `js/app.js` | Modified | Initialize router, add auth bootstrap check |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Token key inconsistency breaks API calls | Medium | Audit all localStorage reads/writes, update in single pass |
| Duplicate auth services cause confusion | Low | Deprecate one service, update all imports, document in README |
| Router conflicts with existing navigation | Low | Use hash-based routing to avoid server config needs |
| Chat page doesn't receive correct chatId | Medium | Test MatchModal → router → ChatModule flow end-to-end |
| Auth guard redirect loops | Medium | Add current path check before redirect (already in authService) |

## Rollback Plan

1. **Router issues**: Revert `index.html` to direct component mount, restore original `app.js`
2. **Auth service consolidation**: Restore backup of both services, revert imports
3. **Token key issues**: Update `PetAPI.js` back to dual-key fallback (`token` or `jwt`)
4. **Chat page problems**: Remove `chat.html`, revert MatchModal to placeholder behavior

All changes are additive or refactoring—no destructive backend changes. Git revert can restore previous state per file.

## Dependencies

- Backend running at `http://localhost:8080` with confirmed endpoints
- All three modules (auth, swipe, chat) functional in isolation
- Browser support for ES6 modules (already in use)

## Success Criteria

- [ ] User can log in and access swipe page (auth guard passes)
- [ ] Unauthenticated user redirected to login when accessing `/swipe` or `/chat`
- [ ] Match modal "Ir al Chat" button navigates to working chat page
- [ ] Token consistently stored and retrieved as `adoptme_token` across all modules
- [ ] No duplicate auth service imports in codebase
- [ ] PetAPI successfully authenticates requests with unified token
- [ ] Session expiration redirects to login from any protected page

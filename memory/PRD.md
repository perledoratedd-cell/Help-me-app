# Help My New - PRD

## Original Problem Statement
Crear una app en 90 idiomas en tiempo real, llamada Help My New, dividida en secciones según intereses profesionales, necesidades de ayuda y soluciones urgentes, conectando personas que necesitan ayuda con proveedores locales.

## User Personas
1. **Clientes** - Personas que necesitan ayuda urgente (limpieza, mudanzas, cuidado de mayores, etc.)
2. **Proveedores** - Profesionales que ofrecen servicios (peluqueros, jardineros, cuidadores, etc.)
3. **Administradores** - Gestión de categorías y moderación

## Core Requirements
- Multi-idioma (90 idiomas) con traducción en tiempo real
- Autenticación JWT + Google OAuth
- Pagos con Stripe (PayPal pendiente)
- Geolocalización + código postal manual
- Sistema de mensajería con prueba de acuerdo
- Categorías extensibles

## What's Been Implemented (Jan 2, 2025)
### Backend (FastAPI + MongoDB)
- ✅ Auth: JWT + Google OAuth (Emergent)
- ✅ 15 categorías de servicios
- ✅ CRUD proveedores/solicitudes/mensajes
- ✅ Traducción OpenAI (Emergent LLM Key)
- ✅ Pagos Stripe

### Frontend (React + Tailwind + Shadcn)
- ✅ Landing page con hero e imágenes de categorías
- ✅ Selector de idiomas (30+)
- ✅ Auth (login/registro + Google)
- ✅ Dashboard cliente/proveedor
- ✅ Formularios de solicitud
- ✅ Sistema de mensajes
- ✅ Checkout Stripe

## Prioritized Backlog

### P0 (Critical)
- [ ] Integración PayPal
- [ ] Sistema de notificaciones

### P1 (High)
- [ ] Valoraciones y reseñas
- [ ] Panel de administración
- [ ] Mapa con geolocalización

### P2 (Medium)
- [ ] Chat en tiempo real (WebSockets)
- [ ] Calendario de disponibilidad
- [ ] Facturación automática

## Next Tasks
1. Integrar PayPal como método alternativo
2. Sistema de valoraciones post-servicio
3. Notificaciones push para solicitudes urgentes
4. Panel admin para gestionar categorías

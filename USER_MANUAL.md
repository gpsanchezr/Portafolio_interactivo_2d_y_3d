# 🌸 Manual de Usuario — Giseella's World
## Portafolio 3D Interactivo · Guía Completa

---

## 📋 ¿Qué es Giseella's World?

**Giseella's World** es un portafolio profesional doble:

| Vista | Descripción |
|-------|-------------|
| 🌐 **Portafolio 2D** | Página web profesional con todas las secciones |
| 🎮 **Mundo 3D** | Ciudad interactiva explorable como videojuego |

Los dos se comunican con un botón: el portafolio 2D tiene el botón **"Portafolio 3D Interactivo →"** y el mundo 3D tiene el botón **"← Portafolio 2D"**.

---

## 🚀 Instalación Rápida (Windows)

```powershell
# 1. Navegar a la carpeta del proyecto
cd C:\Users\Issela Sanchez\Downloads\giseella-world

# 2. Instalar dependencias (solo la primera vez, ~2-3 min)
npm install

# 3. Iniciar el proyecto
npm run dev
```

Se abre automáticamente en: **http://localhost:3000**

### Comandos disponibles

| Comando | Función |
|---------|---------|
| `npm run dev` | Servidor de desarrollo con hot-reload |
| `npm run build` | Compilar para producción (carpeta `dist/`) |
| `npm run preview` | Previsualizar el build |

---

## 🗺️ El Mapa de la Ciudad

```
═══════════════════════════════════════════════════
                 [🌿 TEMPLO ZEN]
                  Contacto — Z=-54
                        │
        [🏛️ MANSIÓN]    │    [⚗️ SKILLS LAB]
         Sobre Mí        │    Habilidades
         X=-22,Z=-25     │    X=22,Z=-25
              \          │        /
        [🎬 CINE-VERSE]  │  [🏢 TERRASOFT]
         X=-18,Z=-10     │  X=18,Z=-10
                    \    │   /
                 [🤖 ZONA IA]
                  X=0, Z=-15
                       │
               [🏡 CASA GISEELLA]
                Plaza Central
                  X=0, Z=3
               /           \
    [🚗 PARKNIDUS]    [🌾 HAPPY-FARM]
     X=-18, Z=8        X=18, Z=8
          \               /
            [🌳 PARQUE SUR]
               X=0, Z=14
                   │
             [🌸 ENTRADA]
             Arco Ciudad
               Z=22
═══════════════════════════════════════════════════
       💧 LAGO (este, X=16, Z=-30)
       🌉 PUENTE (X=8, Z=-30)
═══════════════════════════════════════════════════
```

---

## 🕹️ Controles del Juego

### Movimiento del Personaje

| Tecla | Acción | Resultado Visual |
|-------|--------|-----------------|
| `W` / `↑` | Mover hacia adelante | Personaje camina de espaldas a la cámara |
| `S` / `↓` | Mover hacia atrás | Personaje camina de frente a la cámara |
| `A` / `←` | Mover a la izquierda | Personaje camina hacia la izquierda |
| `D` / `→` | Mover a la derecha | Personaje camina hacia la derecha |
| `Shift` + `WASD` | **Correr** | Velocidad ×2, animación de carrera |

> 💡 **Tip:** El personaje siempre se mueve **relativo a la cámara**. Si rotas la cámara, W siempre va "hacia donde mira la cámara".

### Cámara

| Acción | Control |
|--------|---------|
| Zoom acercar / alejar | Rueda del mouse (Scroll) |
| Rotar cámara | Click derecho + arrastrar |
| Elevar / bajar ángulo | Click derecho + arrastrar vertical |
| Zoom táctil (móvil) | Pellizcar con dos dedos |

### Interacción

| Tecla | Acción |
|-------|--------|
| `E` / `Enter` | Interactuar con zona cercana (abre panel) |
| `M` | Abrir / cerrar el mapa |

---

## 🗺️ Cómo usar el Mapa

### Mapa Mini (esquina inferior derecha)
- **Siempre visible** con el punto blanco mostrando tu posición
- **Haz clic en cualquier ícono** para teletransportarte instantáneamente
- Muestra calles, lago y todas las zonas con sus emojis

### Mapa Completo (botón "Ver Mapa Completo")
1. Clic en **"Ver Mapa Completo"**
2. Se abre un mapa interactivo a pantalla completa
3. Cada zona tiene tarjeta con emoji, nombre y descripción
4. **Clic en cualquier tarjeta** → teletransporte + abre panel del proyecto
5. Tu posición se muestra como punto blanco brillante
6. Clic fuera del mapa o botón **"✕ Cerrar Mapa"** para salir

---

## ☀️ Sistema de Clima / Día y Noche

Los botones en la esquina superior derecha controlan el ambiente:

| Botón | Clima | Descripción |
|-------|-------|-------------|
| ☀️ **Día** | Soleado | Cielo azul, sol animado, nubes blancas |
| 🌇 **Sakura** | Atardecer | Cielo rosa-naranja, pétalos cayendo |
| 🌧️ | Lluvia | Cielo gris, lluvia intensa |
| 🌃 **Noche** | Nocturno | Cielo estrellado, luna creciente, luciérnagas |

---

## 🏙️ Guía de Zonas

### 🏡 Casa Giseella (Centro)
- **Qué es:** Casa principal / Sobre Mí
- **Cómo llegar:** Punto de inicio del juego
- **Al acercarte:** Abre panel "Sobre Mí" con información del portafolio

### 🎬 Cine-Verse (Noroeste)
- **Qué es:** Proyecto de gestión de cine con CineBot IA
- **Tecnologías:** React · Python · MySQL · OpenAI
- **Al acercarte:** Abre información del proyecto Cine-Verse

### 🚗 ParkNidus (Suroeste)
- **Qué es:** Sistema de gestión de parqueo en red
- **Tecnologías:** Node.js · MySQL · JavaScript
- **Visual:** Edificio de parqueo multinivel con autos

### 🌾 Happy-Farm (Sureste)
- **Qué es:** E-commerce artesanal con CI/CD
- **Tecnologías:** Python · Django · MySQL · Vercel
- **Visual:** Granja con granero rojo, silo, animales

### 🤖 Zona IA (Norte Centro)
- **Qué es:** Contador de personas con Raspberry Pi 5 + OpenCV
- **Tecnologías:** Python · OpenCV · Raspberry Pi 5
- **Visual:** Edificio futurista con holograma y anillos giratorios

### 🏢 Terrasoft (Noreste)
- **Qué es:** Plataforma inmobiliaria
- **Tecnologías:** React · TypeScript · Supabase
- **Visual:** Edificio moderno con vidrio y carteles "Se Vende"

### 🏛️ Mansión Giseella (Noroeste lejano)
- **Qué es:** Portafolio / Sobre Mí (zona extendida)
- **Visual:** Mansión con columnas y jardín

### ⚗️ Skills Lab (Noreste lejano)
- **Qué es:** Laboratorio de habilidades tecnológicas
- **Visual:** Edificio con antena giratoria y orbes de skills flotantes

### 🌿 Templo Zen (Norte, muy lejano)
- **Qué es:** Zona de Contacto
- **Visual:** Templo japonés con torii, farolillos, árbol de cerezo

---

## 👥 Personajes Interactivos (NPCs)

Hay **5 NPCs** que caminan por la ciudad. Acércate a ellos para ver sus consejos:

| NPC | Ubicación | Tema |
|-----|-----------|------|
| 💻 Dev Reactivo | Cerca de Skills Lab | React · Hooks · State |
| 🐍 Pythonista | Cerca de Terrasoft | Python · Django · ML |
| 🗄️ DB Master | Cerca de Happy-Farm | MySQL · Supabase · SQL |
| 🌐 Full Stacker | Centro ciudad | Full Stack · Git · Deploy |
| 🐋 DevOps Ninja | Camino al Templo | Docker · CI/CD · Cloud |

---

## 🐄 Animales

| Animal | Zona | Comportamiento |
|--------|------|---------------|
| 🐄 Vacas (×4) | Happy-Farm | Caminan lentamente alrededor de la granja |
| 🐔 Gallinas (×4) | Happy-Farm | Picotean el suelo, se mueven rápido |
| 🐦 Pájaros (×6) | Cielo | Vuelan en círculos a diferentes alturas |
| 🦋 Mariposas (×7) | Flores de la ciudad | Revolotean alrededor de las flores |

---

## 🏆 Logros

Visita las zonas para desbloquear logros que aparecen como notificaciones:

| Logro | Condición |
|-------|-----------|
| 🌾 ¡Visitaste Happy-Farm! | Llegar a la granja |
| 🎬 ¡Entraste al Cine! | Llegar a Cine-Verse |
| 🚗 ¡Visitaste ParkNidus! | Llegar al parqueadero |
| 🌿 ¡Llegaste al Templo! | Llegar al Templo Zen (zona más lejana) |
| 🏢 Terrasoft Visitado! | Llegar a Terrasoft |
| 🤖 Zona IA Desbloqueada! | Llegar a la Zona IA |

---

## 📱 Controles Móviles

En dispositivos táctiles aparece automáticamente:
- **Joystick virtual** (esquina inferior izquierda) para mover el personaje
- **Botón 🏃 Correr** encima del joystick
- **Pellizcar** la pantalla para hacer zoom
- Todos los botones del HUD siguen siendo tocables

---

## 🔊 Audio

- Botón 🔊 / 🔇 en la esquina superior derecha
- Al entrar al mundo 3D, se activa el audio al hacer clic en **"Entrar al Mundo"**
- Música ambiental de fondo suave
- Sonido de **puerta** al acercarse y alejarse de cada edificio

---

## 🌐 Portafolio 2D

El portafolio 2D tiene las siguientes secciones:

1. **Hero** — Presentación con typewriter, contadores y avatar
2. **Sobre Mí** — Información personal y experiencia
3. **Skills** — 18 habilidades con barras animadas (3 tabs: Frontend / Backend / Tools)
4. **Servicios** — 6 servicios ofrecidos con tarjetas hover
5. **Proyectos** — 6 proyectos con filtro (Todos / Web / 3D / Backend / IA)
6. **Testimonios** — 3 referencias de clientes
7. **Contacto** — Formulario directo a Supabase + redes sociales
8. **Footer** — Links y créditos

### Pétalos de Cerezo 3D
El portafolio 2D tiene **42 pétalos de cerezo cayendo** con efecto de profundidad 3D:
- Pétalos pequeños (lejanos) = opacidad baja, caída lenta
- Pétalos grandes (cercanos) = opacidad alta, caída rápida
- Movimiento horizontal suave para imitar el viento

---

## 🗄️ Configuración de Supabase

Antes de usar el formulario de contacto, ejecutar en Supabase → SQL Editor:

```sql
-- Ver archivo: supabase-schema.sql
```

Los mensajes del formulario llegan a:
**Supabase Dashboard → Table Editor → contact_messages**

---

## 🚀 Deploy en Vercel

```bash
# 1. Subir a GitHub
git init && git add . && git commit -m "🌸 Giseella World Portfolio"
git remote add origin https://github.com/gpsanchezr/giseella-world.git
git push -u origin main

# 2. En Vercel.com → New Project → Import
# Framework: Vite
# Variables de entorno:
# VITE_SUPABASE_URL = https://oldvgciksrwujujimepg.supabase.co
# VITE_SUPABASE_ANON_KEY = eyJhbGci...
```

---

## 🐛 Solución de Problemas

| Problema | Solución |
|----------|----------|
| `node` no reconocido | Instalar Node.js desde nodejs.org |
| Puerto 3000 ocupado | Cambiar en `vite.config.ts`: `server: { port: 3001 }` |
| Modelos 3D tardan | Normal — el avatar GLB pesa 52MB, los modelos se cargan async |
| Formulario no envía | Ejecutar `supabase-schema.sql` en el SQL Editor de Supabase |
| Personaje flotante | Recargar la página, el mundo necesita cargar completamente |
| Pantalla negra | Verificar que la GPU soporte WebGL 2.0 (cualquier navegador moderno) |

---

## 📁 Estructura del Proyecto

```
giseella-world/
├── public/
│   └── models/               ← Archivos GLB (avatar, granja, ciudad, oficina)
├── src/
│   ├── App.tsx               ← Switcher portafolio ↔ mundo 3D
│   ├── store.ts              ← Estado global (Zustand)
│   ├── supabase.ts           ← Base de datos
│   ├── pages/
│   │   ├── Portfolio.tsx     ← Portafolio 2D completo
│   │   └── World3D.tsx       ← Mundo 3D (canvas R3F)
│   ├── world/
│   │   ├── World.tsx         ← Escena 3D completa
│   │   ├── Buildings.tsx     ← 9 edificios procedurales
│   │   ├── Character.tsx     ← Personaje Giseella (GLB + fallback)
│   │   ├── CameraController.tsx ← Cámara isométrica
│   │   ├── WeatherSystem.tsx ← Día/noche/lluvia/sakura
│   │   └── NPCs.tsx          ← Personajes y animales
│   ├── ui/
│   │   ├── HUD.tsx           ← Toda la interfaz de juego
│   │   ├── LoadingScreen.tsx ← Pantalla de carga
│   │   └── IntroScreen.tsx   ← Cinemática de introducción
│   └── styles/
│       ├── globals.css       ← Variables CSS y reset
│       └── portfolio.css     ← Estilos del portafolio 2D
├── index.html
├── package.json
├── vite.config.ts
├── .env.local                ← Claves Supabase (NO subir a GitHub)
├── supabase-schema.sql       ← SQL para crear las tablas
└── USER_MANUAL.md            ← Este archivo
```

---

## 🎨 Diseño del Sistema

| Elemento | Valor |
|----------|-------|
| Color principal | `#ff89b5` (Sakura) |
| Fondo oscuro | `#080c18` (Azul medianoche) |
| Acento dorado | `#f0c060` |
| Acento teal | `#00d4aa` |
| Fuente display | Playfair Display (serif) |
| Fuente body | Inter (sans-serif) |
| Fuente código | JetBrains Mono |

---

*Giseella Sánchez Rico · Full Stack Developer · SENA ADSO · Barramquilla, Colombia*  
*GitHub: https://github.com/gpsanchezr*  
*LinkedIn: https://www.linkedin.com/in/giseella-sanchez-74b186227*

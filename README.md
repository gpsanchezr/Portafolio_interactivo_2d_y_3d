# 🌸 Giseella's World — Documentación Técnica Completa
## Portfolio Profesional + Mundo 3D Interactivo

**Giseella Sánchez Rico** · Full Stack Developer · SENA ADSO  
🔗 [GitHub](https://github.com/gpsanchezr) · [LinkedIn](https://www.linkedin.com/in/giseella-sanchez-74b186227)

---

## 📋 Tabla de Contenidos

1. [Visión del Proyecto](#1-visión-del-proyecto)
2. [Arquitectura Unificada](#2-arquitectura-unificada)
3. [Sistema de Diseño](#3-sistema-de-diseño)
4. [Mecánicas 3D — Estilo RPG Cozy](#4-mecánicas-3d)
5. [Estructura de Zonas del Mundo](#5-zonas-del-mundo)
6. [Diagrama de Flujo](#6-diagrama-de-flujo)
7. [Diagrama de Venn — Tecnologías](#7-diagrama-de-venn)
8. [Arquitectura de Componentes](#8-arquitectura-de-componentes)
9. [Base de Datos Supabase](#9-supabase)
10. [Instalación en Windows](#10-instalación-windows)
11. [Guía de Texturizado en Blender](#11-blender-texturizado)
12. [Deploy en Vercel](#12-deploy)
13. [Requisitos SENA Cumplidos](#13-sena)

---

## 1. Visión del Proyecto

### Concepto Central
Un portfolio DOBLE que vive en UNA sola aplicación React. El usuario ve primero un portfolio profesional elegante y con un solo clic accede a un mundo 3D explorable estilo videojuego cozy.

### Inspiraciones Visuales
- **Videojuego RPG cozy** — mundo 3D explorable, física real, personaje controlable
- **Animal Crossing** — estética cozy, colores cálidos, mundo acogedor
- **Studio Ghibli** — naturaleza estilizada, paleta sakura, magia sutil
- **Zelda: Breath of the Wild** — exploración libre, zonas temáticas, descubrimiento

### Diferenciadores Únicos
1. **Avatar real** — `giseella-avatar.glb` modelo 3D de Giseella con vestido floral
2. **Jardín de cerezos** — mundo terracota cálido con árboles sakura low-poly
3. **Transición cinematográfica** — intro con petals falling, paso suave portfolio → mundo 3D
4. **Zonas-proyecto** — cada proyecto del portfolio es una zona interactiva en el mundo

---

## 2. Arquitectura Unificada

```
giseella-world/               ← UN solo proyecto, UN npm install
│
├── 📄 index.html             Punto de entrada HTML
├── 📄 package.json           Dependencias únicas
├── 📄 vite.config.ts         Bundler configurado para GLB + audio
├── 📄 .env.local             Claves Supabase (NO subir a GitHub)
│
├── 📁 public/
│   └── 📁 models/
│       ├── giseella-avatar.glb      👗 Personaje principal (52MB)
│       ├── house_in_lavender_field.glb  🌾 Happy-Farm (53MB)
│       ├── fantasy_eco_city.glb     🏙️ Distrito ciudad (30MB)
│       └── oficina.glb              🏢 Interior oficina (1.4MB)
│
└── 📁 src/
    ├── 📄 App.tsx            Switcher: portfolio ↔ mundo 3D
    ├── 📄 main.tsx           React root
    ├── 📄 store.ts           Estado global (Zustand)
    ├── 📄 supabase.ts        Cliente + helpers Supabase
    │
    ├── 📁 pages/
    │   ├── Portfolio.tsx     Portfolio completo (React SPA)
    │   └── World3D.tsx       Canvas 3D + controles
    │
    ├── 📁 world/
    │   ├── World.tsx         Escena 3D completa
    │   ├── Character.tsx     Giseella avatar (GLB + fallback)
    │   ├── CameraController.tsx  Cámara isométrica suave
    │   └── WeatherSystem.tsx     Pétalos, lluvia, luciérnagas
    │
    ├── 📁 ui/
    │   ├── HUD.tsx           HUD + Minimap + Mobile + Toast + Panels (todo en uno)
    │   ├── LoadingScreen.tsx Pantalla de carga artística
    │   └── IntroScreen.tsx   Cinemática de introducción
    │
    └── 📁 styles/
        ├── globals.css       Reset + variables CSS
        └── portfolio.css     Estilos completos del portfolio
```

### Flujo de vistas
```
npm run dev
     │
     ▼
 App.tsx (view state)
     │
     ├──[view='portfolio']──▶ Portfolio.tsx
     │                              │
     │                    [clic "Mundo 3D"]
     │                              │
     └──[view='world']─────▶ World3D.tsx ──▶ Canvas R3F
                                    │
                             [clic "← Portfolio"]
                                    │
                             vuelve a Portfolio.tsx
```

---

## 3. Sistema de Diseño

### 🎨 Paleta de Colores

```
FONDOS
─────────────────────────────────────────────────
--bg:        #080c18   ← Azul medianoche profundo
--bg2:       #0e1220   ← Fondo de sección oscura
--bg3:       #141828   ← Inputs y elementos nested
--surf:      #1a1f32   ← Cards y paneles
--surf2:     #212640   ← Surface secundaria

ACENTOS PRINCIPALES
─────────────────────────────────────────────────
--sakura:    #ff89b5   ← Rosa sakura (acento principal)
--sakura2:   #ffb8d2   ← Sakura claro
--sakuradk:  #d4608a   ← Sakura oscuro (gradientes)
--gold:      #f0c060   ← Oro cálido (highlights)
--teal:      #00d4aa   ← Teal vibrante (acento secundario)
--teal2:     #60e8cc   ← Teal claro
--purple:    #b060ff   ← Púrpura (ParkNidus)

TEXTO
─────────────────────────────────────────────────
--text:      #f0ece4   ← Crema principal
--text2:     #c8c0b8   ← Texto secundario
--muted:     #7a7888   ← Texto silenciado

COLORES DEL MUNDO 3D
─────────────────────────────────────────────────
Suelo:       #c8855a   ← Terracota cálida (RPG cozy style)
Pasto:       #5a9e40   ← Verde hierba
Caminos:     #d4b896   ← Piedra arenisca
Sakura:      #ff9ec4   ← Hojas cerezo
Cielo:       #f5c8a0   ← Atardecer dorado
Niebla:      #f5d8b8   ← Warm haze
```

### 📐 Tipografía

| Uso | Fuente | Características |
|-----|--------|-----------------|
| Títulos / Display | Playfair Display | Serif elegante, italic para énfasis |
| Cuerpo / UI | Inter | Sans-serif moderna, pesos 300-700 |
| Código / Mono | JetBrains Mono | Para roles técnicos y badges |

### 📏 Espaciado y Bordes
```css
--r:  18px   /* Border radius cards */
--rs: 10px   /* Border radius inputs/small */
```

### 🌟 Efectos Especiales
- **Glassmorphism**: `backdrop-filter: blur(12-22px)` en todos los paneles del HUD
- **Glow Sakura**: `0 0 40px rgba(255,137,181,0.3)` en botones principales
- **Orbs animados**: radial-gradients flotantes en el hero
- **Particle sparkles**: 180 partículas doradas dispersas por el mundo
- **Rings rotatorios**: tres círculos girando alrededor del avatar en el hero

---

## 4. Mecánicas 3D

### Control del Personaje (RPG isométrico)
```
Teclado          Acción
────────────────────────────────────
W / ↑            Mover hacia adelante
S / ↓            Mover hacia atrás
A / ←            Mover izquierda
D / →            Mover derecha
Shift            Correr (velocidad x1.86)
E / Enter        Interactuar con zona
Scroll           Zoom cámara (rango: 8-48 unidades)
Click der+drag   Orbitar cámara
Pinch (móvil)    Zoom en táctil
Joystick UI      Movimiento táctil
```

### Física (Rapier)
- Gravedad: `[0, -30, 0]` — más pesada que defecto para sensación arcade
- CapsuleCollider en el personaje (0.45 radio, 0.32 alto)
- `linearDamping: 3.5` — frenado suave al soltar teclas
- RigidBody `type="fixed"` en todos los edificios y obstáculos

### Cámara Isométrica
```typescript
// Parámetros clave
camDist:  22 unidades  (default)
orbitV:   0.72 rad     (~41° de elevación)
orbitH:   0 rad        (mira al norte por defecto)
LERP pos: 0.055        (suavidad seguimiento)
LERP look:0.08         (suavidad mira)
```

### Sistema de Animaciones del Avatar
1. Carga `giseella-avatar.glb` con `useGLTF`
2. `useAnimations` detecta clips disponibles automáticamente
3. Busca por nombre: `idle` → reposo, `walk` → caminar, `run` → correr
4. Fallback graceful: si el GLB falla → personaje procedural con geometría Three.js
5. El fallback muestra la misma estética: vestido azul floral, pelo largo castaño

### Sistema de Clima
```
🌸 Sakura  →  180 pétalos rosa cayendo en espiral
☀️ Sol     →  Solo atmósfera, sin partículas
🌧️ Lluvia  →  700 gotas de lluvia instanced
🌙 Noche   →  55 luciérnagas flotantes + estrellas
```

Usa `THREE.InstancedMesh` para máxima performance en partículas.

### Logros (Achievements)
Se desbloquean explorando el mundo:
- "Visitaste Happy-Farm 🌾" — llegar a [10,?,10]
- "Visitaste ParkNidus 🚗" — llegar a [-10,?,10]
- "Llegaste al Templo Zen 🌿" — llegar a [0,?,-45]

---

## 5. Zonas del Mundo

```
MAPA DEL MUNDO (vista superior, ejes X-Z)
══════════════════════════════════════════════════

                 [🌿 TEMPLO ZEN]
                  (Contacto) Z=-54

        [🏡 MANSIÓN]         [⚗️ SKILLS LAB]
        (Sobre Mí)           (Habilidades)
          X=-22,Z=-22        X=22,Z=-22

    [🎬 CINE-VERSE]  [🤖 ZONA IA]  [🏢 TERRASOFT]
      X=-10,Z=-10     X=0,Z=-16    X=10,Z=-10

              ☀️[HERO PLAZA]☀️
              Fuente + Crystal
                X=0, Z=0

    [🚗 PARKNIDUS]              [🌾 HAPPY-FARM]
      X=-10,Z=10                  X=10,Z=10


══════════════════════════════════════════════════
Bordes: Bosque de árboles sakura + birch
        (28 árboles en anillo r=36-60)
```

### Descripción de Zonas

| Zona | Posición | Modelo | Color |
|------|----------|--------|-------|
| 🌸 Hero Plaza | [0,0,0] | Fuente + cristal flotante | Sakura #ff89b5 |
| 🏡 Mansión | [-22,0,-22] | CozyHouse + oficina.glb | Oro #f0c060 |
| ⚗️ Skills Lab | [22,0,-22] | CozyHouse + totems néon | Verde #88ce02 |
| 🌿 Templo Zen | [0,0,-54] | Torii + edificio | Teal #00d4aa |
| 🌾 Happy-Farm | [10,0,10] | house_in_lavender_field.glb | Lima #88ce02 |
| 🚗 ParkNidus | [-10,0,10] | Pedestal néon | Púrpura #b060ff |
| 🏢 Terrasoft | [10,0,-10] | Pedestal néon | Cyan #61dafb |
| 🎬 Cine-Verse | [-10,0,-10] | Pedestal néon | Rojo #ff6060 |
| 🤖 Zona IA | [0,0,-16] | Pedestal néon | Oro #f0c060 |
| 🏙️ Ciudad | [0,0,-32] | fantasy_eco_city.glb | Cyan |

---

## 6. Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────────┐
│                        npm run dev                              │
│                            │                                    │
│                      App.tsx loads                              │
│                            │                                    │
│               ┌────────────┴────────────┐                      │
│          view='portfolio'          view='world'                 │
│               │                         │                      │
│     ┌─────────▼──────────┐    ┌─────────▼──────────┐          │
│     │   Portfolio.tsx     │    │   World3D.tsx       │          │
│     │                     │    │                     │          │
│     │ ┌─────────────────┐ │    │ Canvas R3F          │          │
│     │ │ Navbar          │ │    │  ├─ LoadingScreen   │          │
│     │ │ Hero + Avatar   │ │    │  ├─ IntroScreen     │          │
│     │ │ [MUNDO 3D BTN]──┼─┼───┼──┼─ HUD / Minimap   │          │
│     │ │ Sobre Mí        │ │    │  ├─ PanelOverlay    │          │
│     │ │ Skills (tabs)   │ │    │  └─ Physics World:  │          │
│     │ │ Servicios       │ │    │      ├─ Ground       │          │
│     │ │ Proyectos       │ │    │      ├─ Trees        │          │
│     │ │ Testimonios     │ │    │      ├─ Buildings    │          │
│     │ │ Contacto→Supa  │ │    │      ├─ ProjectZones │          │
│     │ │ Footer          │ │    │      ├─ Character    │          │
│     │ └─────────────────┘ │    │      ├─ Weather      │          │
│     │                     │    │      └─ Camera       │          │
│     └─────────────────────┘    └──────────┬──────────┘          │
│                                           │                      │
│                               [← Portfolio btn]                 │
│                                           │                      │
│                               vuelve a Portfolio.tsx            │
└─────────────────────────────────────────────────────────────────┘

FLUJO DE DATOS (Zustand Store):
────────────────────────────────────────────────
Usuario presiona E cerca de zona
         │
         ▼
setActivePanel('happyfarm')
         │
         ▼
PanelOverlay detecta activePanel !== null
         │
         ▼
Renderiza modal con ProjectPanel('happyfarm')
         │
         ▼
Usuario puede: ver info / ir a GitHub / cerrar
         │
         ▼
setActivePanel(null) → modal desaparece

FLUJO DE CARGA:
────────────────────────────────────────────────
Vite sirve index.html
    │
    ▼ useProgress() de @react-three/drei
LoadingScreen muestra barra progreso
    │ (progreso 0→100)
    ▼ isLoaded = true
IntroScreen muestra cinematica (3 pasos)
    │ Usuario hace clic "Entrar al Mundo"
    ▼ introComplete = true + toggleAudio()
Mundo 3D visible + HUD activo
    │ GLBs grandes se cargan en background
    ▼ house.glb + city.glb cargan con Suspense
```

---

## 7. Diagrama de Venn

```
╔═══════════════════════════════════════════════════════════╗
║         TECNOLOGÍAS DEL PROYECTO                          ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  ┌─────────────────────────────────────────────────┐     ║
║  │              REACT ECOSYSTEM                    │     ║
║  │                                                 │     ║
║  │   ┌──────────────┐    ┌────────────────────┐   │     ║
║  │   │  PORTFOLIO   │    │    MUNDO 3D        │   │     ║
║  │   │  (2D Page)   │    │  (Canvas/WebGL)    │   │     ║
║  │   │              │    │                    │   │     ║
║  │   │ Framer Motion│    │ @react-three/fiber │   │     ║
║  │   │ CSS Modules  │    │ @react-three/drei  │   │     ║
║  │   │ useInView    │    │ @react-three/rapier│   │     ║
║  │   │ AnimatePresence    │ Three.js           │   │     ║
║  │   │              │    │ Instanced Mesh     │   │     ║
║  │   └──────┬───────┘    └────────┬───────────┘   │     ║
║  │          │                     │               │     ║
║  │          └────────┬────────────┘               │     ║
║  │                   │                            │     ║
║  │        ┌──────────▼──────────┐                │     ║
║  │        │   COMPARTIDO        │                │     ║
║  │        │                     │                │     ║
║  │        │ React 18            │                │     ║
║  │        │ TypeScript          │                │     ║
║  │        │ Vite                │                │     ║
║  │        │ Zustand (store.ts)  │                │     ║
║  │        │ Supabase            │                │     ║
║  │        │ GSAP                │                │     ║
║  │        └─────────────────────┘                │     ║
║  └─────────────────────────────────────────────────┘     ║
║                                                           ║
║  BACKEND/INFRA:                                           ║
║  ┌─────────────────────────────────────────────────┐     ║
║  │  Supabase (PostgreSQL)                          │     ║
║  │  ├── contact_messages  (formulario)             │     ║
║  │  ├── project_views     (analytics)              │     ║
║  │  └── testimonials      (datos)                  │     ║
║  └─────────────────────────────────────────────────┘     ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 8. Arquitectura de Componentes

```
App.tsx
├── AnimatePresence
│   ├── Portfolio.tsx (view='portfolio')
│   │   ├── Navbar (scroll-aware, mobile hamburger)
│   │   ├── Hero (typewriter, counters, avatar rings)
│   │   ├── WorldCTASection (btn "MUNDO 3D")
│   │   ├── SobreMi (Reveal animations, float cards)
│   │   ├── Habilidades (tabs: frontend|backend|tools)
│   │   │   └── SkillBar × 18 (animated width)
│   │   ├── Servicios (6 cards con hover ::before)
│   │   ├── Proyectos (filter: all|web|3d|backend)
│   │   ├── Testimonios (glassmorphism cards)
│   │   ├── Contacto (form → Supabase)
│   │   ├── Footer
│   │   └── FloatingWorldBtn (fixed right)
│   │
│   └── World3D.tsx (view='world')
│       ├── LoadingScreen (progress bar + tips)
│       ├── IntroScreen (3 pasos cinematicos)
│       ├── HUD (top-right: audio, help, section)
│       ├── Minimap (bottom-right + weather)
│       ├── PanelOverlay (modal about/skills/contact)
│       ├── AchievementToast (bottom-center)
│       ├── MobileControls (joystick virtual)
│       └── KeyboardControls → Canvas → Physics
│           └── World.tsx
│               ├── Lighting (directional + ambient + points)
│               ├── Sky/Fog (warm sunset or night)
│               ├── Ground (terracotta + paths)
│               ├── TreeForest (32 border + 11 inner)
│               ├── WorldProps (benches + lanterns + flowers)
│               ├── HeroIsland (fountain + crystal)
│               ├── SectionBuildings
│               │   ├── AboutMansion + oficina.glb
│               │   ├── SkillsLab + NeonTotems
│               │   └── ZenTemple (contact)
│               ├── SceneModels
│               │   ├── house_in_lavender_field.glb (Suspense)
│               │   └── fantasy_eco_city.glb (Suspense)
│               ├── ProjectZone × 5
│               ├── SupabaseNature (birch trees async)
│               ├── SkyDecor (clouds + 5 kites)
│               ├── WeatherSystem (petals|rain|fireflies)
│               ├── ContactShadows
│               ├── Sparkles (180 world particles)
│               ├── Character.tsx
│               │   ├── GiseellaAvatar (giseella-avatar.glb)
│               │   └── FallbackGirl (procedural geometry)
│               └── CameraController
```

---

## 9. Supabase

### Tablas requeridas
Ejecutar en Supabase → SQL Editor:

```sql
-- Mensajes de contacto
CREATE TABLE IF NOT EXISTS contact_messages (
  id         BIGSERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT,
  message    TEXT NOT NULL,
  is_read    BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_insert" ON contact_messages FOR INSERT TO anon WITH CHECK (true);

-- Analytics de proyectos
CREATE TABLE IF NOT EXISTS project_views (
  id         BIGSERIAL PRIMARY KEY,
  project_id TEXT NOT NULL,
  viewed_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE project_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_insert_views" ON project_views FOR INSERT TO anon WITH CHECK (true);

-- Testimonios (editables desde dashboard)
CREATE TABLE IF NOT EXISTS testimonials (
  id           BIGSERIAL PRIMARY KEY,
  author_name  TEXT NOT NULL,
  author_role  TEXT,
  content      TEXT NOT NULL,
  stars        INT DEFAULT 5,
  is_visible   BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read" ON testimonials FOR SELECT TO anon USING (is_visible = true);
```

### Variables de entorno (.env.local)
```
VITE_SUPABASE_URL=https://oldvgciksrwujujimepg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

---

## 10. Instalación Windows

### Requisitos
- Node.js 18+ → https://nodejs.org (versión LTS)
- Git (opcional)

### Pasos en PowerShell
```powershell
# 1. Ir a la carpeta del proyecto
cd C:\Users\TuNombre\Downloads\giseella-world

# 2. Instalar dependencias (una sola vez, ~2-3 min)
npm install

# 3. Iniciar servidor de desarrollo
npm run dev
# Abre automáticamente: http://localhost:3000
```

### Comandos útiles
```powershell
npm run dev      # Servidor con hot-reload
npm run build    # Compilar para producción → carpeta dist/
npm run preview  # Previsualizar el build de producción
```

### Posibles problemas Windows
```
Error: 'node' no reconocido
→ Instalar Node.js y reiniciar PowerShell

Error de permisos npm
→ Ejecutar PowerShell como Administrador:
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

Puerto 3000 ocupado
→ En vite.config.ts cambiar: server: { port: 3001 }

Los modelos GLB tardan
→ Normal: giseella-avatar.glb=52MB, house.glb=53MB, city.glb=30MB
→ Se cargan con Suspense en background, el mundo funciona antes
```

---

## 11. Guía de Texturizado en Blender

### Objetivo
Transferir la apariencia de la foto PNG al modelo 3D GLB del avatar usando Texture Baking.

### Paso 1 — Importar en Blender
```
File → Import → glTF 2.0 → selecciona giseella-avatar.glb
File → Import → Images → selecciona la foto PNG de referencia
```

### Paso 2 — Preparar UV Map
```
1. Selecciona el mesh del personaje
2. Tab → Edit Mode
3. A (seleccionar todo)
4. U → Smart UV Project
   - Angle Limit: 66°
   - Island Margin: 0.02
5. Tab → Object Mode
```

### Paso 3 — Crear Textura Nueva
```
1. UV Editor → New Image
   - Name: "giseella_baked"
   - Width: 2048 px
   - Height: 2048 px
   - Color: Negro
2. En el material del personaje → Shader Editor
3. Add → Texture → Image Texture
4. Selecciona "giseella_baked" (NO conectar el nodo todavía)
5. Asegúrate que este nodo esté SELECCIONADO (borde blanco)
```

### Paso 4 — Stencil / UV Project (proyección de foto)
```
Método A — Stencil Mapping:
1. Object Mode → Properties → Material
2. Shader Editor → Add → Texture → Image Texture
3. Conecta al Base Color
4. En Image selecciona tu foto PNG
5. Add → Vector → UV Map
6. Conecta UV Map al Image Texture Vector
7. Ajusta la escala con Mapping node hasta que encaje

Método B — UV Project Modifier:
1. Modifier Properties → Add → UV Project
2. Image: tu foto PNG
3. Projectors: agrega la cámara frontal
4. Alinea la cámara con la vista frontal del personaje:
   Numpad 1 → vista frontal
   Object → Set Camera from view
```

### Paso 5 — Baking
```
1. Render Engine: Cycles (no Eevee)
2. Bake Settings:
   - Bake Type: Diffuse
   - Pass Filter: Color ✓ (desmarcar Direct e Indirect)
3. Selecciona el mesh del personaje
4. Bake → (esperar 30 seg - 2 min)
5. Image Editor → guardas "giseella_baked.png"
```

### Paso 6 — Aplicar y Exportar
```
1. Shader Editor: conecta "giseella_baked" al Base Color
2. Cambia Render Mode a Material Preview para ver resultado
3. File → Export → glTF 2.0
   - Format: GLB (un solo archivo)
   - Include: Selected Objects
   - Geometry: Apply Modifiers ✓
   - Materials: Export ✓
   - Textures: Automatically Pack Into File ✓
4. Target: máximo 40MB
```

### Tip de Optimización
```
Antes de exportar:
- Image → Scale Image → 1024x1024 (si el archivo pesa mucho)
- Decimate modifier para reducir polígonos: Ratio 0.5
- Esto debería dar un GLB de ~15-25MB
```

---

## 12. Deploy en Vercel

### Requisito: subir a GitHub primero
```powershell
cd giseella-world
git init
git add .
git commit -m "🌸 Initial commit - Giseella World Portfolio"
git remote add origin https://github.com/gpsanchezr/giseella-world.git
git push -u origin main
```

### Configurar en Vercel
1. Ir a → https://vercel.com → New Project
2. Import desde GitHub → `giseella-world`
3. Framework Preset: **Vite**
4. Root Directory: `.` (dejar en blanco)
5. Environment Variables (obligatorio):
   ```
   VITE_SUPABASE_URL      = https://oldvgciksrwujujimepg.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGci...
   ```
6. Deploy ✅

**URL resultado:** `https://giseella-world.vercel.app`

### Dominio personalizado (opcional)
```
Vercel → Settings → Domains → Add → gisee.dev
```

---

## 13. Requisitos SENA Cumplidos ✅

| Criterio | Implementación | Archivo |
|----------|---------------|---------|
| ✅ Hero section | Nombre, rol, CTA, avatar animado | Portfolio.tsx línea 95 |
| ✅ Sobre mí | Grid con foto + float cards | Portfolio.tsx línea 175 |
| ✅ Habilidades técnicas | 18 skills con barras animadas | Portfolio.tsx línea 205 |
| ✅ Mínimo 3 servicios | 6 servicios con cards hover | Portfolio.tsx línea 245 |
| ✅ Mínimo 2 proyectos | 6 proyectos con filtro | Portfolio.tsx línea 285 |
| ✅ Testimonios | 3 cards glassmorphism | Portfolio.tsx línea 355 |
| ✅ Formulario contacto | React form → Supabase DB | Portfolio.tsx línea 405 |
| ✅ Email + redes | GitHub, LinkedIn, WhatsApp | Portfolio.tsx línea 390 |
| ✅ Footer completo | Grid 3 cols + copyright | Portfolio.tsx línea 435 |
| ✅ Diseño responsive | Media queries 1100/768/480px | portfolio.css línea 480 |
| ✅ Navegación intuitiva | Navbar fija + scroll suave | Portfolio.tsx línea 50 |
| ✅ UX/UI profesional | Animaciones Framer Motion | Todo el proyecto |
| ✅ SEO básico | Meta tags + Open Graph | index.html |
| ✅ Carga rápida | Lazy loading + Suspense | World3D.tsx |
| ✅ Marca personal | Logo 🌸 GS, paleta sakura | globals.css |
| ✅ CV descargable | Botón en navbar y footer | Portfolio.tsx |
| ✅ WordPress+Divi | Servicio ofrecido aparte(opcional), skill incluido | Portfolio.tsx |
| ✅ Creatividad extra | Mundo 3D interactivo RPG | world/ completo |

**Nota SENA:** Este portfolio supera los requisitos mínimos al incluir un mundo 3D interactivo único, física real, avatar personalizado, base de datos en tiempo real y deploy profesional.

---

## Stack Tecnológico Completo

```
FRONTEND
├── React 18 + TypeScript
├── Vite 5 (bundler ultra-rápido)
├── Framer Motion (animaciones suaves)
├── Zustand (estado global mínimo)
└── CSS Variables + Custom CSS

3D / WEBGL
├── Three.js r165
├── @react-three/fiber (React renderer)
├── @react-three/drei (helpers: Text, Float, etc.)
├── @react-three/rapier (física Rapier WASM)
└── InstancedMesh (partículas performantes)

BACKEND / DATOS
├── Supabase (PostgreSQL as a Service)
├── Row Level Security (RLS)
└── REST API directa (sin SDK pesado)

MODELOS 3D
├── giseella-avatar.glb (personaje principal)
├── house_in_lavender_field.glb (Happy-Farm)
├── fantasy_eco_city.glb (distrito ciudad)
├── oficina.glb (interior mansión)
└── Supabase CDN: BirchTree_1-5.gltf, Bush.gltf, Flower.gltf

AUDIO
└── Supabase CDN: background.mp3, open.mp3, close.mp3
```

---

*Documentación generada: Mayo 2026 · Versión 2.0 — "Sakura Edition"*  
*Hecho con 🌸 React · Three.js · Supabase · Framer Motion · Blender*

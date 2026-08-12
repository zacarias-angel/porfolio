# Porfolio — Plan & Documentación

Panel tipo "gestión" que muestra los proyectos como una línea de tiempo visual.
Todo cabe en pantalla (sin scroll vertical), con tema oscuro/claro e idioma Español/Inglés.

---

## 1. Objetivo

Un porfolio personal en React donde cada proyecto aparece en una **línea de tiempo**
inferior con barras. Una barra grande = año; cada año expande 12 barras chicas = meses.
Al mover la línea de tiempo se navegan los proyectos. Vista tipo dashboard/panel de gestión.

## 2. Stack

- **React 18 + TypeScript** (Vite)
- **Tailwind CSS v4** para estilos
- **lucide-react** para íconos
- Sin router, sin librería de i18n (contexto propio ligero)

## 3. Arquitectura

```
src/
  main.tsx            -> punto de entrada
  App.tsx             -> layout + estado de selección (año/mes/proyecto)
  settings.tsx        -> contexto de tema (dark/light) + idioma (es/en)
  i18n.ts             -> traducciones y nombres de meses
  data/projects.ts    -> LISTA DE PROYECTOS (acá se edita el contenido)
  components/
    TopBar.tsx        -> título + toggle de tema + toggle de idioma
    Sidebar.tsx       -> lista navegable de proyectos
    ProjectDetail.tsx -> detalle del proyecto (imagen, descripción, stack, estado)
    Timeline.tsx      -> línea de tiempo (barras de año y de mes, animadas)
```

### Modelo de selección

- `year`, `month`, `projectId` viven en `App`.
- Clic en una **barra de año** → expande sus 12 meses (y resetea mes/proyecto).
- Clic en un **mes**:
  - 0 proyectos → sin selección.
  - 1 proyecto → se selecciona directo.
  - >1 proyecto → se muestra una grilla de tarjetas para elegir.
- Clic en un proyecto (sidebar o grilla) → sincroniza año/mes + detalle.

## 4. Animación de la línea de tiempo

- Barras con `transform-origin: bottom` → crecen hacia arriba.
- Hover: `scale-y` crece un poco (`hover:scale-y-110/125`).
- Barra activa (año o mes seleccionado): color ámbar + animación `bar-breathe`
  (definida en `src/index.css`).

## 5. Cómo agregar / editar proyectos

Todo está en **`src/data/projects.ts`**. Cada proyecto es un objeto:

```ts
{
  id: 'mi-proyecto',           // único, sirve de seed para la imagen
  title: 'Mi Proyecto',
  description: { es: '...', en: '...' },
  year: 2024,
  month: 5,                    // 1 = Enero ... 12 = Diciembre
  tags: ['React', 'Node.js'],
  status: 'completed',         // 'completed' | 'active' | 'planned'
  image: 'https://picsum.photos/seed/mi-proyecto/900/620',  // imagen de muestra
  url: undefined,              // opcional: link real al repo (ej. GitHub)
  homepage: undefined,         // opcional: link a demo en vivo (ej. Vercel)
}
```

- Las imágenes son de muestra (picsum.photos). Para usar capturas reales, reemplazá
  `image` por la URL de tu imagen (o un archivo en `public/`).
- `url` opcional: cuando lo llenes, aparece el botón "Ver en GitHub".

## 6. Local

```bash
npm install
npm run dev      # desarrollo (http://localhost:5173)
npm run build    # producción -> carpeta dist/
npm run preview  # previsualizar el build
```

## 7. Deploy en Coolify + dominio (receta DatabaseMart)

El proyecto trae un `Dockerfile` (build con Node → servir con nginx, puerto 80).

1. Subí esta carpeta a un repo de GitHub (o usá el deploy por Docker/archivo en Coolify).
2. En **Coolify**: `+ New` → Application → conectá el repo → detecta el Dockerfile automáticamente.
3. En el dominio de la app, poné **`http://porfolio.angelzacarias.uk`** (HTTP, no HTTPS).
4. En **DatabaseMart** → tu VPS → Manage → **Networking → Add Domain**:
   - Domain: `porfolio.angelzacarias.uk`
   - Port: **`80`** (porque las apps las sirve Traefik en el puerto 80)
   - **Enable Free SSL**
5. En **Cloudflare** → DNS → registro **A** → `porfolio.angelzacarias.uk` → `108.181.215.247`
   en **nube gris (DNS only)**.
6. Listo: `https://porfolio.angelzacarias.uk`.

> Recordatorio clave: el **panel Coolify** se mapea al puerto interno `8000`,
> pero las **apps** se mapean al puerto interno `80` (Traefik).

## 8. Funcionalidades

- [x] Sin scroll vertical (todo en pantalla, layout 100vh)
- [x] Línea de tiempo inferior: barra grande = año, 12 barras = meses
- [x] Expandir meses con varios proyectos (grilla de tarjetas)
- [x] Animación de crecimiento de barras (hover + activo)
- [x] Título, descripción (inventada/lore) e imagen de muestra
- [x] Vista tipo panel de gestión
- [x] Tema oscuro / claro
- [x] Idioma Español / Inglés
- [x] Datos centralizados en un solo archivo (fácil de editar)

## 9. Próximos pasos (opcional)

- Reemplazar imágenes de muestra por capturas reales.
- Agregar los `url` reales de GitHub.
- Wildcard en DatabaseMart (`*.angelzacarias.uk → 80`) para no mapear cada subdominio.
- Vista responsive para mobile.

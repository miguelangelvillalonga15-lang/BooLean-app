# BooLean 🐾 — aprendé data con Boo

App móvil tipo Duolingo para aprender data desde cero hasta nivel pro: Excel, SQL, estadística y análisis de datos, en español rioplatense. Te acompaña **Boo**, una gata analista que te felicita, te da pistas y se decepciona si cortás la racha.

Lecciones de hasta 10 minutos: **concepto → práctica → repaso de lo que te costó**.

## Qué tiene esta versión (MVP)

- Bienvenida con Boo: tu nombre y tu meta diaria (5, 10 o 15 minutos).
- Inicio con tu día en forma de planilla (racha 🔥, XP ⭐, meta), puntaje por lección y gráfico de la semana.
- Pestaña «Aprender» con el camino de lecciones, que se desbloquean en orden.
- Lecciones con ejercicios de opción múltiple, completar y ordenar, con corrección automática.
- Pistas de Boo (cuestan 2 XP) y repaso al final de los ejercicios que fallaste.
- Vibración al acertar o errar.
- Pantalla de resultado con XP, aciertos, racha y mensaje de Boo.
- Glosario que se va desbloqueando con cada lección.
- Unidad 1 «¿Qué es un dato?» con 4 lecciones.

Todo funciona sin internet: el contenido está en archivos JSON y el progreso se guarda en el celular.

## Identidad visual

BooLean mezcla **datos** y **gata**:

- **Paleta sacada de Boo:** verde lima de sus ojos, rosa de su nariz y fondo tinta (`src/theme/index.ts`).
- **Estética de planilla:** cuadrícula de fondo, letra monoespaciada (JetBrains Mono) para números y etiquetas, y tu día como una tabla `hoy.csv`.
- **Tu avance como gráficos:** barras con el puntaje de cada lección y el XP de la semana con la línea de tu meta.
- **El booleano en todos lados:** al responder ves `respuesta = VERDADERO` o `FALSO`, y el resultado es un ticket con `perfecta = VERDADERO/FALSO`.
- **Huellitas 🐾** de Boo uniendo las lecciones del camino.

## Animaciones y sonidos

Para que aprender se sienta como un juego:

- **Boo viva:** respira, parpadea, mueve una oreja, te mira cuando elegís una opción y, si todavía no practicaste hoy, duerme (con *zzz*) hasta que tocás «Empezar». Si la tocás en el inicio, ronronea con ojos de corazón.
- **Al responder:** lluvia de `VERDADERO` / `TRUE` / `1` si acertás; temblor y Boo sorprendida si no. Con 3 aciertos seguidos aparece el combo y Boo se pone anteojos de sol 😎; con 5, la barra de progreso se prende fuego.
- **Al terminar:** el ticket se imprime renglón por renglón, el XP cuenta hacia arriba, la racha gira como un cuentakilómetros y, si fue perfecta, cae un sello. Mientras, Boo mira un ovillo que rueda.
- **En el camino:** cuando desbloqueás una lección, Boo camina hasta ella dejando huellitas 🐾.
- **En el inicio:** los gráficos crecen, la llama de la racha se agranda con los días y, al cumplir la meta, la celda `meta_cumplida` se tipea sola de FALSO a VERDADERO.
- **Sonidos** (con botón para silenciar en el inicio): miau al acertar, ronroneo al terminar, clic de teclado al escribir y más. Son provisorios, sintetizados con `scripts/generar-sonidos.py`. Se pueden reemplazar por grabaciones reales en `assets/sonidos/` (¡un miau de la verdadera Boo!).

Las animaciones usan [Reanimated](https://docs.swmansion.com/react-native-reanimated/) y el sonido `expo-audio`; las dos funcionan en Expo Go.

## Boo

Boo está dibujada en SVG (`src/components/Boo.tsx`) a partir de la gata real: pelo largo blanco y negro, capucha negra con una mancha alrededor del ojo, ojos verdes y nariz rosa. Tiene nueve ánimos: `feliz`, `contenta`, `presentandose`, `pensando`, `triste`, `decepcionada`, `sorprendida`, `enamorada` y `dormida`, y puede usar anteojos de sol. El ícono de la app también es Boo.

## Cómo probarla en tu celular

Necesitás una compu con [Node.js](https://nodejs.org) (versión LTS) y tu Android.

1. En el celular, instalá **Expo Go** desde Google Play.
2. En la compu, abrí una terminal en esta carpeta y corré:

   ```bash
   npm install
   npm start
   ```

3. Va a aparecer un código QR. Abrí Expo Go en el celular y escanealo (la compu y el celular tienen que estar en la misma red WiFi).

Mientras `npm start` esté corriendo, cada cambio que hagas en el código se ve al instante en el celular.

> También podés verla en el navegador con `npm run web`.

## Comandos útiles

| Comando | Para qué sirve |
|---|---|
| `npm start` | Levanta la app para verla con Expo Go |
| `npm run web` | La abre en el navegador |
| `npm test` | Corre los tests (lógica de corrección, racha y validación del contenido) |
| `npm run typecheck` | Revisa errores de tipos de TypeScript |
| `npm run lint` | Revisa el estilo del código |

## Cómo está organizado

```
src/
├── app/                  Pantallas (cada archivo es una pantalla)
│   ├── (tabs)/           Pestañas de abajo
│   │   ├── index.tsx     Inicio: racha, XP, unidad actual y meta del día
│   │   ├── aprender.tsx  Mapa de lecciones
│   │   └── glosario.tsx  Glosario
│   ├── bienvenida.tsx    Primera vez: Boo se presenta
│   ├── leccion/[id].tsx  Lección: conceptos, ejercicios y repaso
│   └── resultado.tsx     Resultado de la lección
├── content/              Contenido del curso (JSON)
│   ├── curso.json        Niveles, unidades y orden de lecciones
│   ├── boo.json          Frases de Boo
│   ├── glosario.json     Términos del glosario
│   ├── unidades/u1/      Lecciones de la Unidad 1
│   └── index.ts          Registro de lecciones
├── engine/               Lógica pura (corrección, racha, sesión, progreso)
├── store/progress.ts     Progreso guardado en el celular
├── components/           Piezas visuales (Boo, ejercicios, botones, tarjetas, tablas)
├── theme/                Colores y medidas
└── types/content.ts      Formato del contenido
__tests__/                Tests
```

## Cómo agregar una lección

1. Creá el JSON en `src/content/unidades/<unidad>/` (copiá uno existente como base).
2. Agregá su `id` en la lista `lecciones` de la unidad en `src/content/curso.json`.
3. Importala en `src/content/index.ts` y sumala a `listaLecciones`.
4. Corré `npm test`: si algo del JSON está mal (una respuesta que no existe, un id repetido), el test te avisa.

### Tipos de paso

| `tipo` | Qué es | Campos clave |
|---|---|---|
| `concepto` | Explicación con Boo | `titulo`, `texto`, `boo` (ánimo) |
| `ejemplo` | Ejemplo guiado | `titulo`, `texto`, `tabla` (opcional) |
| `opcion_multiple` | Elegir una opción | `opciones`, `correcta` |
| `completar` | Completar el `___` | `texto`, `respuestas`, `banco` (opcional: palabras para elegir) |
| `ordenar` | Ordenar ítems | `items`, `ordenCorrecto` |

Todos los ejercicios llevan `consigna` y `explicacion`, y pueden llevar `pista` y `tabla`. En los textos, lo que va entre `**dobles asteriscos**` se muestra en negrita. En las tablas, una celda `""` se muestra como *(vacío)*.

## Próximos pasos

- [ ] Vidas (corazones)
- [ ] Logros y medallas
- [ ] Recordatorio diario («Boo te extraña 😿»)
- [ ] Sección «Repasar» con los ejercicios que costaron (ya se guardan en `paraRepasar`)
- [ ] Unidad 2: Excel desde cero
- [ ] Desafío por nivel y ejercicios de cálculo numérico
- [ ] Ejercicios de SQL corridos en la app con SQLite
- [ ] IA que explica los errores (vía Supabase, nunca con la API key en la app)
- [ ] Métricas de uso para analizar retención y abandono

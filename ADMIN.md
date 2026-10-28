# Panel de administración (`/admin`)

Sirve para publicar outfits en la web sin tocar código: subes la foto desde el
ordenador, eliges sección / estilo / época, pones las prendas con su link y
guardas. También recoge las solicitudes del formulario de «De seguidores».

La web sigue funcionando aunque no configures nada: mientras no haya base de
datos, muestra los outfits que están escritos en `lib/outfits.ts`.

---

## Puesta en marcha (una sola vez, ~10 minutos)

### 1. Crear la base de datos en Supabase

1. Entra en <https://supabase.com> y crea una cuenta (plan gratis).
2. **New project** → nombre `flayfind`, región *West EU (Ireland)*, y guarda la
   contraseña que te genera.
3. Cuando termine, abre **SQL Editor** → **New query**, pega todo el contenido
   de `supabase/schema.sql` de este repo y pulsa **Run**. Eso crea las dos
   tablas y el sitio donde se guardan las fotos.
4. Ve a **Project Settings → API** y copia dos valores:
   - **Project URL** (algo como `https://abcd1234.supabase.co`)
   - **service_role** secret (en *Project API keys*; es la clave larga privada)

> La clave `service_role` solo se usa en el servidor. No la pegues en el código
> ni la compartas: quien la tenga puede leer y borrar la base de datos.

> Si ya tenías la base de datos creada antes, vuelve al SQL Editor y ejecuta
> otra vez `supabase/schema.sql` entero. Es seguro: todo está escrito para
> poder repetirse. Hace falta cada vez que añadimos algo (los estilos
> personalizados, y ahora los accesorios dentro de Hombre y Mujer, las
> secciones por estilo y sus traducciones).

### 2. Generar tus claves de acceso al panel

En tu ordenador, dentro de la carpeta del proyecto:

```bash
node scripts/admin-setup.mjs "la contraseña que quieras usar"
```

Te imprime tres variables (`ADMIN_PASSWORD_HASH`, `ADMIN_TOTP_SECRET`,
`ADMIN_SESSION_SECRET`) y la clave que hay que meter en la app del móvil.

### 3. Añadir las variables en Vercel

En Vercel → proyecto **flayfind** → **Settings → Environment Variables**, añade
estas cinco para *Production*, *Preview* y *Development*:

| Nombre | Valor |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | el Project URL del paso 1 |
| `SUPABASE_SERVICE_ROLE_KEY` | la clave `service_role` del paso 1 |
| `ADMIN_PASSWORD_HASH` | lo que imprimió el script |
| `ADMIN_TOTP_SECRET` | lo que imprimió el script |
| `ADMIN_SESSION_SECRET` | lo que imprimió el script |

Después, **Deployments → … → Redeploy** para que las coja.

### 4. Poner el código de 6 cifras en el móvil

Abre Google Authenticator o Authy → *Añadir código* → *Introducir clave de
configuración* → nombre `Flayfind admin`, clave = `ADMIN_TOTP_SECRET`, tipo
*basada en tiempo*.

### 5. Entrar y importar lo que ya hay

Abre `https://www.flayfind.com/admin`, entra con tu contraseña y el código de 6
cifras, y pulsa **Importar los outfits del código**: copia a la base de datos
los 24 outfits y los de seguidores que hoy están escritos en el código, para
poder editarlos desde el panel.

---

## Uso diario

- **👁 Vista previa 1 nov** (arriba en el panel, hasta el lanzamiento): abre
  `/vista-previa`, la portada tal como se verá el 1 de noviembre a las 00:00
  con lo que tengas guardado ahora (outfits visibles, De seguidores, sin cuenta
  atrás). Solo funciona con tu sesión del panel: a cualquier otro le pide el
  login. No cambia la web pública ni cuenta en Umami. Si la barra negra avisa de
  que «Ocultar todos» seguirá activo, es que lo encendiste después del
  lanzamiento.
- **Outfits** → `+ Añadir outfit`: nombre, sección (Hombre / Mujer / Hombre y
  Mujer), estilo, época, foto y prendas. «Hombre y Mujer» lo hace salir en las
  dos secciones, que es lo normal para los accesorios. Cada prenda lleva
  nombre, precio y link; si el link es de Uidbuy y se te olvida tu código de
  referido (`ref=UWSV3X`), se añade solo.
- **Outfits** → **Varios con IA**: eliges varias fotos a la vez y Claude busca
  cada prenda en la lista de Masterspread (masterspread.com, la misma hoja de
  productos). Por cada foto te deja un outfit editable: nombre, sección, estilo,
  época y las prendas con link de Uidbuy (con tu código) y precio en euros
  (pasado desde dólares al cambio del día).
  - **Coincide**: mismo modelo, seguro. **Revísalo**: probable, mira la foto
    del producto. **Link no encontrado**: no está en la lista; búscalo tú y
    pégalo, o quita esa prenda. El color no importa: el link enseña todos.
  - «Otras opciones de la lista» cambia la prenda por otra de las candidatas.
  - «Guardar todos» no deja guardar mientras quede algún «Link no
    encontrado». Antes del 1 de noviembre los guarda ocultos (enciende
    «Ocultar todos») y salen solos con el lanzamiento; después, los guarda sin
    publicar.
  - El lote se queda en ese navegador hasta que lo guardas, aunque recargues.
  - Tarda alrededor de un minuto por foto y cuesta unos céntimos por outfit
    (lo cobra Anthropic, aparte).

  > **Una vez:** necesita una clave de Claude. En console.anthropic.com →
  > **API Keys** → *Create Key*, cópiala y añádela en Vercel → Settings →
  > Environment Variables como `ANTHROPIC_API_KEY` (Production). Luego
  > Deployments → los tres puntos del último → **Redeploy**. En *Billing* pon
  > saldo y, si quieres, un límite de gasto.
- **Outfits** → **Actualizar todos**: vuelve a mirar la foto de cada outfit guardado,
  busca cada prenda en la lista de Masterspread y propone el **link más barato del
  mismo modelo**, al lado de lo que tiene ahora (los links antiguos que no son de
  Uidbuy salen marcados). Revisa y pulsa «Aplicar». Un outfit con alguna prenda en
  «Link no encontrado» no se aplica hasta que pongas su link o la quites. Cuesta
  unos céntimos por outfit (Claude). Los accesorios no entran.
- **Accesorios**: la sección ya no enseña productos; lleva a masterspread.com, donde
  están todos. No hace falta crear outfits de accesorios.
- **Outfits** → **Crear con IA**: montas un outfit con prendas de la lista de
  Masterspread (las buscas tú, o pulsas «Que Claude elija el outfit» con la
  sección, estilo, época y, si quieres, una idea y un presupuesto). Después
  «Crear la foto»: Google (Gemini) hace la foto desde arriba sobre la alfombra
  azul, copiando el estilo de tus fotos y usando las fotos de las prendas.
  «Crear otra versión» hace otra; elige la que más te guste y guarda. Se guarda
  igual que «Varios con IA» (oculto hasta el 1 de noviembre).
  - En «Cuántos outfits» eliges cuántos monta Claude de una vez (hasta 8), todos
    distintos; las fotos se crean una detrás de otra y luego «Guardar» los guarda
    todos. «+ Outfit a mano» añade uno vacío para buscar tú las prendas.
  - «+ Añadir otra tanda» añade otro bloque de creación con sus propios ajustes
    (por ejemplo, 4 de Hombre elegante de verano y 4 de Mujer streetwear de
    invierno), hasta 10 tandas. «Crear todas» las monta todas de una vez, una
    detrás de otra; «Crear solo estos» monta solo esa tanda. Cada outfit guarda
    la sección, estilo y época de su tanda.
  - La ropa de la foto sale muy parecida a la del producto, pero la crea una
    IA: revísala antes de guardar para que nadie compre algo distinto.
  - Cada foto cuesta unos 5 céntimos (lo cobra Google, aparte).

  > **Una vez:** necesita una clave de Google. En aistudio.google.com →
  > **Get API key** → *Create API key*, cópiala y añádela en Vercel como
  > `GEMINI_API_KEY` (Production) y haz **Redeploy**. Las fotos no tienen plan
  > gratis: en aistudio.google.com activa la facturación (*Set up billing*) y, si
  > quieres, pon un límite de gasto en Google Cloud → Billing → Budgets.
- **Sin marcas en los nombres**: ni el nombre del outfit ni el de las prendas
  pueden llevar una marca o un modelo (Nike, Essentials, Dior, Air Force, B22…);
  se usan nombres genéricos como «Camiseta básica» o «Sudadera con diseño». Claude
  ya los escribe así, el panel marca en rojo los que lleven marca y no deja
  guardar un outfit nuevo hasta quitarla. La lista de marcas está en
  `lib/marcas.ts`.
- **Cambio de tienda en Weidian**: si una tienda de las hojas pasa sus productos a
  otra (el 28 de octubre: SHARK → Little Penguin), Masterspread se actualiza solo,
  pero los outfits guardados conservan el link viejo. Mientras quede alguno, en
  *Outfits* sale un aviso naranja con «Cambiar los N links»: cambia solo el link
  (a Uidbuy con tu código), no el precio ni el nombre. La lista de números viejos →
  nuevos está en ; para otro cambio de tienda,
  pídelo y se añade otra lista igual.
- **Descargar fotos (.zip)** (en Outfits): baja todas las fotos de los outfits en
  un zip, en carpetas por sección y estilo (Hombre/Streetwear/…), con el nombre
  de cada outfit. Se prepara en tu navegador; con muchas fotos tarda un poco.
- **De seguidores** → igual, más autor, Instagram y puesto de la semana.
  Ahora la pestaña «De seguidores» está oculta en la web (también después del
  1 de noviembre). Para volver a enseñarla, cambia `MOSTRAR_SEGUIDORES` a `true`
  en `lib/site.ts`.
- **Estilos** → son las subsecciones de dentro de Hombre y Mujer. Crea las
  tuyas («Y2K», «Vestidos»…), marca en qué sección salen (una o las dos) y, si
  quieres, escribe su nombre en cada idioma; lo que dejes en blanco se ve con
  el nombre en español. Los cinco de fábrica (Accesorios, Streetwear, Gym,
  Elegante, Plumíferos) salen en las dos secciones y están traducidos a los 7
  idiomas. No se puede borrar un estilo que algún outfit esté usando: primero
  cámbiales el estilo.
- **Ocultar** deja el outfit guardado pero fuera de la web. **Borrar** es
  definitivo.
- **Ocultar todos / Mostrar todos** (arriba del todo en *Outfits*) quita de
  golpe todo el catálogo mientras preparas outfits nuevos. La pestaña Outfits
  enseña entonces «Nuevos outfits en camino», una casilla para que la gente deje
  su email y le avises, y el enlace a la lista de productos, que lleva a
  masterspread.com (solo si `MOSTRAR_LISTA_PRODUCTOS` es `true` en `lib/site.ts`;
  ahora se enseña). Puedes seguir
  creando y editando outfits: nadie los ve hasta que pulses «Mostrar todos», y al
  hacerlo vuelve exactamente lo que estaba visible (lo que ocultaste uno a uno
  sigue oculto). Si ocultas todos los outfits uno a uno, la web también enseña
  ese aviso, nunca los outfits antiguos del código.
- **Avisos**: los emails de quienes pidieron que les avises. «Copiar emails» los
  copia separados por comas (pégalos en **CCO** para que nadie vea los de los
  demás) o «Descargar CSV». Solo dieron permiso para ese aviso: cuando les
  escribas, **bórralos** («Borrar todos»). La política de privacidad promete
  borrarlos tras avisar y, como máximo, a los 12 meses.

> **Una vez:** «Ocultar todos» y «Avisos» necesitan dos tablas nuevas. Abre
> Supabase → SQL Editor → New query, pega todo `supabase/schema.sql` y pulsa
> **Run** (es seguro repetirlo). Hasta entonces la web se queda oculta (lo marca
> `OUTFITS_OCULTOS_POR_DEFECTO` en `lib/site.ts`) y los emails que deje la gente se
> guardan en **Solicitudes** con el nombre «Aviso de nuevos outfits», para que no
> se pierda ninguno.
- **Solicitudes**: lo que manda la gente por el formulario. Puedes marcarlas
  como leídas, aprobadas o descartadas.
- Los cambios aparecen en la web en menos de un minuto (la portada se
  refresca cada 60 segundos).
- Red de seguridad: si la base de datos se queda **sin ningún outfit** (o no
  responde), la web vuelve a mostrar los que están escritos en
  `lib/outfits.ts` en vez de quedarse vacía.

## Analítica (Umami)

Solo se cuentan dos cosas, para que el panel de Umami no se llene de ruido:

**Clics en los enlaces de registro** (cada sitio con su nombre):

| Evento | Dónde está |
| --- | --- |
| `registro_barra_arriba` | la barra negra de arriba del todo |
| `registro_popup_bienvenida` | el popup de los 800 $ |
| `registro_aviso_comprar` | el aviso que sale al pulsar «Comprar» |
| `registro_ficha_outfit` | el botón dentro de la ficha de un outfit |
| `registro_boton_final` | el botón grande debajo del catálogo |
| `registro_como_participar` | el paso 2 de «Cómo participar» |
| `registro_formulario_seguidores` | el formulario de «De seguidores» |

**Clics en cerrar**: `cierre_popup` (la X del popup), `cierre_popup_ahora_no`
(«Ahora no, solo estoy mirando») y `cierre_aviso_comprar` (cerrar el aviso de
comprar).

**Masterspread**: `abrir_masterspread_filtros` (el botón azul pequeño entre los
filtros y los outfits) y `abrir_masterspread_final` (la tarjeta «¿Buscas otra
prenda?» debajo de los outfits, encima de Discord y Telegram).

**Mientras los outfits están ocultos**: `aviso_outfits` (pulsar «Avisarme») y
`abrir_masterspread` (abrir la lista de productos, que lleva a masterspread.com).

Ya no se cuentan los clics en las prendas, en Discord, en los Instagram ni en
los selectores de idioma y moneda.

## Seguridad

- Entrar pide contraseña **y** código de 6 cifras que cambia cada 30 segundos.
- La sesión dura 8 horas y luego pide entrar otra vez.
- Tras 8 intentos fallidos seguidos, ese visitante espera 10 minutos.
- `/admin` no se indexa en Google.
- La política de privacidad está en `/privacidad` (enlazada en el pie de página y
  en los dos formularios). El contacto que aparece es `CONTACT_EMAIL` de
  `lib/site.ts`.
- Si pierdes el móvil: vuelve a ejecutar el script del paso 2 y cambia las
  variables en Vercel.

## Agente de compras: Uidbuy

Desde el 18 de octubre de 2026 la web manda a **Uidbuy** (antes Hipobuy). Todo
está en `lib/site.ts`: `LINKS.registro` (el link con tu `ref`), `CODIGO` (800,
para quien se registra sin el link) y `REFERIDO`. Los textos dicen que los
**800 $ de descuento** solo se consiguen así, con el link o el código, y que el
**40% en el envío** es el cupón de bienvenida de Uidbuy. Si cambia la oferta,
cambia esas frases en `lib/i18n/*.ts` (7 idiomas).

Las promesas sobre Uidbuy (revisión de calidad, posventa, un solo paquete,
envíos a todo el mundo) son las que dice su propia web. No añadas otras
(fotos, reembolsos, asistencia 24/7…) sin comprobarlas antes.

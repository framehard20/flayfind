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

- **Outfits** → `+ Añadir outfit`: nombre, sección (Hombre / Mujer / Hombre y
  Mujer), estilo, época, foto y prendas. «Hombre y Mujer» lo hace salir en las
  dos secciones, que es lo normal para los accesorios. Cada prenda lleva
  nombre, precio y link; si el link es de Hipobuy y se te olvida el código de
  invitación, se añade solo.
- **De seguidores** → igual, más autor, Instagram y puesto de la semana.
- **Estilos** → son las subsecciones de dentro de Hombre y Mujer. Crea las
  tuyas («Y2K», «Vestidos»…), marca en qué sección salen (una o las dos) y, si
  quieres, escribe su nombre en cada idioma; lo que dejes en blanco se ve con
  el nombre en español. Los cinco de fábrica (Accesorios, Streetwear, Gym,
  Elegante, Plumíferos) salen en las dos secciones y están traducidos a los 7
  idiomas. No se puede borrar un estilo que algún outfit esté usando: primero
  cámbiales el estilo.
- **Ocultar** deja el outfit guardado pero fuera de la web. **Borrar** es
  definitivo.
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
| `registro_popup_bienvenida` | el popup del −25% |
| `registro_aviso_comprar` | el aviso que sale al pulsar «Comprar» |
| `registro_ficha_outfit` | el botón dentro de la ficha de un outfit |
| `registro_boton_final` | el botón grande debajo del catálogo |
| `registro_como_participar` | el paso 2 de «Cómo participar» |
| `registro_formulario_seguidores` | el formulario de «De seguidores» |

**Clics en cerrar**: `cierre_popup` (la X del popup), `cierre_popup_ahora_no`
(«Ahora no, solo estoy mirando») y `cierre_aviso_comprar` (cerrar el aviso de
comprar).

Ya no se cuentan los clics en las prendas, en Discord, en los Instagram ni en
los selectores de idioma y moneda.

## Seguridad

- Entrar pide contraseña **y** código de 6 cifras que cambia cada 30 segundos.
- La sesión dura 8 horas y luego pide entrar otra vez.
- Tras 8 intentos fallidos seguidos, ese visitante espera 10 minutos.
- `/admin` no se indexa en Google.
- Si pierdes el móvil: vuelve a ejecutar el script del paso 2 y cambia las
  variables en Vercel.

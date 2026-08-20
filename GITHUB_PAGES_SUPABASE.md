# Despliegue estático: GitHub Pages + Supabase

La variante estática se compila con `VITE_STATIC_SUPABASE=true`. GitHub Pages entrega la interfaz y Supabase conserva el inicio de sesión por correo, las políticas de privacidad, métricas, notas, fechas y adjuntos.

## 1. Crear el esquema privado en Supabase

1. Abre tu proyecto de Supabase y entra en **SQL Editor**.
2. Crea una consulta nueva.
3. Copia el contenido completo de `supabase/github-pages-schema.sql` desde este repositorio.
4. Ejecuta la consulta una sola vez. Es idempotente: puede ejecutarse de nuevo sin crear duplicados.

> El script activa **Row Level Security**. Cada fila queda limitada a `auth.uid()`, por lo que una persona autenticada solo puede consultar y modificar sus propios datos.

## 2. Configurar acceso por correo

En Supabase abre **Authentication → URL Configuration** y agrega estas direcciones en **Redirect URLs**:

```text
http://localhost:5173/
https://TU_USUARIO.github.io/TU_REPOSITORIO/
```

Sustituye `TU_USUARIO` y `TU_REPOSITORIO` por los valores reales de GitHub. Verifica también que el proveedor **Email** esté habilitado en **Authentication → Providers**.

## 3. Añadir secretos al repositorio de GitHub

En GitHub abre tu repositorio y entra en **Settings → Secrets and variables → Actions**. Crea estos dos secretos de repositorio:

| Secreto | Valor |
|---|---|
| `VITE_SUPABASE_URL` | La **Project URL** base, por ejemplo `https://tu-proyecto.supabase.co`. |
| `VITE_SUPABASE_ANON_KEY` | La clave pública **Publishable** o **anon**. |

No agregues `service_role`, claves secretas ni contraseñas en GitHub Pages.

## 4. Activar GitHub Pages

1. En GitHub abre **Settings → Pages**.
2. En **Build and deployment**, selecciona **GitHub Actions**.
3. Haz push a la rama `main` o ejecuta manualmente el workflow **Deploy static tracker to GitHub Pages** en la pestaña **Actions**.
4. Cuando finalice, GitHub mostrará la URL pública de la plataforma.

## 5. Prueba final

Abre la URL de Pages, solicita un enlace de acceso con tu correo, abre ese enlace y confirma que puedes guardar una tarea, una nota y una fecha límite. Si el enlace de correo vuelve a una URL incorrecta, revisa las **Redirect URLs** de Supabase.

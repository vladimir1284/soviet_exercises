# Guía de Acceso para Revisión en Google Play Store (App Access Guide)

Este documento describe el mecanismo de autenticación habilitado para los revisores de Google Play Store y los pasos requeridos para configurar las credenciales de prueba en **Clerk** y en la **Google Play Console**.

---

## 1. Contexto y Problema Resuelto

Cuando SovietFit se distribuye como APK / TWA (Trusted Web Activity) o PWA empaquetada:
- **Google OAuth está deshabilitado / bloqueado** dentro de Android WebViews debido a políticas de seguridad de Google.
- **Magic Link / Código OTP por email** exige al revisor humano o sistema automatizado de Google Play acceder a una bandeja de entrada externa, lo que suele provocar rechazos en la revisión por falta de credenciales directas.

### Solución Implementada
Se habilitó el flujo de autenticación mediante **Email y Contraseña** (`user/pass`), disponible directamente en la pantalla de inicio de la aplicación tanto para Iniciar Sesión ("Iniciar sesión con Contraseña") como para Crear Cuenta ("Crear cuenta con Contraseña").

---

## 2. Paso a Paso: Crear la Cuenta de Prueba para el Revisor

Para que el equipo de revisión de Google Play pueda ingresar sin depender de un correo activo que reciba códigos, crea una cuenta de prueba previamente verificada en el Dashboard de Clerk.

### Pasos en Clerk Dashboard:
1. Accede a la consola de [Clerk Dashboard](https://dashboard.clerk.com).
2. Selecciona el proyecto **SovietFit**.
3. En el menú lateral, ve a **Users** y haz clic en **+ Create User**.
4. Completa los datos:
   - **Email address**: ej. `reviewer@sovietfit.app` (o el correo de pruebas que elijas).
   - **Password**: ej. `SovietFitReviewer2025!` (una contraseña segura).
5. Una vez creado el usuario, asegúrate de que el estado del Email figure como **Verified** (Verificado). Si no está verificado, edita el email y márcalo como verificado para omitir el paso de código OTP.

---

## 3. Configuración en Google Play Console

Para proporcionar acceso al revisor de Play Store:

1. Inicia sesión en [Google Play Console](https://play.google.com/console).
2. Selecciona tu aplicación **SovietFit**.
3. En el menú de la izquierda, navega a **Contenido de la aplicación** (*App content*) -> **Acceso a aplicaciones** (*App access*).
4. Haz clic en **Gestionar** (*Manage*).
5. Selecciona la opción: **"Toda la funcionalidad o parte de ella está restringida"** (*All or some functionality is restricted*).
6. Haz clic en **+ Añadir instrucciones** (*+ Add new instructions*).
7. Completa el formulario de credenciales:
   - **Nombre de las credenciales**: `Cuenta de Prueba para Revisión (Reviewer Account)`
   - **Nombre de usuario o Email**: `reviewer@sovietfit.app` (el correo creado en Clerk).
   - **Contraseña**: `SovietFitReviewer2025!` (la contraseña configurada en Clerk).
   - **Instrucciones adicionales**:
     > 1. Abre la aplicación SovietFit.
     > 2. En la pantalla principal de autenticación, haz clic en el botón **"Iniciar sesión con Contraseña"** (o **"Sign in with Password"**).
     > 3. Ingresa el correo y la contraseña proporcionados.
     > 4. Haz clic en **"Iniciar sesión"** para acceder a todas las funcionalidades de la aplicación (seguimiento de ejercicios, ciclos de entrenamiento, estadísticas y ajustes).

---

## 4. Verificación del Funcionamiento en la App

1. Abre la pantalla de autenticación de SovietFit (`/`).
2. Verifica que se muestran las opciones:
   - **Iniciar sesión con Código** / **Crear cuenta con Código**
   - **Iniciar sesión con Contraseña** / **Crear cuenta con Contraseña**
3. Haz clic en **Iniciar sesión con Contraseña**, ingresa las credenciales del revisor y confirma que la aplicación inicia sesión e ingresa directamente a `/app`.

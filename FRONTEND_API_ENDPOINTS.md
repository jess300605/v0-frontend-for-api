# Endpoints que el Frontend Necesita

Este documento lista todos los endpoints que el frontend está usando. El backend Laravel debe implementar estos endpoints para que la aplicación funcione correctamente.

## Estado Actual

### ✅ Endpoints que YA EXISTEN en el backend:
- `POST /api/usuarios` - Crear usuario (registro) ✓
- `GET /api/usuarios` - Listar usuarios ✓
- `GET /api/usuarios/{id}` - Ver usuario específico ✓
- `PUT /api/usuarios/{id}` - Actualizar usuario ✓
- `DELETE /api/usuarios/{id}` - Eliminar usuario ✓
- `POST /api/usuarios/{id}/cambiar-contraseña` - Cambiar contraseña ✓

### ❌ Endpoints que FALTAN en el backend:
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/logout` - Cerrar sesión
- `GET /api/me` - Obtener usuario actual
- `POST /api/refresh` - Refrescar token

---

## Endpoints de Autenticación (FALTAN)

El frontend necesita estos endpoints para autenticación con Sanctum:

### 1. Login
\`\`\`
POST /api/auth/login
\`\`\`

**Request Body:**
\`\`\`json
{
  "email": "usuario@example.com",
  "contraseña": "password123"
}
\`\`\`

**Response (200):**
\`\`\`json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "usuario": {
      "id": 1,
      "nombre": "Juan Pérez",
      "email": "usuario@example.com",
      "rol": "admin",
      "activo": true
    },
    "token": "1|abc123...",
    "tipo_token": "Bearer",
    "expira_en": 3600
  }
}
\`\`\`

**Response (401):**
\`\`\`json
{
  "success": false,
  "message": "Credenciales incorrectas"
}
\`\`\`

### 2. Logout
\`\`\`
POST /api/logout
Headers: Authorization: Bearer {token}
\`\`\`

**Response (200):**
\`\`\`json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
\`\`\`

### 3. Usuario Actual
\`\`\`
GET /api/me
Headers: Authorization: Bearer {token}
\`\`\`

**Response (200):**
\`\`\`json
{
  "success": true,
  "data": {
    "usuario": {
      "id": 1,
      "nombre": "Juan Pérez",
      "email": "usuario@example.com",
      "rol": "admin",
      "activo": true
    }
  }
}
\`\`\`

### 4. Refrescar Token
\`\`\`
POST /api/refresh
Headers: Authorization: Bearer {token}
\`\`\`

**Response (200):**
\`\`\`json
{
  "success": true,
  "data": {
    "usuario": {
      "id": 1,
      "nombre": "Juan Pérez",
      "email": "usuario@example.com",
      "rol": "admin",
      "activo": true
    },
    "token": "2|xyz789...",
    "tipo_token": "Bearer",
    "expira_en": 3600
  }
}
\`\`\`

---

## Ejemplo de Implementación en Laravel

Crea un archivo `app/Http/Controllers/AuthController.php`:

\`\`\`php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Usuario;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\JsonResponse;

class AuthController extends Controller
{
    /**
     * Login
     * POST /api/auth/login
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'contraseña' => 'required|string',
        ]);

        $usuario = Usuario::where('email', $request->email)->first();

        if (!$usuario || !Hash::check($request->contraseña, $usuario->contraseña)) {
            return response()->json([
                'success' => false,
                'message' => 'Credenciales incorrectas'
            ], 401);
        }

        if (!$usuario->activo) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario desactivado'
            ], 403);
        }

        // Crear token con Sanctum
        $token = $usuario->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login exitoso',
            'data' => [
                'usuario' => $usuario,
                'token' => $token,
                'tipo_token' => 'Bearer',
                'expira_en' => 3600
            ]
        ]);
    }

    /**
     * Logout
     * POST /api/logout
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sesión cerrada exitosamente'
        ]);
    }

    /**
     * Usuario actual
     * GET /api/me
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'usuario' => $request->user()
            ]
        ]);
    }

    /**
     * Refrescar token
     * POST /api/refresh
     */
    public function refresh(Request $request): JsonResponse
    {
        $usuario = $request->user();
        
        // Eliminar token actual
        $request->user()->currentAccessToken()->delete();
        
        // Crear nuevo token
        $token = $usuario->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'data' => [
                'usuario' => $usuario,
                'token' => $token,
                'tipo_token' => 'Bearer',
                'expira_en' => 3600
            ]
        ]);
    }
}
\`\`\`

Agrega las rutas en `routes/api.php`:

\`\`\`php
use App\Http\Controllers\AuthController;

// Rutas de autenticación (sin auth)
Route::post('/auth/login', [AuthController::class, 'login']);

// Rutas protegidas (requieren auth:sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
});
\`\`\`

---

## Otros Endpoints que el Frontend Usa

### Dashboard
- `GET /api/dashboard` - Obtener métricas del dashboard

### Productos
- `GET /api/productos` - Listar productos
- `GET /api/productos/{id}` - Ver producto
- `POST /api/productos` - Crear producto (requiere auth)
- `PUT /api/productos/{id}` - Actualizar producto (requiere auth)
- `DELETE /api/productos/{id}` - Eliminar producto (requiere auth)

### Ventas
- `GET /api/ventas` - Listar ventas
- `GET /api/ventas/{id}` - Ver venta
- `POST /api/ventas` - Crear venta (requiere auth)
- `POST /api/ventas/{id}/cancelar` - Cancelar venta (requiere auth)

### Reportes
- `GET /api/reportes/ventas` - Reporte de ventas
- `GET /api/reportes/productos` - Reporte de productos

---

## Notas Importantes

1. **Todos los endpoints deben devolver JSON** con la estructura:
   \`\`\`json
   {
     "success": true/false,
     "message": "Mensaje descriptivo",
     "data": { ... }
   }
   \`\`\`

2. **Los endpoints protegidos** requieren el header:
   \`\`\`
   Authorization: Bearer {token}
   \`\`\`

3. **CORS debe estar configurado** para permitir:
   - Origin: `http://172.20.176.1:3000`
   - Methods: GET, POST, PUT, DELETE, OPTIONS
   - Headers: Content-Type, Authorization, X-Requested-With

4. **Sanctum debe estar configurado** en `config/sanctum.php`:
   \`\`\`php
   'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'localhost,127.0.0.1,172.20.176.1:3000')),

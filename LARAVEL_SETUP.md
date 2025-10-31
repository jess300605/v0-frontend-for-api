# Configuración del Backend Laravel

## Requisitos Previos
- PHP 8.1 o superior
- Composer
- MySQL o MariaDB

## Instalación del Backend

### 1. Instalar Dependencias
\`\`\`bash
cd /ruta/a/tu/proyecto/laravel
composer install
\`\`\`

### 2. Configurar Base de Datos
Edita el archivo `.env` en tu proyecto Laravel:
\`\`\`env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nombre_de_tu_base_de_datos
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_contraseña
\`\`\`

### 3. Ejecutar Migraciones
\`\`\`bash
php artisan migrate
\`\`\`

### 4. Configurar CORS

Instala el paquete de CORS si no lo tienes:
\`\`\`bash
composer require fruitcake/laravel-cors
\`\`\`

Edita `config/cors.php`:
\`\`\`php
<?php

return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:3000', 'http://127.0.0.1:3000'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
\`\`\`

O en `app/Http/Kernel.php`, agrega el middleware CORS:
\`\`\`php
protected $middleware = [
    // ... otros middleware
    \Fruitcake\Cors\HandleCors::class,
];
\`\`\`

### 5. Verificar Rutas API

Asegúrate de que tu archivo `routes/api.php` tenga las rutas necesarias:
\`\`\`php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\VentaController;
use App\Http\Controllers\AuthController;

// Rutas de autenticación
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/user', [AuthController::class, 'user'])->middleware('auth:sanctum');

// Rutas de productos
Route::get('/productos', [ProductoController::class, 'index']);
Route::get('/productos/{id}', [ProductoController::class, 'show']);
Route::post('/productos', [ProductoController::class, 'store']);
Route::put('/productos/{id}', [ProductoController::class, 'update']);
Route::delete('/productos/{id}', [ProductoController::class, 'destroy']);

// Rutas de ventas
Route::get('/ventas', [VentaController::class, 'index']);
Route::get('/ventas/{id}', [VentaController::class, 'show']);
Route::post('/ventas', [VentaController::class, 'store']);

// Rutas de reportes
Route::get('/reportes/ventas', [VentaController::class, 'reporteVentas']);
Route::get('/reportes/productos', [ProductoController::class, 'reporteProductos']);
Route::get('/dashboard/metricas', [VentaController::class, 'metricas']);
\`\`\`

### 6. Iniciar el Servidor
\`\`\`bash
php artisan serve
\`\`\`

El servidor debería iniciar en `http://127.0.0.1:8000`

### 7. Verificar la Conexión

Abre tu navegador y visita:
- `http://localhost:8000/api/productos` - Debería devolver un JSON con la lista de productos

## Solución de Problemas

### Error: "Failed to fetch"
- Verifica que el servidor Laravel esté corriendo
- Verifica que el puerto 8000 no esté bloqueado por el firewall
- Verifica la configuración de CORS

### Error: "CORS policy"
- Asegúrate de que `http://localhost:3000` esté en `allowed_origins` en `config/cors.php`
- Verifica que el middleware CORS esté activo

### Error: "Route not found"
- Verifica que las rutas estén definidas en `routes/api.php`
- Ejecuta `php artisan route:list` para ver todas las rutas disponibles

### Error de Base de Datos
- Verifica las credenciales en `.env`
- Asegúrate de que la base de datos exista
- Ejecuta `php artisan migrate` para crear las tablas

## Estructura de Respuestas API

Todas las respuestas de la API deben seguir este formato:

### Respuesta Exitosa
\`\`\`json
{
  "success": true,
  "data": [...] // o {} para objetos individuales
}
\`\`\`

### Respuesta de Error
\`\`\`json
{
  "success": false,
  "message": "Mensaje de error descriptivo"
}
\`\`\`

## Modelo Producto

Asegúrate de que tu modelo `Producto` tenga el campo `url_imagen` en el array `$fillable`:

\`\`\`php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Producto extends Model
{
    protected $fillable = [
        'nombre',
        'descripcion',
        'precio',
        'categoria',
        'codigo_sku',
        'stock',
        'stock_minimo',
        'url_imagen', // ← Importante para las imágenes personalizadas
        'activo',
    ];

    protected $casts = [
        'precio' => 'decimal:2',
        'stock' => 'integer',
        'stock_minimo' => 'integer',
        'activo' => 'boolean',
    ];
}
\`\`\`

## Validación en el Controlador

Ejemplo de validación en `ProductoController`:

\`\`\`php
public function store(Request $request)
{
    $validated = $request->validate([
        'nombre' => 'required|string|max:150',
        'descripcion' => 'nullable|string',
        'precio' => 'required|numeric|min:0',
        'categoria' => 'required|string|max:100',
        'codigo_sku' => 'nullable|string|max:100|unique:productos',
        'stock' => 'required|integer|min:0',
        'stock_minimo' => 'nullable|integer|min:0',
        'url_imagen' => 'nullable|url|max:500', // ← Validación para URL de imagen
        'activo' => 'boolean',
    ]);

    $producto = Producto::create($validated);

    return response()->json([
        'success' => true,
        'data' => $producto
    ]);
}

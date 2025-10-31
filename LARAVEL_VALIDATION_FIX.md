# Solución: Error al Crear Productos

## Problema Identificado

El frontend envía los datos correctamente, pero Laravel los está rechazando en la validación.

## Solución

Necesitas actualizar tu archivo `app/Http/Requests/ProductoRequest.php` en Laravel con estas reglas de validación:

\`\`\`php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductoRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // O implementa tu lógica de autorización
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $rules = [
            'nombre' => 'required|string|max:150',
            'descripcion' => 'nullable|string',
            'precio' => 'required|numeric|min:0',
            'categoria' => 'required|string|max:100',
            'codigo_sku' => 'nullable|string|max:100|unique:productos,codigo_sku,' . $this->route('id'),
            'stock' => 'required|integer|min:0',
            'stock_minimo' => 'required|integer|min:0',
            'url_imagen' => 'nullable|string|max:500', // ← IMPORTANTE: acepta URL como string
            'activo' => 'nullable|boolean',
        ];

        // Si es actualización, el SKU puede ser el mismo
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $rules['codigo_sku'] = 'nullable|string|max:100|unique:productos,codigo_sku,' . $this->route('id');
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre del producto es obligatorio',
            'precio.required' => 'El precio es obligatorio',
            'precio.numeric' => 'El precio debe ser un número',
            'precio.min' => 'El precio no puede ser negativo',
            'categoria.required' => 'La categoría es obligatoria',
            'stock.required' => 'El stock es obligatorio',
            'stock.integer' => 'El stock debe ser un número entero',
            'stock_minimo.required' => 'El stock mínimo es obligatorio',
        ];
    }
}
\`\`\`

## Verificación del Modelo

También asegúrate de que tu modelo `app/Models/Producto.php` tenga `url_imagen` en el array `$fillable`:

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
        'url_imagen',  // ← IMPORTANTE: debe estar aquí
        'activo',
    ];

    protected $casts = [
        'precio' => 'decimal:2',
        'stock' => 'integer',
        'stock_minimo' => 'integer',
        'activo' => 'boolean',
    ];

    // ... resto del modelo
}
\`\`\`

## Cómo Verificar el Error Exacto

Para ver el error exacto de validación, agrega esto temporalmente en tu método `store`:

\`\`\`php
public function store(ProductoRequest $request): JsonResponse
{
    try {
        // Agregar log temporal para debug
        \Log::info('Datos recibidos:', $request->all());
        
        $datos = $request->validated();
        
        \Log::info('Datos validados:', $datos);
        
        // ... resto del código
    } catch (\Illuminate\Validation\ValidationException $e) {
        \Log::error('Error de validación:', $e->errors());
        
        return response()->json([
            'success' => false,
            'message' => 'Error de validación',
            'errors' => $e->errors()
        ], 422);
    } catch (\Exception $e) {
        \Log::error('Error al crear producto:', [
            'message' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Error al crear producto',
            'error' => $e->getMessage()
        ], 500);
    }
}
\`\`\`

Luego revisa los logs en `storage/logs/laravel.log` para ver exactamente qué está fallando.

## Pasos para Resolver

1. Actualiza `ProductoRequest.php` con las reglas de validación correctas
2. Verifica que `Producto.php` tenga `url_imagen` en `$fillable`
3. Agrega los logs temporales al método `store`
4. Intenta crear un producto nuevamente
5. Revisa `storage/logs/laravel.log` para ver los errores exactos
6. Comparte los logs conmigo para ayudarte más

## Nota sobre Autenticación

Tu controlador requiere autenticación Sanctum para crear productos. Si no estás enviando el token de autenticación, también fallará. Pero como dijiste que actualizar productos sí funciona, asumo que la autenticación está correcta.

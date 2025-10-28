import type { Producto } from "./api"

export function getProductImage(producto: Producto | string): string {
  if (typeof producto === "object" && producto.url_imagen) {
    return producto.url_imagen
  }

  // Get product name from object or use string directly
  const productName = typeof producto === "object" ? producto.nombre : producto
  const name = productName.toLowerCase()

  // Map product names to appropriate image queries
  if (name.includes("sofa") || name.includes("sofá")) {
    return "/modern-sofa.png"
  }
  if (name.includes("mesa")) {
    return "/wooden-dining-table.png"
  }
  if (name.includes("silla")) {
    return "/modern-chair.png"
  }
  if (name.includes("cama")) {
    return "/modern-bed-bedroom.jpg"
  }
  if (name.includes("lampara") || name.includes("lámpara")) {
    return "/table-lamp-lighting.jpg"
  }
  if (name.includes("escritorio")) {
    return "/office-desk-furniture.jpg"
  }
  if (name.includes("estante") || name.includes("librero")) {
    return "/cozy-bookshelf.png"
  }
  if (name.includes("comoda") || name.includes("cómoda")) {
    return "/dresser-bedroom-furniture.jpg"
  }
  if (name.includes("armario") || name.includes("closet")) {
    return "/wardrobe-closet-furniture.jpg"
  }
  if (name.includes("espejo")) {
    return "/wall-mirror-decor.jpg"
  }
  if (name.includes("alfombra")) {
    return "/area-rug-carpet.jpg"
  }
  if (name.includes("cortina")) {
    return "/window-curtains.jpg"
  }

  // Default furniture image
  return "/modern-living-room.png"
}

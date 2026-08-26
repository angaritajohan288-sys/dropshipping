# Mejora visual de la tienda — Organizador de cables

**Estado:** auditoría de la previsualización privada completada. El producto continúa en Borrador; no se activaron pagos, campañas, publicación ni compras.

## Hallazgos de la ficha actual

| Área | Hallazgo | Riesgo o impacto | Mejora propuesta |
|---|---|---|---|
| Encabezado | La marca visible es el texto genérico “Mi tienda”. | Reduce claridad y confianza al llegar a la ficha. | Definir una identidad visual neutral y profesional en el encabezado, sin promesas comerciales exageradas. |
| Precio | Se presenta como `$69.900,00`. | No deja explícito que el valor está en COP. | Mantener el precio configurado y mejorar el contexto visual con un bloque informativo de moneda/entrega, sin alterar precios. |
| Galería | La imagen principal muestra accesorios de demostración dentro del estuche. | Puede interpretarse como que los accesorios se incluyen. | Reforzar cerca del selector el aviso de que cables y dispositivos no están incluidos; no reutilizar ni editar imágenes de proveedor para campañas. |
| Variantes | El selector combina 12 opciones sin guía visual inmediata. | Puede provocar elección errónea de tamaño/color. | Añadir un bloque breve de orientación de variante antes del selector y conservar el selector nativo. |
| Compra | El CTA “Agregar al carrito” compite visualmente con un botón dinámico de PayPal. | Un método de pago incompleto puede confundir; no se debe habilitar producción. | Revisar la opción visual de botones de pago acelerado sin activar pasarelas ni modificar la configuración de pagos. |
| Confianza | El plazo internacional y las condiciones aparecen dentro de párrafos extensos. | La información crítica se encuentra tarde. | Crear bloques visuales compactos sobre entrega internacional, salpicaduras y accesorios no incluidos. |
| Jerarquía | Los beneficios se repiten entre la descripción y las secciones inferiores. | La ficha se siente extensa y menos escaneable. | Convertir beneficios en una secuencia de tres mensajes cortos y diferenciados. |

## Límites de diseño

Los ajustes deben conservar la afirmación **resistente a salpicaduras**, no “impermeable”; indicar que no es para inmersión; y no sugerir que cables, cargadores, audífonos o dispositivos se incluyen. El uso de imágenes del proveedor queda limitado a la ficha de Borrador mientras se obtiene contenido propio.

## Ajustes visuales priorizados

1. Fortalecer el primer bloque de compra con un contexto breve de entrega, variante y accesorios de demostración.
2. Reducir la repetición y convertir los beneficios verificados en una jerarquía más escaneable.
3. Ajustar la identidad visual de encabezado, tipografía, botones y espaciado para una experiencia más consistente.
4. Revisar y, si el tema lo permite sin tocar pasarelas, ocultar el botón dinámico que muestre un método de pago no operativo.

## Ajustes aplicados el 25 de agosto de 2026

| Ajuste | Resultado | Estado seguro |
|---|---|---|
| Descripción de producto | El encabezado HTML grande se cambió de `h2` a `h3` y pasó a decir **“Organiza tus accesorios en un solo lugar”**. Se conservaron los beneficios, el aviso de accesorios no incluidos, la resistencia a salpicaduras y el texto de entrega. | Shopify confirma que el producto sigue en `DRAFT`; no se publicó ni se modificaron pagos. |
| Primer bloque “Imagen con texto” | El encabezado se refinó a **“Todo en su lugar”** con el preajuste visual “Encabezado 4”, manteniendo el texto explicativo existente. | El ajuste fue guardado desde el editor del tema; no cambia catálogo, variantes ni pasarela. |
| Botones de compra | Se conservaron “Agregar al carrito” y el botón de pago dinámico para no alterar el flujo actual ni activar una pasarela distinta. | No se realizaron cambios de pago, checkout o publicación. |

## Nota de verificación

La URL privada de previsualización previamente creada continuó mostrando el encabezado histórico después de la actualización. La ficha administrativa y la respuesta de Shopify confirman la descripción nueva. Debe generarse una previsualización privada nueva antes de una revisión visual final, sin activar el producto ni el canal de Tienda online.

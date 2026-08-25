# Hallazgos de checkout simulado

Fecha de revisión: 2026-08-25.

La URL de carrito de Black S carga correctamente el checkout de Shopify para el producto “Estuche Organizador Resistente a Salpicaduras para Cables y Accesorios”. El resumen muestra cantidad 1, precio COP 69.900, envío “Envío internacional incluido”, ventana de 15 a 25 días hábiles, costo de envío GRATIS y total COP 69.900.

El formulario muestra Colombia, ciudad Barranquilla y provincia Atlántico. El pago ofrece Tarjeta de crédito con Visa, Mastercard, American Express y Diners Club. Los campos sensibles de tarjeta están vacíos y protegidos; no se completó ni se envió ningún pago en esta revisión. El documento y las cuotas aún requieren datos de prueba en el flujo autorizado.

El checkout solo debe continuar con el correo y teléfono de la cuenta simulada de comprador y la tarjeta oficial de prueba de Mercado Pago. No usar datos reales. La tienda y Mercado Pago deben permanecer en modo de prueba; después de la prueba, el producto debe volver a Borrador.

Fuente: checkout privado de Shopify de la tienda 0g1cnb-vz, revisado en sesión autorizada de prueba; guía oficial de pruebas de Mercado Pago: https://www.mercadopago.com.co/developers/es/docs/shopify/sales-processing/integration-test

Secreto: este archivo no contiene contraseñas, números de tarjeta, códigos ni identificadores de acceso.

## Estado tras corregir el correo

El correo del checkout fue corregido al formato válido de la cuenta simulada de comprador y desapareció el aviso de correo inválido. El checkout mantiene el total COP 69.900 y el envío gratuito. Los campos seguros de tarjeta siguen vacíos; documento y cuotas siguen pendientes. No se ha pulsado “Pagar ahora”.

Fuente: sesión de checkout privado de Shopify, observada después de corregir el correo.

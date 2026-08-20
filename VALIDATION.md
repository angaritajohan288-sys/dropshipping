# Validación manual opcional

La aplicación incluye cobertura automatizada para la plantilla CSV, los filtros mensuales y la ventana de recordatorios. Cuando exista acceso a una sesión autenticada, se puede completar la comprobación manual sin alterar datos reales.

1. Abrir **Métricas** y seleccionar **Plantilla CSV**. El archivo descargado debe contener las columnas `month,revenue,productCost,adSpend,orders,currency` y una fila válida de ejemplo.
2. Importar datos propios o temporales autorizados, cambiar la moneda y establecer los meses **Desde** y **Hasta**. Verificar la serie, el estado vacío y el aviso para rangos inválidos.
3. En una tarea pendiente, seleccionar una fecha entre hoy y los próximos tres días. Debe aparecer el distintivo **Próxima** y el recordatorio ámbar en el resumen. Retirar la fecha de prueba al terminar.
4. Recorrer la plantilla y los filtros con la tecla `Tab` para comprobar el foco visible y el uso sin ratón, en escritorio y móvil.

> Las métricas, fechas y tareas se mantienen aisladas por usuario. No crear datos de prueba sin autorización de la persona propietaria de la cuenta.

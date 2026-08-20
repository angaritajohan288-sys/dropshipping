# Validación manual opcional

La aplicación incluye cobertura automatizada para la plantilla CSV, los filtros mensuales y la ventana de recordatorios. Cuando exista acceso a una sesión autenticada, se puede completar la comprobación manual sin alterar datos reales.

1. Abrir **Métricas** y seleccionar **Plantilla CSV**. El archivo descargado debe contener las columnas `month,revenue,productCost,adSpend,orders,currency` y una fila válida de ejemplo.
2. Importar datos propios o temporales autorizados, cambiar la moneda y establecer los meses **Desde** y **Hasta**. Verificar la serie, el estado vacío y el aviso para rangos inválidos.
3. Con una moneda y rango activos, seleccionar **Exportar filtrado**. Confirmar que el nombre de archivo contiene la moneda y el período, y que el archivo incluye únicamente las filas visibles; el archivo debe poder volver a importarse sin errores.
4. En **Anticipación de vencimientos**, guardar un valor entre 0 y 30 días. Recargar la sesión y confirmar que el valor persiste. En una tarea pendiente, seleccionar una fecha dentro de la ventana elegida para comprobar que el distintivo **Próxima** y el recordatorio ámbar cambian de acuerdo con la preferencia. Retirar la fecha de prueba al terminar.
5. Activar **Ordenar por vencimiento** y comprobar que las tareas fechadas ascienden al inicio mientras las tareas sin fecha mantienen el orden del plan al final. Seleccionar **Restaurar orden del plan** para revertir la vista.
6. Recorrer plantilla, exportación, filtros, anticipación y ordenamiento con la tecla `Tab` para comprobar el foco visible y el uso sin ratón, en escritorio y móvil.

> Las métricas, fechas y tareas se mantienen aisladas por usuario. No crear datos de prueba sin autorización de la persona propietaria de la cuenta.

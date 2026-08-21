export type ToolCategory = "Gratuita" | "De pago";
export type PlanTask = { id: string; title: string; detail: string; priority: "Crítica" | "Alta" | "Media" };
export type PlanTool = { name: string; category: ToolCategory; description: string; url: string };
export type PlanPhase = { id: string; name: string; shortLabel: string; objective: string; deliverable: string; exitGate: string; tasks: PlanTask[]; tools: PlanTool[]; errors: string[] };

const sheets: PlanTool = { name: "Google Sheets", category: "Gratuita", description: "Centraliza hipótesis, costes, decisiones y métricas.", url: "https://sheets.google.com" };
const shopify: PlanTool = { name: "Shopify", category: "De pago", description: "Gestiona catálogo, checkout y pedidos iniciales.", url: "https://www.shopify.com" };
const trends: PlanTool = { name: "Google Trends", category: "Gratuita", description: "Contrasta demanda por producto y región.", url: "https://trends.google.com" };
const canva: PlanTool = { name: "Canva", category: "Gratuita", description: "Crea recursos visuales y piezas de contenido.", url: "https://www.canva.com" };
const meta: PlanTool = { name: "Meta Ads Manager", category: "Gratuita", description: "Ejecuta pruebas publicitarias controladas.", url: "https://www.facebook.com/adsmanager" };

export const PHASES: PlanPhase[] = [
  { id: "strategy", shortLabel: "Fase 01", name: "Definición estratégica y preparación", objective: "Acotar mercado, cliente, objetivo, recursos, presupuesto y criterios de decisión antes de invertir.", deliverable: "Ficha de mercado, cliente, objetivos, recursos, presupuesto y criterios de descarte.", exitGate: "Mercado, cliente, objetivo medible, presupuesto y criterios de descarte definidos.", tasks: [
    { id: "strategy-01", title: "Definir mercado inicial", detail: "P0 · Elige país o región, moneda, idioma, entrega y restricciones conocidas.", priority: "Crítica" },
    { id: "strategy-02", title: "Definir cliente y problema", detail: "P0 · Describe necesidad, frustraciones, alternativas y objeciones del comprador.", priority: "Crítica" },
    { id: "strategy-03", title: "Fijar objetivos, recursos y descartes", detail: "P0/P1 · Documenta éxito, horas, presupuesto de validación y no negociables.", priority: "Crítica" },
    { id: "strategy-04", title: "Crear sistema de trabajo", detail: "P2 · Prepara tablero, carpetas, hoja de decisiones y evidencia por tarea.", priority: "Media" },
  ], tools: [sheets, canva], errors: ["Comenzar con todo el mundo como mercado.", "Gastar sin límite de validación.", "Avanzar sin un criterio de descarte." ] },
  { id: "research", shortLabel: "Fase 02", name: "Investigación y validación de nicho y productos", objective: "Elegir uno o dos productos con demanda documentada, diferenciación y un problema comprobable.", deliverable: "Ranking de candidatos, evidencias de demanda y mapa de competencia.", exitGate: "Uno o dos productos prioritarios con demanda y diferenciación documentadas.", tasks: [
    { id: "research-01", title: "Generar y filtrar oportunidades", detail: "P0 · Reúne 10–20 ideas y filtra envío, rotura, contenido, riesgo y devoluciones.", priority: "Crítica" },
    { id: "research-02", title: "Investigar demanda y competidores", detail: "P1 · Registra búsquedas, reseñas, lenguaje del cliente, precios y huecos de mercado.", priority: "Alta" },
    { id: "research-03", title: "Puntuar y validar candidatos", detail: "P1 · Clasifica demanda, margen y riesgo; prueba una propuesta a bajo coste.", priority: "Alta" },
  ], tools: [trends, sheets], errors: ["Elegir solo por viralidad.", "Ignorar quejas repetidas.", "Tomar una venta aislada como validación." ] },
  { id: "suppliers", shortLabel: "Fase 03", name: "Proveedores y economía unitaria", objective: "Confirmar calidad, plazo, coste total y margen antes de prometer el producto.", deliverable: "Proveedor principal y alternativo, muestra evaluada y hoja de economía unitaria.", exitGate: "Calidad, coste total y margen permiten probar adquisición sin pérdida no controlada.", tasks: [
    { id: "suppliers-01", title: "Comparar y verificar proveedores", detail: "P0 · Documenta tres opciones, soporte, tracking, condiciones y alternativa.", priority: "Crítica" },
    { id: "suppliers-02", title: "Pedir y evaluar muestra", detail: "P0 · Prueba producto, empaque, funcionamiento, entrega y crea contenido propio.", priority: "Crítica" },
    { id: "suppliers-03", title: "Calcular economía y flujo de pedido", detail: "P0/P1 · Incluye producto, envío, pagos, adquisición, incidencias, precio y proceso.", priority: "Crítica" },
  ], tools: [sheets, { name: "AliExpress", category: "Gratuita", description: "Explora referencias y posibles proveedores.", url: "https://www.aliexpress.com" }], errors: ["Calcular margen solo con precio de proveedor.", "Prometer calidad sin muestra.", "Depender de un solo proveedor." ] },
  { id: "legal", shortLabel: "Fase 04", name: "Legal, fiscal, financiero y marca", objective: "Preparar una operación transparente para cobrar, entregar, devolver y proteger activos.", deliverable: "Políticas, cobros, base financiera, identidad mínima y activos protegidos.", exitGate: "Se puede explicar claramente quién vende, cobra, entrega, devuelve y trata datos.", tasks: [
    { id: "legal-01", title: "Revisar obligaciones locales", detail: "P0 · Consulta actividad, impuestos, consumo, privacidad, importación y productos regulados.", priority: "Crítica" },
    { id: "legal-02", title: "Preparar políticas y cobros", detail: "P0 · Alinea términos, privacidad, envíos, devoluciones, pagos y reserva de caja.", priority: "Crítica" },
    { id: "legal-03", title: "Crear y proteger marca mínima", detail: "P1/P2 · Valida nombre, dominio, contacto, MFA y activos operativos.", priority: "Alta" },
  ], tools: [sheets, canva], errors: ["Copiar políticas incompatibles con la operación.", "Prometer plazos inexistentes.", "No separar y registrar caja operativa." ] },
  { id: "store", shortLabel: "Fase 05", name: "Construcción y configuración de la tienda", objective: "Construir una tienda funcional con catálogo, pagos, envíos, analítica y compra de prueba.", deliverable: "Tienda funcional, catálogo, checkout, pagos, envíos y analítica configurados.", exitGate: "Un pedido de prueba funciona de principio a fin sin bloqueos en móvil.", tasks: [
    { id: "store-01", title: "Elegir plataforma y arquitectura", detail: "P0/P1 · Define páginas, navegación, checkout, FAQs, contacto y políticas.", priority: "Crítica" },
    { id: "store-02", title: "Configurar catálogo, pagos y envíos", detail: "P0 · Carga datos verificables, zonas, tarifas, plazos, impuestos y reembolsos.", priority: "Crítica" },
    { id: "store-03", title: "Activar confianza, analítica y QA", detail: "P0/P1 · Prueba móvil, eventos, emails, tracking y compra completa de prueba.", priority: "Crítica" },
  ], tools: [shopify, { name: "PageSpeed Insights", category: "Gratuita", description: "Revisa rendimiento y experiencia móvil.", url: "https://pagespeed.web.dev" }], errors: ["Instalar apps innecesarias.", "Dejar textos de plantilla.", "Lanzar sin pedido de prueba." ] },
  { id: "conversion", shortLabel: "Fase 06", name: "Oferta, contenidos y conversión", objective: "Presentar problema, beneficio, prueba y riesgo para que un visitante pueda decidir comprar.", deliverable: "Propuesta de valor, página de producto, activos visuales y elementos de confianza.", exitGate: "Un desconocido entiende qué es, para quién sirve, cuánto cuesta, cuándo llega y qué pasa si no queda satisfecho.", tasks: [
    { id: "conversion-01", title: "Definir propuesta y página de producto", detail: "P0 · Ordena beneficio, demostración, uso, paquete, entrega, garantía, FAQ y CTA.", priority: "Crítica" },
    { id: "conversion-02", title: "Crear activos visuales y confianza", detail: "P1 · Prepara fotos, vídeo, medidas, soporte y reseñas auténticas y trazables.", priority: "Alta" },
    { id: "conversion-03", title: "Preparar automatización y SEO", detail: "P2 · Configura mensajes útiles y contenido basado en lenguaje real del cliente.", priority: "Media" },
  ], tools: [canva, { name: "CapCut", category: "Gratuita", description: "Edita demostraciones y creatividades de producto.", url: "https://www.capcut.com" }], errors: ["Inventar reseñas.", "Copiar afirmaciones no verificadas.", "Ocultar entrega o devoluciones." ] },
  { id: "launch", shortLabel: "Fase 07", name: "Marketing y lanzamiento", objective: "Obtener primeras visitas y ventas mediante pruebas de canales, mensajes, creativos y audiencias.", deliverable: "Canales, campañas o contenidos activos y presupuesto de prueba controlado.", exitGate: "Seguimiento activo y mensajes o canales con mayor potencial identificados.", tasks: [
    { id: "launch-01", title: "Seleccionar canales e hipótesis", detail: "P0 · Elige uno o dos canales y define qué aprendizaje busca cada uno.", priority: "Crítica" },
    { id: "launch-02", title: "Preparar contenido, anuncios y colaboraciones", detail: "P0/P1 · Verifica píxel, eventos, creatividades, presupuesto y criterios de pausa.", priority: "Crítica" },
    { id: "launch-03", title: "Ejecutar lanzamiento controlado", detail: "P0 · Vigila pagos, pedidos, stock, tracking y dudas antes de ampliar tráfico.", priority: "Crítica" },
  ], tools: [meta, canva], errors: ["Abrir todos los canales.", "Escalar sin economía unitaria.", "Cambiar todas las variables a la vez." ] },
  { id: "operations", shortLabel: "Fase 08", name: "Operaciones, pedidos y atención al cliente", objective: "Cumplir la promesa con procesos repetibles para pedidos, soporte, devoluciones e incidencias.", deliverable: "Flujo de pedidos, soporte, incidencias, devoluciones y control de proveedores documentados.", exitGate: "Otra persona puede procesar un pedido y resolver las incidencias más frecuentes.", tasks: [
    { id: "operations-01", title: "Documentar pedidos y niveles de servicio", detail: "P0 · Define revisión, proveedor, tracking, conciliación, plazos, responsable y sustituto.", priority: "Crítica" },
    { id: "operations-02", title: "Crear protocolos de soporte y devoluciones", detail: "P0/P1 · Prepara respuestas, reembolsos, defectos, retrasos y costes de incidencia.", priority: "Crítica" },
    { id: "operations-03", title: "Controlar calidad, proveedores y fraude", detail: "P1 · Mide defectos, cancelaciones, riesgo, entrega y disputas de pago.", priority: "Alta" },
  ], tools: [sheets, { name: "Shopify Inbox", category: "Gratuita", description: "Centraliza consultas de clientes.", url: "https://apps.shopify.com/shopify-inbox" }], errors: ["Procesar sin revisar señales de riesgo.", "Ocultar incidencias.", "No medir coste de reembolsos." ] },
  { id: "optimization", shortLabel: "Fase 09", name: "Medición, optimización y escalamiento", objective: "Tomar decisiones con datos y escalar solo ofertas que conservan margen y buena experiencia.", deliverable: "Tablero de métricas, experimentos y criterios para invertir, mantener o retirar.", exitGate: "Existe un proceso de medición, experimentación y decisión rentable documentado.", tasks: [
    { id: "optimization-01", title: "Crear tablero y cadencia de métricas", detail: "P0/P1 · Mide embudo, costes, margen, entrega, reembolsos e incidencias diariamente y semanalmente.", priority: "Crítica" },
    { id: "optimization-02", title: "Priorizar experimentos", detail: "P1 · Formula hipótesis, cambia una variable, observa y documenta resultado y decisión.", priority: "Alta" },
    { id: "optimization-03", title: "Decidir continuidad y escala", detail: "P0 · Clasifica producto: escalar, mantener, mejorar, sustituir o retirar; protege caja.", priority: "Crítica" },
  ], tools: [sheets, meta], errors: ["Optimizar por clics sin margen.", "Escalar antes de entender el embudo.", "Comprometer caja sin demanda predecible." ] },
  { id: "project", shortLabel: "Fase 10", name: "Gestión del proyecto y mejora continua", objective: "Gestionar prioridades, evidencias, riesgos y revisiones para convertir el lanzamiento en un sistema repetible.", deliverable: "Tablero maestro, revisión semanal, riesgos, documentación y retrospectivas.", exitGate: "Cada avance tiene evidencia y el lanzamiento funciona como un sistema repetible.", tasks: [
    { id: "project-01", title: "Crear tablero maestro", detail: "P0 · Asigna responsable, prioridad, fecha, dependencia, estado y evidencia a cada tarea.", priority: "Crítica" },
    { id: "project-02", title: "Planificar resultados y riesgos", detail: "P0/P1 · Define entregables semanales, bloqueos, riesgos, mitigaciones y documentación.", priority: "Crítica" },
    { id: "project-03", title: "Revisar puertas de salida y retrospectiva", detail: "P1/P2 · Avanza solo con evidencia y revisa aprendizajes cada dos o cuatro semanas.", priority: "Alta" },
  ], tools: [sheets, { name: "Notion", category: "Gratuita", description: "Organiza documentación, riesgos y decisiones.", url: "https://www.notion.so" }], errors: ["Avanzar solo porque pasó una semana.", "Cerrar tareas sin evidencia.", "Guardar decisiones solo en memoria." ] },
];

for (const phase of PHASES) {
  phase.objective = `${phase.objective} Entregable: ${phase.deliverable}. Puerta de salida: ${phase.exitGate}`;
  phase.tasks.unshift({
    id: `${phase.id}-exit-gate`,
    title: `P0 // Entregable y puerta de salida`,
    detail: `Entregable: ${phase.deliverable} Puerta de salida: ${phase.exitGate}`,
    priority: "Crítica",
  });
  phase.tasks.forEach(task => {
    const priorityCode = task.detail.match(/^P[0-3](?:\/P[0-3])?/)?.[0] ?? "P2";
    task.title = `${priorityCode} // ${task.title}`;
  });
}

export const PLAN_WEEKS = [
  { number: 1, label: "Estrategia", focus: "Mercado, cliente, objetivo y recursos", phaseId: "strategy" },
  { number: 2, label: "Validación", focus: "Nicho, demanda y productos", phaseId: "research" },
  { number: 3, label: "Economía", focus: "Proveedor, muestra y margen", phaseId: "suppliers" },
  { number: 4, label: "Base", focus: "Legal, finanzas y marca", phaseId: "legal" },
  { number: 5, label: "Tienda", focus: "Catálogo, pagos y QA", phaseId: "store" },
  { number: 6, label: "Conversión", focus: "Oferta, contenido y confianza", phaseId: "conversion" },
  { number: 7, label: "Lanzamiento", focus: "Canales, anuncios y primeras ventas", phaseId: "launch" },
  { number: 8, label: "Operación", focus: "Pedidos, soporte y devoluciones", phaseId: "operations" },
  { number: 9, label: "Optimización", focus: "Métricas, experimentos y escala", phaseId: "optimization" },
  { number: 10, label: "Control", focus: "Riesgos, evidencias y mejora", phaseId: "project" },
] as const;

export const KNOWN_TASK_KEYS = new Set(PHASES.flatMap(phase => phase.tasks.map(task => task.id)));

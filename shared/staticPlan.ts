export type ToolCategory = "Gratuita" | "De pago";

export type PlanTask = {
  id: string;
  title: string;
  detail: string;
  priority: "Crítica" | "Alta" | "Media";
};

export type PlanTool = {
  name: string;
  category: ToolCategory;
  description: string;
  url: string;
};

export type PlanPhase = {
  id: string;
  name: "Selección de Productos" | "Construcción de Tienda" | "Marketing" | "Operaciones";
  shortLabel: string;
  objective: string;
  tasks: PlanTask[];
  tools: PlanTool[];
  errors: string[];
};

export const PHASES: PlanPhase[] = [
  {
    id: "products",
    name: "Selección de Productos",
    shortLabel: "Fase 01",
    objective: "Elegir un producto gaming con margen, demostración visual clara y logística viable.",
    tasks: [
      { id: "products-01", title: "Definir el microsegmento", detail: "Escoge una necesidad concreta: setup RGB, periféricos móviles, organización de escritorio o confort gaming.", priority: "Crítica" },
      { id: "products-02", title: "Crear una lista corta de 10 productos", detail: "Prioriza artículos compactos, demostrables en vídeo y sin restricciones de baterías o marcas registradas.", priority: "Crítica" },
      { id: "products-03", title: "Validar demanda y contenido existente", detail: "Revisa tendencias, anuncios y vídeos de uso para detectar interés y ángulos de venta reales.", priority: "Alta" },
      { id: "products-04", title: "Calcular margen objetivo", detail: "Incluye producto, envío, comisiones, publicidad y reembolsos antes de fijar el precio final.", priority: "Crítica" },
      { id: "products-05", title: "Solicitar o revisar una muestra", detail: "Comprueba calidad, empaque, tiempo de tránsito y grababilidad del producto antes de escalar.", priority: "Alta" },
    ],
    tools: [
      { name: "Google Trends", category: "Gratuita", description: "Compara la evolución del interés de búsqueda por producto y región.", url: "https://trends.google.com" },
      { name: "TikTok Creative Center", category: "Gratuita", description: "Analiza creativos, tendencias e ideas de demostración en vídeo.", url: "https://ads.tiktok.com/business/creativecenter" },
      { name: "AliExpress", category: "Gratuita", description: "Explora referencias de producto, variantes, valoraciones de catálogo y proveedores.", url: "https://www.aliexpress.com" },
      { name: "Minea", category: "De pago", description: "Investiga anuncios de e-commerce y productos con actividad publicitaria.", url: "https://www.minea.com" },
    ],
    errors: [
      "Elegir un producto solo porque parece viral sin verificar coste total, saturación y margen.",
      "Vender productos con licencias de marcas gaming, compatibilidades no verificadas o reclamaciones técnicas imposibles de sostener.",
      "Ignorar peso, tiempos de entrega y devoluciones internacionales antes de lanzar campañas.",
    ],
  },
  {
    id: "store",
    name: "Construcción de Tienda",
    shortLabel: "Fase 02",
    objective: "Convertir la investigación en una tienda enfocada, confiable y preparada para vender desde el primer tráfico.",
    tasks: [
      { id: "store-01", title: "Definir una propuesta de valor clara", detail: "Resume en una frase qué problema de un setup gaming resuelve tu producto y para quién.", priority: "Crítica" },
      { id: "store-02", title: "Configurar Shopify y el dominio", detail: "Crea una marca sencilla, un dominio propio y una configuración regional coherente con tu mercado inicial.", priority: "Crítica" },
      { id: "store-03", title: "Construir una página de producto persuasiva", detail: "Incluye beneficios, demostración, especificaciones, variantes, envío y respuestas a objeciones.", priority: "Crítica" },
      { id: "store-04", title: "Completar páginas de confianza", detail: "Publica contacto, envíos, devoluciones, privacidad, términos y preguntas frecuentes reales.", priority: "Alta" },
      { id: "store-05", title: "Probar compra y versión móvil", detail: "Simula el checkout completo en móvil, valida enlaces, velocidad, moneda y mensajes de confirmación.", priority: "Crítica" },
    ],
    tools: [
      { name: "Shopify", category: "De pago", description: "Plataforma para catálogo, tienda, checkout y gestión inicial de pedidos.", url: "https://www.shopify.com" },
      { name: "Canva", category: "Gratuita", description: "Crea piezas de identidad, comparativas de beneficios y recursos para la tienda.", url: "https://www.canva.com" },
      { name: "PageSpeed Insights", category: "Gratuita", description: "Detecta problemas básicos de rendimiento y experiencia móvil.", url: "https://pagespeed.web.dev" },
      { name: "Klaviyo", category: "De pago", description: "Automatiza emails de carrito abandonado y flujos de postcompra cuando haya volumen.", url: "https://www.klaviyo.com" },
    ],
    errors: [
      "Lanzar una tienda genérica con demasiados productos y sin un mensaje de valor específico.",
      "Copiar descripciones del proveedor sin revisar afirmaciones, idioma, compatibilidades o beneficios reales.",
      "Ocultar tiempos de entrega o políticas: esto eleva los reembolsos y reduce la confianza.",
    ],
  },
  {
    id: "marketing",
    name: "Marketing",
    shortLabel: "Fase 03",
    objective: "Generar tráfico cualificado con contenido demostrativo y campañas pequeñas, medibles y controladas.",
    tasks: [
      { id: "marketing-01", title: "Definir tres ángulos de venta", detail: "Plantea ganchos distintos: estética del setup, solución a un problema o mejora de rendimiento/confort.", priority: "Crítica" },
      { id: "marketing-02", title: "Producir 10 creativos verticales", detail: "Graba demostraciones breves con un gancho en los primeros segundos y una llamada a la acción clara.", priority: "Crítica" },
      { id: "marketing-03", title: "Instalar medición de conversiones", detail: "Verifica eventos de visita, carrito, checkout y compra antes de invertir en anuncios.", priority: "Crítica" },
      { id: "marketing-04", title: "Lanzar pruebas de bajo presupuesto", detail: "Usa conjuntos de anuncios pequeños para evaluar creativos y oferta, no para escalar de inmediato.", priority: "Alta" },
      { id: "marketing-05", title: "Revisar métricas cada día", detail: "Documenta coste por visita, añadir al carrito, checkout y compra para decidir qué pausar o iterar.", priority: "Alta" },
    ],
    tools: [
      { name: "Meta Ads Manager", category: "Gratuita", description: "Gestiona pruebas de anuncios para Facebook e Instagram.", url: "https://www.facebook.com/adsmanager" },
      { name: "TikTok Ads Manager", category: "Gratuita", description: "Configura y mide campañas de vídeo vertical para audiencias gaming.", url: "https://ads.tiktok.com" },
      { name: "CapCut", category: "Gratuita", description: "Edita vídeos verticales de producto con ritmo, subtítulos y demostraciones.", url: "https://www.capcut.com" },
      { name: "Triple Whale", category: "De pago", description: "Centraliza atribución y análisis cuando el gasto publicitario justifique la inversión.", url: "https://www.triplewhale.com" },
    ],
    errors: [
      "Escalar presupuesto sin una venta rentable o sin saber qué creativo generó la intención.",
      "Usar anuncios que prometen resultados técnicos que el producto no puede demostrar.",
      "Tomar decisiones por likes o visitas sin revisar los eventos del embudo de compra.",
    ],
  },
  {
    id: "operations",
    name: "Operaciones",
    shortLabel: "Fase 04",
    objective: "Entregar una experiencia consistente, reducir incidencias y sostener una operación rentable a medida que crece el volumen.",
    tasks: [
      { id: "operations-01", title: "Definir el flujo de pedido", detail: "Documenta quién valida, paga al proveedor, revisa tracking y comunica incidencias.", priority: "Crítica" },
      { id: "operations-02", title: "Preparar respuestas de soporte", detail: "Crea respuestas claras para envío, cambio de dirección, retrasos, devoluciones y producto defectuoso.", priority: "Alta" },
      { id: "operations-03", title: "Establecer criterios de proveedor", detail: "Define cuándo cambiar de proveedor según calidad, seguimiento, plazo e incidencias recurrentes.", priority: "Alta" },
      { id: "operations-04", title: "Controlar rentabilidad por pedido", detail: "Registra coste de producto, envío, comisión, reembolso y adquisición en cada pedido.", priority: "Crítica" },
      { id: "operations-05", title: "Revisar semanalmente riesgos", detail: "Haz una revisión de stock, reclamos, tiempos de tránsito, chargebacks y preguntas frecuentes.", priority: "Media" },
    ],
    tools: [
      { name: "Shopify Inbox", category: "Gratuita", description: "Centraliza conversaciones con clientes desde la tienda.", url: "https://apps.shopify.com/shopify-inbox" },
      { name: "Google Sheets", category: "Gratuita", description: "Lleva un control sencillo de pedidos, incidencias y margen operativo.", url: "https://sheets.google.com" },
      { name: "Zendesk", category: "De pago", description: "Organiza soporte multicanal cuando el volumen ya no cabe en un flujo manual.", url: "https://www.zendesk.com" },
      { name: "AfterShip", category: "De pago", description: "Ofrece seguimiento de pedidos y avisos de envío desde una plataforma centralizada.", url: "https://www.aftership.com" },
    ],
    errors: [
      "Prometer entregas sin confirmar el plazo real ni contar con un proceso para incidencias.",
      "Responder tarde a solicitudes de soporte o dejar abiertas conversaciones sobre tracking y devoluciones.",
      "Confundir facturación con beneficio y no registrar comisiones, reembolsos ni costes de adquisición.",
    ],
  },
];

export const PLAN_WEEKS = [
  { number: 1, label: "Validación", focus: "Producto, demanda y margen", phaseId: "products" },
  { number: 2, label: "Fundación", focus: "Tienda, oferta y checkout", phaseId: "store" },
  { number: 3, label: "Adquisición", focus: "Creativos, medición y pruebas", phaseId: "marketing" },
  { number: 4, label: "Optimización", focus: "Operación, soporte y rentabilidad", phaseId: "operations" },
] as const;

export const KNOWN_TASK_KEYS = new Set(PHASES.flatMap(phase => phase.tasks.map(task => task.id)));

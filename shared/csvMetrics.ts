export const METRICS_CSV_HEADERS = ["month", "revenue", "productCost", "adSpend", "orders", "currency"] as const;

export type ParsedMonthlyMetric = {
  monthKey: string;
  revenueCents: number;
  productCostCents: number;
  adSpendCents: number;
  orders: number;
  currency: "USD" | "EUR" | "MXN" | "COP";
};

type ParseResult = { rows: ParsedMonthlyMetric[]; errors: string[] };

function splitCsvLine(line: string, delimiter: string) {
  const values: string[] = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === delimiter && !quoted) {
      values.push(value.trim());
      value = "";
    } else {
      value += character;
    }
  }
  values.push(value.trim());
  return values;
}

function parseMoneyToCents(value: string) {
  const normalized = value.trim().replace(",", ".");
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null;
  const cents = Math.round(Number(normalized) * 100);
  return Number.isSafeInteger(cents) && cents <= 2_000_000_000 ? cents : null;
}

function valueAt(row: string[], indexByHeader: Map<string, number>, header: typeof METRICS_CSV_HEADERS[number]) {
  return row[indexByHeader.get(header) ?? -1] ?? "";
}

/**
 * Contrato CSV: month,revenue,productCost,adSpend,orders,currency.
 * `month` usa AAAA-MM; importes son no negativos y aceptan punto o coma decimal;
 * `currency` acepta USD, EUR, MXN o COP. El orden de las columnas es libre.
 */
export function parseMonthlyMetricsCsv(content: string): ParseResult {
  const lines = content.replace(/^\uFEFF/, "").split(/\r?\n/).filter(line => line.trim());
  if (lines.length < 2) return { rows: [], errors: ["El CSV necesita una cabecera y al menos una fila de datos."] };

  const delimiter = lines[0].includes(";") && !lines[0].includes(",") ? ";" : ",";
  const headers = splitCsvLine(lines[0], delimiter).map(header => header.trim());
  const indexByHeader = new Map(headers.map((header, index) => [header, index]));
  const missing = METRICS_CSV_HEADERS.filter(header => !indexByHeader.has(header));
  if (missing.length) return { rows: [], errors: [`Faltan columnas requeridas: ${missing.join(", ")}.`] };

  const rows: ParsedMonthlyMetric[] = [];
  const errors: string[] = [];
  const uniqueRows = new Set<string>();
  lines.slice(1).forEach((line, rowIndex) => {
    const row = splitCsvLine(line, delimiter);
    const monthKey = valueAt(row, indexByHeader, "month");
    const currency = valueAt(row, indexByHeader, "currency").toUpperCase();
    const revenueCents = parseMoneyToCents(valueAt(row, indexByHeader, "revenue"));
    const productCostCents = parseMoneyToCents(valueAt(row, indexByHeader, "productCost"));
    const adSpendCents = parseMoneyToCents(valueAt(row, indexByHeader, "adSpend"));
    const ordersText = valueAt(row, indexByHeader, "orders");
    const orders = /^\d+$/.test(ordersText) ? Number(ordersText) : -1;
    const rowLabel = `Fila ${rowIndex + 2}`;
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(monthKey)) errors.push(`${rowLabel}: month debe usar AAAA-MM.`);
    if (!(["USD", "EUR", "MXN", "COP"] as const).includes(currency as ParsedMonthlyMetric["currency"])) errors.push(`${rowLabel}: currency debe ser USD, EUR, MXN o COP.`);
    if (revenueCents === null || productCostCents === null || adSpendCents === null) errors.push(`${rowLabel}: los importes deben ser números no negativos con hasta dos decimales.`);
    if (!Number.isSafeInteger(orders) || orders < 0 || orders > 10_000_000) errors.push(`${rowLabel}: orders debe ser un entero no negativo.`);
    const uniqueKey = `${monthKey}|${currency}`;
    if (uniqueRows.has(uniqueKey)) errors.push(`${rowLabel}: se repite la combinación month y currency.`);
    uniqueRows.add(uniqueKey);
    if (errors.some(error => error.startsWith(rowLabel))) return;
    rows.push({ monthKey, revenueCents: revenueCents as number, productCostCents: productCostCents as number, adSpendCents: adSpendCents as number, orders, currency: currency as ParsedMonthlyMetric["currency"] });
  });
  return { rows, errors };
}

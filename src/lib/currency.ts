import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

// MONEDA DE VISUALIZACIÓN.
// El cobro real SIEMPRE es en EUR (lo procesa Stripe). Aquí solo mostramos una
// APROXIMACIÓN en la moneda local para orientar; el importe real en euros se
// muestra siempre junto al convertido.
//
// Tres conceptos separados:
//  - idioma  → i18n (para el FORMATO del número), independiente de lo demás.
//  - país    → se detecta por la ZONA HORARIA del dispositivo (no por el idioma).
//  - moneda  → se deriva del país.

export const BASE_PRICE_EUR = 1.99;

// ---- País por zona horaria (sin permisos, sin red, independiente del idioma) ----
// Usamos el NOMBRE IANA de la zona (p. ej. "America/Argentina/Buenos_Aires"), no
// el offset horario: el nombre identifica el país de forma única, así que países
// con el mismo horario (Argentina GMT-3 vs Brasil GMT-3) nunca se confunden.
// Zona no listada → país desconocido → EUR (nunca una conversión equivocada).
const TZ_COUNTRY: Record<string, string> = {
  // --- Eurozona (explícita: así "país conocido" = EUR, no "desconocido") ---
  "Europe/Madrid": "ES", "Atlantic/Canary": "ES", "Europe/Paris": "FR",
  "Europe/Berlin": "DE", "Europe/Rome": "IT", "Europe/Amsterdam": "NL",
  "Europe/Brussels": "BE", "Europe/Vienna": "AT", "Europe/Lisbon": "PT",
  "Atlantic/Madeira": "PT", "Europe/Athens": "GR", "Europe/Helsinki": "FI",
  "Europe/Dublin": "IE", "Europe/Luxembourg": "LU", "Europe/Zagreb": "HR",
  "Asia/Nicosia": "CY", "Europe/Nicosia": "CY", "Europe/Tallinn": "EE",
  "Europe/Riga": "LV", "Europe/Vilnius": "LT", "Europe/Malta": "MT",
  "Europe/Bratislava": "SK", "Europe/Ljubljana": "SI", "Europe/Andorra": "AD",
  "Europe/Monaco": "MC", "Europe/San_Marino": "SM", "Europe/Vatican": "VA",
  "Europe/Podgorica": "ME",
  // --- Europa no-euro ---
  "Europe/London": "GB", "Europe/Zurich": "CH", "Europe/Vaduz": "LI",
  "Europe/Stockholm": "SE", "Europe/Oslo": "NO", "Europe/Copenhagen": "DK",
  "Europe/Warsaw": "PL", "Europe/Prague": "CZ", "Europe/Budapest": "HU",
  "Europe/Bucharest": "RO", "Atlantic/Reykjavik": "IS", "Europe/Istanbul": "TR",
  // --- Norteamérica ---
  "America/New_York": "US", "America/Detroit": "US", "America/Chicago": "US",
  "America/Denver": "US", "America/Phoenix": "US", "America/Los_Angeles": "US",
  "America/Anchorage": "US", "America/Boise": "US", "America/Indiana/Indianapolis": "US",
  "America/Kentucky/Louisville": "US", "Pacific/Honolulu": "US", "America/Puerto_Rico": "PR",
  "America/Toronto": "CA", "America/Vancouver": "CA", "America/Edmonton": "CA",
  "America/Winnipeg": "CA", "America/Halifax": "CA", "America/St_Johns": "CA",
  "America/Regina": "CA", "America/Moncton": "CA",
  "America/Mexico_City": "MX", "America/Monterrey": "MX", "America/Tijuana": "MX",
  "America/Cancun": "MX", "America/Merida": "MX", "America/Chihuahua": "MX",
  "America/Hermosillo": "MX", "America/Mazatlan": "MX",
  // --- Latinoamérica ---
  "America/Sao_Paulo": "BR", "America/Bahia": "BR", "America/Fortaleza": "BR",
  "America/Recife": "BR", "America/Manaus": "BR", "America/Belem": "BR",
  "America/Cuiaba": "BR", "America/Campo_Grande": "BR",
  "America/Argentina/Buenos_Aires": "AR", "America/Argentina/Cordoba": "AR",
  "America/Argentina/Mendoza": "AR", "America/Argentina/Salta": "AR",
  "America/Argentina/Tucuman": "AR", "America/Argentina/Ushuaia": "AR",
  "America/Santiago": "CL", "America/Bogota": "CO", "America/Lima": "PE",
  "America/Caracas": "VE", "America/Montevideo": "UY", "America/Asuncion": "PY",
  "America/La_Paz": "BO", "America/Guayaquil": "EC", "America/Panama": "PA",
  "America/Guatemala": "GT", "America/Costa_Rica": "CR", "America/Havana": "CU",
  "America/Santo_Domingo": "DO", "America/El_Salvador": "SV",
  // --- Asia / Oriente Medio ---
  "Asia/Tokyo": "JP", "Asia/Shanghai": "CN", "Asia/Urumqi": "CN",
  "Asia/Hong_Kong": "HK", "Asia/Taipei": "TW", "Asia/Seoul": "KR",
  "Asia/Singapore": "SG", "Asia/Kolkata": "IN", "Asia/Calcutta": "IN",
  "Asia/Jakarta": "ID", "Asia/Kuala_Lumpur": "MY", "Asia/Manila": "PH",
  "Asia/Bangkok": "TH", "Asia/Jerusalem": "IL", "Asia/Dubai": "AE",
  "Asia/Riyadh": "SA", "Asia/Karachi": "PK", "Asia/Dhaka": "BD",
  "Asia/Ho_Chi_Minh": "VN",
  // --- África ---
  "Africa/Johannesburg": "ZA", "Africa/Lagos": "NG", "Africa/Cairo": "EG",
  "Africa/Nairobi": "KE", "Africa/Casablanca": "MA", "Africa/Accra": "GH",
  "Africa/Tunis": "TN", "Africa/Algiers": "DZ",
  // --- Oceanía ---
  "Australia/Sydney": "AU", "Australia/Melbourne": "AU", "Australia/Brisbane": "AU",
  "Australia/Perth": "AU", "Australia/Adelaide": "AU", "Australia/Hobart": "AU",
  "Australia/Darwin": "AU", "Pacific/Auckland": "NZ",
};

// Moneda que se MUESTRA por país. Los países de la eurozona no se listan: caen a
// EUR por defecto.
//
// Para países cuya moneda local el BCE NO cotiza (Argentina/ARS, Chile/CLP,
// Colombia/COP, Perú/PEN, Nigeria/NGN, Emiratos/AED…) no podemos convertir a su
// divisa, así que mostramos USD como REFERENCIA internacional. Cámbialo a "EUR"
// en NO_RATE_REFERENCE si prefieres enseñarles directamente el importe real.
const NO_RATE_REFERENCE = "USD";

const COUNTRY_CURRENCY: Record<string, string> = {
  // Moneda propia y cotizada por el BCE
  US: "USD", CA: "CAD", MX: "MXN", BR: "BRL", GB: "GBP", CH: "CHF", LI: "CHF",
  SE: "SEK", NO: "NOK", DK: "DKK", PL: "PLN", CZ: "CZK", HU: "HUF",
  RO: "RON", IS: "ISK", TR: "TRY", JP: "JPY", CN: "CNY", HK: "HKD",
  KR: "KRW", SG: "SGD", IN: "INR", ID: "IDR", MY: "MYR", PH: "PHP",
  TH: "THB", IL: "ILS", AU: "AUD", NZ: "NZD", ZA: "ZAR",
  // Países que usan el dólar como moneda oficial
  EC: "USD", PA: "USD", PR: "USD", SV: "USD",
  // Sin cotización del BCE para su moneda → USD como referencia internacional
  AR: NO_RATE_REFERENCE, CL: NO_RATE_REFERENCE, CO: NO_RATE_REFERENCE,
  PE: NO_RATE_REFERENCE, VE: NO_RATE_REFERENCE, UY: NO_RATE_REFERENCE,
  PY: NO_RATE_REFERENCE, BO: NO_RATE_REFERENCE, GT: NO_RATE_REFERENCE,
  CR: NO_RATE_REFERENCE, CU: NO_RATE_REFERENCE, DO: NO_RATE_REFERENCE,
  AE: NO_RATE_REFERENCE, SA: NO_RATE_REFERENCE, PK: NO_RATE_REFERENCE,
  BD: NO_RATE_REFERENCE, VN: NO_RATE_REFERENCE, EG: NO_RATE_REFERENCE,
  NG: NO_RATE_REFERENCE, KE: NO_RATE_REFERENCE, MA: NO_RATE_REFERENCE,
  GH: NO_RATE_REFERENCE, TN: NO_RATE_REFERENCE, DZ: NO_RATE_REFERENCE,
  TW: NO_RATE_REFERENCE, // TWD tampoco lo cotiza el BCE
};

export function detectCountry(): string | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz && TZ_COUNTRY[tz] ? TZ_COUNTRY[tz] : null;
  } catch {
    return null;
  }
}

// Moneda local a partir del país. Sin país detectado → EUR.
export function detectCurrency(): string {
  const country = detectCountry();
  if (!country) return "EUR";
  return COUNTRY_CURRENCY[country] ?? "EUR";
}

// ---- Tipos de cambio en vivo (Frankfurter, datos del BCE, base EUR, sin key) ----
const FX_URL = "https://api.frankfurter.dev/v1/latest?base=EUR";
const CACHE_KEY = "trampto_fx";
const MAX_CACHE_AGE_DAYS = 3; // tolerancia (el BCE no publica findes); más viejo → EUR

interface FxCache {
  date: string; // YYYY-MM-DD de la descarga
  rates: Record<string, number>;
}

const todayStr = () => new Date().toISOString().slice(0, 10);

function readCache(): FxCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw);
    if (c && typeof c.date === "string" && c.rates) return c as FxCache;
  } catch {
    /* localStorage/JSON no disponible */
  }
  return null;
}

function ageDays(date: string): number {
  return (Date.now() - new Date(date + "T00:00:00Z").getTime()) / 86_400_000;
}

async function loadRates(): Promise<Record<string, number> | null> {
  const cached = readCache();
  if (cached && cached.date === todayStr()) return cached.rates; // ya fresco hoy
  try {
    const res = await fetch(FX_URL, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) throw new Error("fx http " + res.status);
    const data = await res.json();
    if (!data?.rates) throw new Error("fx sin rates");
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ date: todayStr(), rates: data.rates })
      );
    } catch {
      /* cuota/privado: seguimos sin cachear */
    }
    return data.rates as Record<string, number>;
  } catch {
    // API caída → caché reciente si la hay; si no, null (solo EUR). Nunca un tipo caducado.
    if (cached && ageDays(cached.date) <= MAX_CACHE_AGE_DAYS) return cached.rates;
    return null;
  }
}

// Promesa compartida (una sola descarga por sesión).
let ratesPromise: Promise<Record<string, number> | null> | null = null;
export function getRates(): Promise<Record<string, number> | null> {
  if (!ratesPromise) ratesPromise = loadRates();
  return ratesPromise;
}

function formatMoney(amount: number, currency: string, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export interface PriceInfo {
  currency: string; // moneda local detectada (o "EUR")
  hasLocal: boolean; // true → `display` es una aproximación local; false → solo EUR
  display: string; // lo que se muestra como precio (aprox local o EUR)
  eurText: string; // precio real en EUR, SIEMPRE (para mostrar junto al convertido)
  loading: boolean; // true mientras se cargan los tipos
}

// Hook: idioma para el formato, país→moneda por zona horaria, tipos en vivo.
export function useLocalPrice(): PriceInfo {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const currency = detectCurrency();
  const eurText = formatMoney(BASE_PRICE_EUR, "EUR", locale);

  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(currency !== "EUR");

  useEffect(() => {
    if (currency === "EUR") {
      setLoading(false);
      return;
    }
    let alive = true;
    getRates().then((r) => {
      if (!alive) return;
      setRates(r);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [currency]);

  // País EUR, tipos aún cargando, o sin tipo para esa moneda → mostramos solo EUR.
  const rate = currency !== "EUR" ? rates?.[currency] : undefined;
  if (!rate) {
    return { currency, hasLocal: false, display: eurText, eurText, loading };
  }
  return {
    currency,
    hasLocal: true,
    display: "≈ " + formatMoney(BASE_PRICE_EUR * rate, currency, locale),
    eurText,
    loading: false,
  };
}

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
// Solo mapeamos zonas de países con moneda != EUR; cualquier otra (incl. eurozona
// o desconocida) cae a EUR, así nunca mostramos una conversión equivocada.
const TZ_COUNTRY: Record<string, string> = {
  // Estados Unidos
  "America/New_York": "US", "America/Detroit": "US", "America/Chicago": "US",
  "America/Denver": "US", "America/Phoenix": "US", "America/Los_Angeles": "US",
  "America/Anchorage": "US", "America/Boise": "US", "America/Indiana/Indianapolis": "US",
  "America/Kentucky/Louisville": "US", "Pacific/Honolulu": "US",
  // Canadá
  "America/Toronto": "CA", "America/Vancouver": "CA", "America/Edmonton": "CA",
  "America/Winnipeg": "CA", "America/Halifax": "CA", "America/St_Johns": "CA",
  "America/Regina": "CA", "America/Moncton": "CA",
  // México
  "America/Mexico_City": "MX", "America/Monterrey": "MX", "America/Tijuana": "MX",
  "America/Cancun": "MX", "America/Merida": "MX", "America/Chihuahua": "MX",
  "America/Hermosillo": "MX", "America/Mazatlan": "MX",
  // Brasil
  "America/Sao_Paulo": "BR", "America/Bahia": "BR", "America/Fortaleza": "BR",
  "America/Recife": "BR", "America/Manaus": "BR", "America/Belem": "BR",
  "America/Cuiaba": "BR", "America/Campo_Grande": "BR",
  // Europa no-euro
  "Europe/London": "GB", "Europe/Zurich": "CH", "Europe/Stockholm": "SE",
  "Europe/Oslo": "NO", "Europe/Copenhagen": "DK", "Europe/Warsaw": "PL",
  // Asia-Pacífico
  "Asia/Tokyo": "JP", "Asia/Shanghai": "CN", "Asia/Urumqi": "CN",
  "Asia/Hong_Kong": "HK", "Asia/Taipei": "TW", "Asia/Seoul": "KR",
  "Asia/Singapore": "SG", "Asia/Kolkata": "IN", "Asia/Calcutta": "IN",
  "Australia/Sydney": "AU", "Australia/Melbourne": "AU", "Australia/Brisbane": "AU",
  "Australia/Perth": "AU", "Australia/Adelaide": "AU", "Australia/Hobart": "AU",
  "Australia/Darwin": "AU", "Pacific/Auckland": "NZ",
};

const COUNTRY_CURRENCY: Record<string, string> = {
  US: "USD", CA: "CAD", MX: "MXN", BR: "BRL", GB: "GBP", CH: "CHF",
  SE: "SEK", NO: "NOK", DK: "DKK", PL: "PLN", JP: "JPY", CN: "CNY",
  HK: "HKD", KR: "KRW", SG: "SGD", IN: "INR", AU: "AUD", NZ: "NZD",
  TW: "TWD", // sin tipo en el BCE → caerá a EUR en la conversión
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

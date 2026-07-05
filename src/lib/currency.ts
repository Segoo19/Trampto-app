import { useTranslation } from "react-i18next";

// MONEDA DE VISUALIZACIÓN.
// IMPORTANTE: el cobro real SIEMPRE se hace en EUR (lo procesa Stripe). Aquí solo
// mostramos una APROXIMACIÓN en la moneda local del usuario para que se haga una
// idea; el importe exacto y la divisa del cargo son los de Stripe (euros).

// Precio base real facturado por Stripe. No lo cambies aquí para "ajustar" el
// cobro: esto es solo presentación.
export const BASE_PRICE_EUR = 1.99;

// Tipos de cambio APROXIMADOS EUR→moneda. Edítalos cuando quieras; solo afectan
// a lo que se MUESTRA, nunca a lo que se cobra. (Referencia: mediados de 2026.)
const RATES: Record<string, number> = {
  EUR: 1,
  USD: 1.08,
  GBP: 0.85,
  CHF: 0.96,
  JPY: 168,
  CNY: 7.8,
  HKD: 8.4,
  TWD: 34,
  KRW: 1450,
  SGD: 1.45,
  AUD: 1.64,
  CAD: 1.47,
  MXN: 19.5,
  BRL: 5.9,
  INR: 90,
  SEK: 11.3,
  NOK: 11.6,
  DKK: 7.46,
  PLN: 4.3,
};

// Región ISO-3166 → moneda. Las regiones no listadas (incl. eurozona) usan EUR,
// así que ante la duda mostramos euros y nunca una conversión equivocada.
const REGION_CURRENCY: Record<string, string> = {
  US: "USD",
  GB: "GBP",
  CH: "CHF",
  JP: "JPY",
  CN: "CNY",
  HK: "HKD",
  TW: "TWD",
  KR: "KRW",
  SG: "SGD",
  AU: "AUD",
  NZ: "AUD",
  CA: "CAD",
  MX: "MXN",
  BR: "BRL",
  IN: "INR",
  SE: "SEK",
  NO: "NOK",
  DK: "DKK",
  PL: "PLN",
};

// Detecta la moneda por la REGIÓN del navegador (no por el idioma: un usuario en
// EE. UU. con el navegador en español debe ver dólares).
export function detectCurrency(): string {
  try {
    const langs = navigator.languages?.length
      ? navigator.languages
      : [navigator.language];
    for (const l of langs) {
      const region = new Intl.Locale(l).maximize().region;
      if (region && REGION_CURRENCY[region] && RATES[REGION_CURRENCY[region]]) {
        return REGION_CURRENCY[region];
      }
    }
  } catch {
    /* Intl.Locale no disponible: caemos a EUR */
  }
  return "EUR";
}

function formatMoney(amount: number, currency: string, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export interface PriceInfo {
  currency: string;
  isEur: boolean; // true → importe exacto en EUR; false → aproximado en local
  text: string; // p. ej. "1,99 €" o "≈ $2.15"
}

// Precio a mostrar. Si la moneda local es EUR, es exacto; si no, aproximado
// (prefijo «≈») porque el cargo real seguirá siendo en euros.
export function localPrice(locale: string): PriceInfo {
  const currency = detectCurrency();
  if (currency === "EUR") {
    return {
      currency,
      isEur: true,
      text: formatMoney(BASE_PRICE_EUR, "EUR", locale),
    };
  }
  const amount = BASE_PRICE_EUR * (RATES[currency] ?? 1);
  return {
    currency,
    isEur: false,
    text: "≈ " + formatMoney(amount, currency, locale),
  };
}

// Hook cómodo: formatea el precio con el locale del idioma activo.
export function useLocalPrice(): PriceInfo {
  const { i18n } = useTranslation();
  return localPrice(i18n.language);
}

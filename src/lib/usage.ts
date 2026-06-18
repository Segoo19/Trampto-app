import type { AppSession } from "../types";
import { supabase, dbTimeout } from "./supabase";

export const FREE_LIMIT = 3;

// Cuentas administradoras (correo del propietario de TRAMPTO): todo
// desbloqueado y acceso al panel de pruebas de la API.
const ADMIN_EMAILS = (
  import.meta.env.VITE_ADMIN_EMAILS ?? "tramptooficial@gmail.com"
)
  .split(",")
  .map((e: string) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email?: string | null): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}

// Misma cookie que usa la web para contar los sellados gratuitos del dispositivo
const FREE_COOKIE = "trampto_free_used";

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

export function getFreeUsedOnDevice(): number {
  const value = getCookie(FREE_COOKIE);
  const parsed = value ? parseInt(value, 10) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

export function incrementFreeUsedOnDevice() {
  const next = getFreeUsedOnDevice() + 1;
  const expires = new Date();
  expires.setDate(expires.getDate() + 365);
  document.cookie = `${FREE_COOKIE}=${next};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

export interface Usage {
  isPro: boolean;
  isAdmin: boolean;
  freeUsed: number; // documentos gratis consumidos (a mostrar)
  blocked: boolean; // ha agotado el plan gratuito
  needsAuth: boolean; // anónimo bloqueado: primero debe iniciar sesión
}

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  try {
    const now = new Date().toISOString();
    const { data } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "active")
      .gt("expires_at", now)
      .limit(1)
      .abortSignal(dbTimeout());
    return !!(data && data.length > 0);
  } catch {
    return false;
  }
}

async function countFreeSealsInDb(userId: string): Promise<number> {
  // Misma consulta que la web (UploadPage): documentos sellados no pagados
  const { data, error } = await supabase
    .from("sealed_documents")
    .select("id")
    .eq("user_id", userId)
    .eq("paid", false)
    .abortSignal(dbTimeout());
  if (error || !data) return 0;
  return data.length;
}

// Réplica de la lógica de límites de la web:
// - anónimo: 3 por dispositivo (cookie); al agotarlos debe crear cuenta
// - con sesión: 3 según la base de datos (o la cookie del dispositivo)
// - suscripción activa o cuenta admin: ilimitado
export async function getUsage(session: AppSession | null): Promise<Usage> {
  const cookieCount = getFreeUsedOnDevice();

  if (!session) {
    return {
      isPro: false,
      isAdmin: false,
      freeUsed: Math.min(cookieCount, FREE_LIMIT),
      blocked: cookieCount >= FREE_LIMIT,
      needsAuth: cookieCount >= FREE_LIMIT,
    };
  }

  if (isAdminEmail(session.user.email)) {
    return { isPro: true, isAdmin: true, freeUsed: 0, blocked: false, needsAuth: false };
  }

  const isPro = await hasActiveSubscription(session.user.id);
  if (isPro) {
    return { isPro: true, isAdmin: false, freeUsed: 0, blocked: false, needsAuth: false };
  }

  const dbCount = await countFreeSealsInDb(session.user.id);
  const used = Math.max(dbCount, cookieCount);
  return {
    isPro: false,
    isAdmin: false,
    freeUsed: Math.min(used, FREE_LIMIT),
    blocked: used >= FREE_LIMIT,
    needsAuth: false,
  };
}

export type Plan = "individual" | "api";

// Checkout de Stripe: mismas edge functions que la web (1,99 €/mes cada plan).
// - individual → create-checkout (vuelve a /payment-success)
// - api/empresas → stripe-checkout (vuelve a /api-key?success=true)
export async function startCheckout(plan: Plan): Promise<string> {
  const fn = plan === "api" ? "stripe-checkout" : "create-checkout";
  const response = await supabase.functions.invoke(fn, {
    body: { returnUrl: window.location.origin },
  });
  if (response.error || !response.data?.url) {
    throw new Error(
      response.error?.message ?? "No se pudo crear la sesión de pago"
    );
  }
  return response.data.url as string;
}

// Activación inmediata al volver de Stripe: mismo upsert que hace la web
// en PaymentSuccess.tsx (el webhook de Stripe actúa como respaldo).
export async function activateSubscription(userId: string): Promise<boolean> {
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 1);
  const { error } = await supabase
    .from("subscriptions")
    .upsert(
      {
        user_id: userId,
        status: "active",
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
    .abortSignal(dbTimeout());
  if (error) console.error("activateSubscription error:", error);
  return !error;
}

export async function getSubscription(userId: string) {
  try {
    const now = new Date().toISOString();
    const { data } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .gt("expires_at", now)
      .limit(1)
      .abortSignal(dbTimeout());
    return data?.[0] ?? null;
  } catch {
    return null;
  }
}

// Cancela la suscripción: misma edge function + actualización que la web
export async function cancelSubscription(subscription: {
  id: string;
  stripe_subscription_id?: string;
}): Promise<boolean> {
  try {
    if (subscription.stripe_subscription_id) {
      await supabase.functions.invoke("cancel-subscription", {
        body: { subscriptionId: subscription.stripe_subscription_id },
      });
    }
    const { error } = await supabase
      .from("subscriptions")
      .update({ status: "cancelled" })
      .eq("id", subscription.id)
      .abortSignal(dbTimeout());
    return !error;
  } catch {
    return false;
  }
}

export async function countMySeals(userId: string): Promise<number> {
  try {
    const { data } = await supabase
      .from("sealed_documents")
      .select("id")
      .eq("user_id", userId)
      .abortSignal(dbTimeout());
    return data?.length ?? 0;
  } catch {
    return 0;
  }
}

// ---------- Empresas / API key ----------

export interface Company {
  id: string;
  name: string;
  email: string;
  api_key: string | null;
  subscription_status: string;
}

// Misma generación de clave que la web y el webhook: trp_ + 32 caracteres
export function generateApiKeyString(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let key = "trp_";
  const random = new Uint32Array(32);
  crypto.getRandomValues(random);
  for (let i = 0; i < 32; i++) key += chars[random[i] % chars.length];
  return key;
}

// Busca la empresa del usuario: por company_id del perfil (como la web)
// y, si no, por email.
export async function getCompany(session: AppSession): Promise<Company | null> {
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("user_id", session.user.id)
      .abortSignal(dbTimeout())
      .maybeSingle();

    if (profile?.company_id) {
      const { data } = await supabase
        .from("companies")
        .select("id, name, email, api_key, subscription_status")
        .eq("id", profile.company_id)
        .abortSignal(dbTimeout())
        .maybeSingle();
      if (data) return data as Company;
    }
  } catch {
    /* el esquema del perfil puede variar; seguimos por email */
  }

  try {
    const { data } = await supabase
      .from("companies")
      .select("id, name, email, api_key, subscription_status")
      .eq("email", session.user.email)
      .abortSignal(dbTimeout())
      .maybeSingle();
    return (data as Company) ?? null;
  } catch {
    return null;
  }
}

// Regenera la clave API (misma operación que la web en ApiKeyPage)
export async function regenerateApiKey(companyId: string): Promise<string | null> {
  const newKey = generateApiKeyString();
  const { error } = await supabase
    .from("companies")
    .update({ api_key: newKey })
    .eq("id", companyId)
    .abortSignal(dbTimeout());
  return error ? null : newKey;
}

// Tras el pago del plan Empresas: si el webhook aún no ha creado la empresa,
// intenta crearla desde el cliente (mismos campos que el webhook).
export async function ensureCompany(session: AppSession): Promise<Company | null> {
  const existing = await getCompany(session);
  if (existing) return existing;

  const email = session.user.email ?? "";
  const apiKey = generateApiKeyString();
  try {
    const { data, error } = await supabase
      .from("companies")
      .upsert(
        {
          name: email.split("@")[0],
          email,
          api_key: apiKey,
          subscription_status: "active",
        },
        { onConflict: "email" }
      )
      .select("id, name, email, api_key, subscription_status")
      .abortSignal(dbTimeout())
      .maybeSingle();
    if (error || !data) return null;

    await supabase
      .from("profiles")
      .update({ company_id: data.id })
      .eq("user_id", session.user.id)
      .abortSignal(dbTimeout());
    return data as Company;
  } catch {
    return null;
  }
}

// Uso mensual de la API (tabla api_usage); null si no es consultable
export async function getMonthlyApiUsage(companyId: string): Promise<number | null> {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const { data, error } = await supabase
      .from("api_usage")
      .select("id")
      .eq("company_id", companyId)
      .gte("created_at", startOfMonth.toISOString())
      .abortSignal(dbTimeout());
    if (error || !data) return null;
    return data.length;
  } catch {
    return null;
  }
}

// Base de las edge functions de la API pública
export function apiBaseUrl(): string {
  return `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
}

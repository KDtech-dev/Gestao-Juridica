"use client";

import type { AuthUser } from "@/context/AuthContext";
import type { PublicacaoFormData } from "@/components/publications/types";
import type { PublicacaoItem } from "@/api/publicacoes/types";

const STORAGE_KEY = "lawmanager-user-publications";
const DEFAULT_BANNER_IMAGE =
  "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1400&q=80";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatPublicationDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(date)
    .replace(".", "");
}

function estimateReadTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 180));

  return `${minutes} min`;
}

export function getStoredPublicacoes() {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "[]",
    ) as PublicacaoItem[];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredPublicacao(publicacao: PublicacaoItem) {
  if (typeof window === "undefined") return;

  const stored = getStoredPublicacoes();
  const nextStored = stored.some((item) => item.id === publicacao.id)
    ? stored.map((item) => (item.id === publicacao.id ? publicacao : item))
    : [publicacao, ...stored];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextStored));
}

export function buildPublicacaoFromForm(
  form: PublicacaoFormData,
  user: AuthUser | null,
  existing?: PublicacaoItem,
) {
  const titleSlug = slugify(form.titulo) || `publicacao-${Date.now()}`;
  const slug = existing?.slug ?? titleSlug;
  const now = new Date();

  return {
    id: existing?.id ?? `local-${Date.now()}`,
    slug,
    titulo: form.titulo.trim(),
    resumo: stripHtml(form.resumo),
    bannerImage:
      form.bannerImage || existing?.bannerImage || DEFAULT_BANNER_IMAGE,
    conteudoHtml: form.conteudo.includes("<")
      ? form.conteudo
      : form.conteudo
          .split(/\n{2,}/)
          .map((paragraph) => paragraph.trim())
          .filter(Boolean)
          .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
          .join(""),
    tipo: "Notícia Jurídica",
    categoria: form.categoria || existing?.categoria || "Publicação",
    categoriaId: form.categoriaId || existing?.categoriaId || null,
    autor: form.autor.trim() || user?.name || existing?.autor || "Usuário",
    authorEmail: user?.email || existing?.authorEmail,
    data: existing?.data ?? formatPublicationDate(now),
    readTime: estimateReadTime(form.conteudo),
    status: form.status,
    cliente: existing?.cliente || "Não informado",
    processo: existing?.processo || "Não informado",
    anexos: existing?.anexos ?? [],
  } satisfies PublicacaoItem;
}

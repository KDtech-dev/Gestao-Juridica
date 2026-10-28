  export const clearNumber = (value = "") => {
    return value.replace(/\D+/g, "");
  };

  export function formatTelefone(telefone: string) {
    const value = clearNumber(telefone);

    return value
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4,5})(\d{4})$/, "$1-$2");
  }

  export function formatCep(cep: string) {
    const digits = clearNumber(cep).slice(0, 8);

    if (digits.length <= 5) {
      return digits;
    }

    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }

  export function formatCpf(cpf: string) {
    const digits = clearNumber(cpf).slice(0, 11);

    if (digits.length <= 3) {
      return digits;
    }

    if (digits.length <= 6) {
      return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    }

    if (digits.length <= 9) {
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    }

    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }

  export function formatCnpj(cnpj: string) {
    const digits = clearNumber(cnpj).slice(0, 14);

    return digits
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  export function formatCpfCnpj(value: string) {
    const digits = clearNumber(value);

    if (digits.length <= 11) {
      const cpf = digits.slice(0, 11);

      if (cpf.length <= 3) {
        return cpf;
      }

      if (cpf.length <= 6) {
        return `${cpf.slice(0, 3)}.${cpf.slice(3)}`;
      }

      if (cpf.length <= 9) {
        return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6)}`;
      }

      return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
    }

    const cnpj = digits.slice(0, 14);

    return cnpj
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  export function formatNumeroProcesso(value: string) {
    const digits = clearNumber(value).slice(0, 20);

    let result = digits;

    if (digits.length > 7) {
      result = `${digits.slice(0, 7)}-${digits.slice(7)}`;
    }
    if (digits.length > 9) {
      result = `${digits.slice(0, 7)}-${digits.slice(7, 9)}.${digits.slice(9)}`;
    }
    if (digits.length > 13) {
      result = `${digits.slice(0, 7)}-${digits.slice(7, 9)}.${digits.slice(9, 13)}.${digits.slice(13)}`;
    }
    if (digits.length > 14) {
      result = `${digits.slice(0, 7)}-${digits.slice(7, 9)}.${digits.slice(9, 13)}.${digits.slice(13, 14)}.${digits.slice(14)}`;
    }
    if (digits.length > 16) {
      result = `${digits.slice(0, 7)}-${digits.slice(7, 9)}.${digits.slice(9, 13)}.${digits.slice(13, 14)}.${digits.slice(14, 16)}.${digits.slice(16)}`;
    }

    return result;
  }

  export const slugify = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  export const stripHtml = (value: string) =>
    value
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const intlLocale = (locale: string) =>
    locale === "pt" ? "pt-BR" : locale === "en" ? "en-US" : "es-ES";

  export const formatDate = (value: string | null | undefined, locale: string) => {
    if (!value) return "-";

    const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? dateFromApi(value)
      : new Date(value);
    if (!date || Number.isNaN(date.getTime())) return "-";

    return new Intl.DateTimeFormat(intlLocale(locale), {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
      .format(date)
      .replace(/\.$/, "");
  };

  export const dateFromApi = (value?: string | null): Date | null => {
    if (!value) return null;

    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, year, month, day] = match;
      const date = new Date(Number(year), Number(month) - 1, Number(day));
      if (
        date.getFullYear() !== Number(year) ||
        date.getMonth() !== Number(month) - 1 ||
        date.getDate() !== Number(day)
      ) return null;
      return date;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  export const dateToApi = (value?: Date | null): string | null => {
    if (!value || Number.isNaN(value.getTime())) return null;
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  export const isValidApiDate = (value: string): boolean => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = dateFromApi(value);
    return date !== null && dateToApi(date) === value;
  };

  export const formatDateFromApi = (
    value: string | null | undefined,
    locale: string,
  ): string => {
    const date = dateFromApi(value);
    if (!date) return "-";

    return new Intl.DateTimeFormat(intlLocale(locale), { dateStyle: "short" }).format(date);
  };

  export const estimateReadTime = (content?: string | null) => {
    const words = stripHtml(content ?? "")
      .split(/\s+/)
      .filter(Boolean).length;
    return `${Math.max(1, Math.ceil(words / 180))} min`;
  };

  export const slugifyPublicacao = (titulo: string, id: string) =>
    `${slugify(titulo) || "publicacao"}-${id}`;

  export const extractIdFromSlug = (slug: string): string | null => {
    return (
      slug.match(
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      )?.[0] ??
      slug.split("-").pop() ??
      null
    );
  };

  export const storageUrl = (
    caminho: string | null | undefined,
  ): string | null => {
    if (!caminho) return null;
    if (caminho.startsWith("http")) return caminho;
    return `/storage/${caminho}`;
  };

  export function formatDateByLocale(
    date: string | Date,
    locale: string,
  ): string {
    return new Intl.DateTimeFormat(intlLocale(locale), {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  }

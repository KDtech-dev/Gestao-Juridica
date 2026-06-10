import { RoleType } from "./types";


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

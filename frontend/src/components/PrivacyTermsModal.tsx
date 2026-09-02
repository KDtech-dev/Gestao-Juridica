"use client";

import { BaseModal } from "@/components/BaseModal";
import { useMemo } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function PrivacyTermsModal({ open, onClose }: Props) {
  const sections = useMemo(
    () => [
      {
        title: "Finalidade do tratamento",
        body: "Processamos dados pessoais apenas para entregar os serviços solicitados, responder às suas dúvidas e informar sobre o andamento dos casos.",
      },
      {
        title: "Compartilhamento",
        body: "Compartilhamos informações com parceiros confiáveis ou autoridades somente quando necessário para cumprir a lei ou executar um serviço solicitado.",
      },
      {
        title: "Segurança e direitos",
        body: "O acesso é restrito, as transmissões são protegidas e você pode consultar, corrigir ou excluir seus dados a qualquer momento.",
      },
    ],
    [],
  );

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="Termo de Privacidade"
      sections={sections}
    />
  );
}

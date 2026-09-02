"use client";

import { BaseModal } from "@/components/BaseModal";
import { useMemo } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function PrivacyPolicyModal({ open, onClose }: Props) {
  const sections = useMemo(
    () => [
      {
        title: "Introdução",
        body: "Esta Política de Privacidade descreve como tratamos os dados pessoais dos usuários para fornecer nossos serviços e garantir transparência sobre como as informações são coletadas, usadas e protegidas.",
      },
      {
        title: "Quais dados coletamos",
        body: "Podemos coletar dados como nome, contatos, informações sobre demandas jurídicas, e outras informações necessárias para atendimento, orçamento e acompanhamento de casos.",
      },
      {
        title: "Como utilizamos",
        body: "Utilizamos os dados para prestar serviços jurídicos, comunicar sobre o andamento de demandas, responder solicitações e cumprir obrigações legais.",
      },
      {
        title: "Compartilhamento",
        body: "Poderemos compartilhar dados com parceiros e autoridades apenas quando necessário para cumprir a lei, executar serviços contratados ou proteger direitos, sempre respeitando a legislação aplicável.",
      },
      {
        title: "Segurança e seus direitos",
        body: "Mantemos medidas de segurança para proteger os dados. Você pode solicitar acesso, correção, atualização, exclusão e outras providências relacionadas aos seus dados conforme a legislação.",
      },
    ],
    [],
  );

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="Política de Privacidade"
      sections={sections}
    />
  );
}

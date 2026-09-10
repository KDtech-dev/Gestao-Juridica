"use client";

import { BaseModal } from "@/components/BaseModal";
import { useTranslations } from "next-intl";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function PrivacyPolicyModal({ open, onClose }: Props) {
  const t = useTranslations("public.privacyPolicy");

  const sections = t.raw("sections") as {
    title: string;
    body: string;
  }[];

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={t("title")}
      sections={sections}
    />
  );
}
import { demoOffice } from "@/configs/demoOffice";

type Branding = {
  appName: string;
  tagline: string;
  description: string;
  modalImage: string;
  primaryColor: string;
  secondaryColor: string;
  modal: {
    confirmText: string;
    cancelText: string;
  };
};

export const BRANDING: Branding = {
  appName: demoOffice.productName,
  tagline: "Gestão jurídica inteligente e moderna",
  description:
    "Plataforma de gestão jurídica para organizar clientes, processos, agenda e informações financeiras em um só lugar.",
  modalImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f",
  primaryColor: demoOffice.colors.primary,
  secondaryColor: demoOffice.colors.secondary,
  modal: {
    confirmText: "Salvar",
    cancelText: "Cancelar",
  },
};

export const logoSrc = demoOffice.logo;
export const productLogoSrc = "/images/gestao-juridica.svg";

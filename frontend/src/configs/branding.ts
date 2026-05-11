type Branding = {
  appName: string;
  tagline: string;
  modalImage: string;
  primaryColor: string;
  secondaryColor: string;
  modal: {
    confirmText: string;
    cancelText: string;
  };
};

export const BRANDING: Branding = {
  appName: "Central Jurídica",
  tagline: "Gestão jurídica inteligente e moderna",
  modalImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f",
  primaryColor: "#0f172a",
  secondaryColor: "#334155",
  modal: {
    confirmText: "Salvar",
    cancelText: "Cancelar",
  },
};

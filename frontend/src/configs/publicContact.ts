export const institutionalPhone = "5533999377986";

export const institutionalWhatsappHref = (message: string) =>
  `https://wa.me/${institutionalPhone}?text=${encodeURIComponent(message)}`;

export const homeWhatsappHref = (message: string) =>
  `https://wa.me/5533999617510?text=${encodeURIComponent(message)}`;

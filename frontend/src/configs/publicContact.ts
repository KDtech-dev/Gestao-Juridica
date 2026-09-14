// Existing institutional contact, shared with the public footer.
export const institutionalPhone = "5533999377986";

export const institutionalWhatsappHref = (message: string) =>
  `https://wa.me/${institutionalPhone}?text=${encodeURIComponent(message)}`;

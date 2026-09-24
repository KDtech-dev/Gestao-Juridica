import { Tab, Tabs } from "@mui/material";
import type { CompromissoVisao } from "@/api/apiCompromissos";
import { useTranslation } from "@/hooks/useTranslation";
import { CardPaper } from "./Cardpaper";

interface AgendaVisaoTabsProps {
  value: CompromissoVisao;
  onChange: (value: CompromissoVisao) => void;
}

export function AgendaVisaoTabs({ value, onChange }: AgendaVisaoTabsProps) {
  const { t } = useTranslation();

  return (
    <CardPaper sx={{ mb: 2, borderRadius: "14px" }}>
      <Tabs
        value={value}
        onChange={(_, next: CompromissoVisao) => onChange(next)}
        sx={{ px: 1 }}
      >
        <Tab value="publica" label={t("agenda.views.public")} />
        <Tab value="pessoal" label={t("agenda.views.personal")} />
      </Tabs>
    </CardPaper>
  );
}
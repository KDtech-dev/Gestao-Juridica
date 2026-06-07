import { Icon } from "@/components/AppIcon";
import { Button, Grid, Stack, Typography } from "@mui/material";
import { PrivacyTermsModal } from "@/components/PrivacyTermsModal";
import { useTranslations } from "next-intl";

type Props = {
  privacyOpen: boolean;
  onOpenPrivacy: () => void;
  onClosePrivacy: () => void;
  onOpenChangePassword: () => void;
};

const CardSeguranca = ({
  privacyOpen,
  onOpenPrivacy,
  onClosePrivacy,
  onOpenChangePassword,
}: Props) => {
  const t = useTranslations("internal.profile.security");

  return (
    <Grid
      sx={{
        borderRadius: "10px",
        border: "1px solid",
        borderColor: "divider",
        p: 2,
        mb: 1,
        gap: 1,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
        <Icon icon="mdi:shield-outline" width={18} color="currentColor" />
        <Typography fontWeight={700} color="text.primary">
          {t("title")}
        </Typography>
      </Stack>

      <Typography color="text.secondary" fontSize="0.86rem">
        {t("description")}
      </Typography>

      <Button
        variant="text"
        fullWidth
        sx={{
          justifyContent: "flex-start",
          textTransform: "none",
          color: "text.secondary",
          mb: 1.5,
        }}
        startIcon={<Icon icon="mdi:file-document-outline" width={20} />}
        onClick={onOpenPrivacy}
      >
        {t("privacyTerms")}
      </Button>
      <Button
        variant="outlined"
        fullWidth
        sx={{
          textTransform: "none",
          borderRadius: "10px",
          borderColor: "divider",
          color: "text.secondary",
          mb: 1.8,
        }}
        onClick={onOpenChangePassword}
      >
        {t("changePassword")}
      </Button>
      <PrivacyTermsModal open={privacyOpen} onClose={onClosePrivacy} />
    </Grid>
  );
};

export default CardSeguranca;

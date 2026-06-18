// views/ProfileView.tsx
"use client";

import {
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { HeaderDashboard } from "@/components/HeaderADM";
import { SidebarDashboard } from "@/components/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  profileFormSchema,
  ProfileFormSchemaType,
} from "@/schemas/ProfileSchema";
import CardSeguranca from "@/components/users/CardSeguranca";
import CardPersonalizacao from "@/components/users/CardPersonalizacao";
import { useThemeMode } from "@/theme/ThemeRegistry";
import { useLanguage } from "@/context/LanguageContext";
import { ChangePasswordModal } from "@/components/modals/ChangePasswordModal";
import { getUserById, updateUser } from "@/api/ApiUsers";
import type { CategoriaType, RoleType, UserType } from "@/@core/types";
import { CardDadosProfissionais } from "@/components/CardDadosProfissionais";
import { CardDadosPessoais } from "@/components/CardDadosPessoais";
import { useRouter } from "next/navigation";
import { toast, formatToastErrorMessage } from "@/utils/toast";
import { CardEndereco } from "@/components/CardEndereco";
import PickColor from "@/components/PickColor";
import { Icon } from "@/components/AppIcon";

type ProfileTab = "dados" | "seguranca" | "personalizacao";

export default function ProfileView() {
  const t = useTranslations("internal.profile");
  const { themeMode, setThemeMode } = useThemeMode();
  const { hasRole, user } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarHovered, setAvatarHovered] = useState(false);
  const [profileUser, setProfileUser] = useState<UserType | null>(null);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>("dados");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const isAdvogado = hasRole("advogado");
  const isFuncionario = hasRole("funcionario");
  const isAdmin = hasRole("admin");

  const isAdvogadoRef = useRef(isAdvogado);
  const isFuncionarioRef = useRef(isFuncionario);
  const themeModeRef = useRef(themeMode);
  const languageRef = useRef(language);

  useEffect(() => {
    isAdvogadoRef.current = isAdvogado;
    isFuncionarioRef.current = isFuncionario;
    themeModeRef.current = themeMode;
    languageRef.current = language;
  });

  const roleNormalized: RoleType | undefined = isAdvogado
    ? "advogado"
    : isFuncionario
      ? "funcionario"
      : isAdmin
        ? "admin"
        : undefined;

  const roleLabel = roleNormalized
    ? t(`roles.${roleNormalized}`)
    : t("roles.user");

  const form = useForm<ProfileFormSchemaType>({
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      name: "",
      email: "",
      cpf: "",
      advogado: {
        celular: "",
        oab_numero: "",
        oab_uf: "",
        categorias: [],
        sexo: null,
        resumo_pessoal: "",
      },
      funcionario: {
        celular: "",
        data_nascimento: "",
        sexo: null,
        resumo_pessoal: "",
      },
      endereco: null,
      tema: themeMode,
      idioma: language,
      cor_perfil: null,
    },
    resolver: zodResolver(profileFormSchema),
  });

  const { isDirty } = form.formState;

  useEffect(() => {
    if (!user?.id) return;
    getUserById(String(user.id))
      .then((fetchedUser) => {
        setProfileUser(fetchedUser);
        setAvatar(
          fetchedUser.advogado?.foto_perfil_url ??
            fetchedUser.funcionario?.foto_perfil_url ??
            null,
        );
        form.reset({
          name: fetchedUser.name ?? "",
          email: fetchedUser.email ?? "",
          cpf: fetchedUser.cpf ?? "",
          advogado: isAdvogadoRef.current
            ? {
                celular: fetchedUser.advogado?.celular ?? "",
                oab_numero: fetchedUser.advogado?.oab_numero ?? "",
                oab_uf: fetchedUser.advogado?.oab_uf ?? "",
                categorias:
                  fetchedUser.advogado?.categorias?.map(
                    (c: CategoriaType) => c.id,
                  ) ?? [],
                sexo: fetchedUser.advogado?.sexo ?? null,
                resumo_pessoal: fetchedUser.advogado?.resumo_pessoal ?? "",
              }
            : undefined,
          funcionario: isFuncionarioRef.current
            ? {
                celular: fetchedUser.funcionario?.celular ?? "",
                data_nascimento: fetchedUser.funcionario?.data_nascimento ?? "",
                sexo: fetchedUser.funcionario?.sexo ?? null,
                resumo_pessoal: fetchedUser.funcionario?.resumo_pessoal ?? "",
              }
            : undefined,
          endereco:
            fetchedUser.advogado?.endereco ??
            fetchedUser.funcionario?.endereco ??
            null,
          tema: themeModeRef.current,
          idioma: languageRef.current,
          cor_perfil: fetchedUser.cor_perfil ?? null,
        });
      })
      .catch(() => {});
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const formRef = useRef(form);
  useEffect(() => {
    formRef.current.setValue("tema", themeMode);
    formRef.current.setValue("idioma", language);
  }, [themeMode, language]);

  const handleSaveProfile = form.handleSubmit(async (data) => {
    if (!user?.id) return;
    const { tema, idioma, ...payload } = data;
    try {
      setSaving(true);
      await updateUser(String(user.id), {
        ...payload,
        ...(roleNormalized ? { role: roleNormalized } : {}),
      });
      await setLanguage(idioma);
      setThemeMode(tema);
      form.reset(data);
      router.refresh();
      toast.success(t("toast.saveSuccess"));
    } catch (err) {
      toast.error(formatToastErrorMessage(err, t("toast.saveError")));
    } finally {
      setSaving(false);
    }
  });

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setAvatar(URL.createObjectURL(file));
  };

  const corPerfil = form.watch("cor_perfil");
  const accentColor =
    corPerfil && corPerfil !== "#9e9e9e" ? corPerfil : "#2563eb";
  const bannerBackground =
    corPerfil && corPerfil !== "#9e9e9e"
      ? `linear-gradient(135deg, ${corPerfil} 0%, ${corPerfil}bb 100%)`
      : "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)";

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <SidebarDashboard activeKey="perfil" />

      <Box sx={{ ml: { xs: 0, md: "280px" }, minWidth: 0 }}>
        <HeaderDashboard showSearch={false} />

        <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 }, py: 3.2 }}>
          {/* Page header — mesma estrutura da agenda */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            gap={2}
            mb={2.2}
          >
            <Box>
              <Typography variant="h4" fontWeight={700} color="text.primary">
                {t("title")}
              </Typography>
              <Typography color="text.secondary" fontSize="0.85rem">
                {t("subtitle")}
              </Typography>
            </Box>

            <Button
              variant="contained"
              disabled={!isDirty || saving}
              onClick={handleSaveProfile}
              startIcon={
                saving ? (
                  <Icon icon="mdi:loading" width={18} />
                ) : (
                  <Icon icon="mdi:content-save-outline" width={18} />
                )
              }
              sx={{
                textTransform: "none",
                borderRadius: "12px",
                px: 2.2,
              }}
            >
              {saving ? t("actions.saving") : t("actions.saveChanges")}
            </Button>
          </Stack>

          <FormProvider {...form}>
            <form>
              {/* Hero card: banner + avatar + info */}
              <Paper
                sx={{
                  mb: 2,
                  borderRadius: "16px",
                  border: "1px solid",
                  borderColor: "divider",
                  overflow: "hidden",
                  boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
                }}
              >
                {/* Banner */}
                <Box
                  sx={{
                    height: 130,
                    background: bannerBackground,
                    position: "relative",
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "flex-end",
                    px: 3,
                    pb: 2,
                  }}
                >
                  <PickColor name="cor_perfil" defaultColor="#9e9e9e" />
                </Box>

                {/* Avatar + info row */}
                <Box sx={{ px: { xs: 2, md: 3 }, pb: 2.5 }}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    justifyContent="space-between"
                    gap={2}
                  >
                    {/* Avatar (overlaps banner by -28px) */}
                    <Stack direction="row" alignItems="flex-end" gap={2} mt="-28px">
                      <Box
                        component="label"
                        onMouseEnter={() => setAvatarHovered(true)}
                        onMouseLeave={() => setAvatarHovered(false)}
                        sx={{ cursor: "pointer", position: "relative", display: "inline-block", borderRadius: "50%" }}
                      >
                        <Avatar
                          src={avatar ?? undefined}
                          sx={{
                            width: 82,
                            height: 82,
                            border: "4px solid",
                            borderColor: "background.paper",
                            boxShadow: "0 4px 14px rgba(15,23,42,0.14)",
                            transition: "filter 0.18s",
                            filter: avatarHovered ? "brightness(0.72)" : "none",
                          }}
                        />
                        <Box
                          sx={{
                            position: "absolute",
                            inset: 0,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            opacity: avatarHovered ? 1 : 0,
                            transition: "opacity 0.18s",
                            pointerEvents: "none",
                          }}
                        >
                          <Icon icon="mdi:camera" width={22} color="#fff" />
                        </Box>
                        <Box
                          sx={{
                            position: "absolute",
                            bottom: 3,
                            right: 3,
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            bgcolor: accentColor,
                            border: "2px solid",
                            borderColor: "background.paper",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: 1,
                            transition: "transform 0.18s",
                            transform: avatarHovered ? "scale(1.15)" : "scale(1)",
                          }}
                        >
                          <Icon icon="mdi:plus" width={13} color="#fff" />
                        </Box>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={handleAvatarChange}
                        />
                      </Box>

                      <Box sx={{ pb: 0.4 }}>
                        <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                          <Typography fontWeight={700} fontSize="1.15rem" color="text.primary">
                            {user?.name}
                          </Typography>
                          <Chip
                            size="small"
                            label={roleLabel}
                            sx={{
                              bgcolor: `${accentColor}18`,
                              color: accentColor,
                              fontWeight: 600,
                              border: "1px solid",
                              borderColor: `${accentColor}44`,
                            }}
                          />
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          {user?.email}
                        </Typography>
                        {isAdvogado && profileUser?.advogado && (
                          <Stack direction="row" alignItems="center" gap={0.5} mt={0.3}>
                            <Icon icon="mdi:gavel" width={14} color={accentColor} />
                            <Typography fontSize="0.82rem" color="primary">
                              OAB/{profileUser.advogado.oab_uf}{" "}
                              {profileUser.advogado.oab_numero}
                            </Typography>
                          </Stack>
                        )}
                      </Box>
                    </Stack>

                    {/* Quick stats — visão rápida do perfil */}
                    <Stack
                      direction="row"
                      gap={1.5}
                      sx={{ display: { xs: "none", md: "flex" } }}
                    >
                      {[
                        { icon: "mdi:shield-check-outline", label: t("stats.security"), value: "2FA" },
                        { icon: "mdi:translate", label: t("stats.language"), value: language?.toUpperCase() ?? "PT" },
                        { icon: "mdi:palette-outline", label: t("stats.theme"), value: themeMode === "dark" ? t("stats.dark") : t("stats.light") },
                      ].map((stat) => (
                        <Paper
                          key={stat.label}
                          sx={{
                            px: 1.6,
                            py: 1,
                            borderRadius: "12px",
                            border: "1px solid",
                            borderColor: "divider",
                            textAlign: "center",
                            minWidth: 72,
                          }}
                        >
                          <Icon icon={stat.icon} width={18} color={accentColor} />
                          <Typography fontWeight={700} fontSize="0.85rem" mt={0.2}>
                            {stat.value}
                          </Typography>
                          <Typography color="text.secondary" fontSize="0.72rem">
                            {stat.label}
                          </Typography>
                        </Paper>
                      ))}
                    </Stack>
                  </Stack>
                </Box>

                {/* Tabs de navegação — mesma estrutura dos tabs da agenda */}
                <Tabs
                  value={activeTab}
                  onChange={(_, value: ProfileTab) => setActiveTab(value)}
                  sx={{ px: 2, borderTop: "1px solid", borderColor: "divider" }}
                >
                  <Tab value="dados" label={t("tabs.data")} />
                  <Tab value="personalizacao" label={t("tabs.customization")} />
                  <Tab value="seguranca" label={t("tabs.security")} />
                </Tabs>
              </Paper>

              {/* Conteúdo da aba — grid 1.45fr 0.7fr igual à agenda */}
              {activeTab === "dados" && (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", lg: "1.45fr 0.7fr" },
                    gap: 2,
                  }}
                >
                  <Stack spacing={2}>
                    <CardDadosPessoais
                      isAdvogado={isAdvogado}
                      isFuncionario={isFuncionario}
                    />
                    <CardDadosProfissionais
                      isAdvogado={isAdvogado}
                      profileUser={profileUser}
                    />
                    <CardEndereco
                      isAdvogado={isAdvogado}
                      isFuncionario={isFuncionario}
                    />
                  </Stack>

                  {/* Painel lateral — resumo do progresso do perfil */}
                  <Stack spacing={2}>
                    <Paper
                      sx={{
                        p: 2.2,
                        borderRadius: "16px",
                        border: "1px solid",
                        borderColor: "divider",
                        boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
                      }}
                    >
                      <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                        <Icon icon="mdi:account-circle-outline" width={20} />
                        <Typography fontWeight={700} fontSize="1rem" color="text.primary">
                          {t("profilePanel.title")}
                        </Typography>
                      </Stack>

                      <Divider sx={{ mb: 1.5 }} />

                      <Stack spacing={1.2}>
                        {[
                          { icon: "mdi:account-outline", label: t("profilePanel.name"), value: user?.name, done: !!user?.name },
                          { icon: "mdi:email-outline", label: t("profilePanel.email"), value: user?.email, done: !!user?.email },
                          { icon: "mdi:card-account-details-outline", label: t("profilePanel.cpf"), value: profileUser?.cpf ? "••••••••" : null, done: !!profileUser?.cpf },
                          { icon: "mdi:phone-outline", label: t("profilePanel.phone"), value: profileUser?.advogado?.celular ?? profileUser?.funcionario?.celular ?? null, done: !!(profileUser?.advogado?.celular ?? profileUser?.funcionario?.celular) },
                          { icon: "mdi:map-marker-outline", label: t("profilePanel.address"), value: profileUser?.advogado?.endereco ? t("profilePanel.filled") : null, done: !!(profileUser?.advogado?.endereco ?? profileUser?.funcionario?.endereco) },
                        ].map((item) => (
                          <Stack
                            key={item.label}
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            gap={1}
                          >
                            <Stack direction="row" alignItems="center" gap={1}>
                              <Icon
                                icon={item.icon}
                                width={16}
                                color={item.done ? accentColor : "#9ca3af"}
                              />
                              <Typography fontSize="0.83rem" color="text.secondary">
                                {item.label}
                              </Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center" gap={0.5}>
                              {item.value && (
                                <Typography fontSize="0.8rem" color="text.primary" fontWeight={600} noWrap sx={{ maxWidth: 90 }}>
                                  {item.value}
                                </Typography>
                              )}
                              <Icon
                                icon={item.done ? "mdi:check-circle" : "mdi:circle-outline"}
                                width={16}
                                color={item.done ? "#059669" : "#d1d5db"}
                              />
                            </Stack>
                          </Stack>
                        ))}
                      </Stack>
                    </Paper>

                    {isDirty && (
                      <Paper
                        sx={{
                          p: 1.8,
                          borderRadius: "14px",
                          border: "1px solid",
                          borderColor: "warning.light",
                          bgcolor: "rgba(234,179,8,0.06)",
                        }}
                      >
                        <Stack direction="row" gap={1} alignItems="flex-start">
                          <Icon icon="mdi:information-outline" width={18} color="#ca8a04" />
                          <Box>
                            <Typography fontWeight={700} fontSize="0.85rem" color="warning.dark">
                              {t("unsavedBanner.title")}
                            </Typography>
                            <Typography fontSize="0.8rem" color="text.secondary" mt={0.2}>
                              {t("unsavedBanner.description")}
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    )}
                  </Stack>
                </Box>
              )}

              {activeTab === "personalizacao" && (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", lg: "1.45fr 0.7fr" },
                    gap: 2,
                  }}
                >
                  <CardPersonalizacao form={form} />
                </Box>
              )}

              {activeTab === "seguranca" && (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", lg: "1.45fr 0.7fr" },
                    gap: 2,
                  }}
                >
                  <CardSeguranca
                    privacyOpen={privacyOpen}
                    onOpenPrivacy={() => setPrivacyOpen(true)}
                    onClosePrivacy={() => setPrivacyOpen(false)}
                    onOpenChangePassword={() => setChangePasswordOpen(true)}
                  />
                </Box>
              )}
            </form>
          </FormProvider>
        </Container>
      </Box>

      <ChangePasswordModal
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </Box>
  );
}
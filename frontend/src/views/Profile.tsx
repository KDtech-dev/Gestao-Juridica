"use client";

import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Card,
  Container,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { HeaderDashboard } from "@/components/HeaderADM";
import { SidebarDashboard } from "@/components/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { FormControl } from "@mui/material";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  profileFormSchema,
  ProfileFormSchemaType,
} from "@/schemas/ProfileSchema";
import CardSeguranca from "@/components/users/CardSeguranca";
import CardPersonalizacao from "@/components/users/CardPersonalizacao";
import { clearNumber, formatCpf, formatTelefone } from "@/@core/format";
import { useThemeMode } from "@/theme/ThemeRegistry";
import { useLanguage } from "@/context/LanguageContext";
import { ChangePasswordModal } from "@/components/modals/ChangePasswordModal";
import { getUserById, updateUser } from "@/api/ApiUsers";
import type { RoleType, UserType } from "@/@core/types";

const practiceAreaKeys = [
  "civil",
  "labor",
  "tax",
  "criminal",
  "business",
  "administrative",
  "socialSecurity",
  "family",
  "intellectualProperty",
  "contracts",
];

export default function ProfileView() {
  const t = useTranslations("internal.profile");
  const { themeMode, setThemeMode } = useThemeMode();
  const { hasRole, user } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [profileUser, setProfileUser] = useState<UserType | null>(null);

  const isAdvogado = hasRole("advogado");
  const isFuncionario = hasRole("funcionario");
  const isAdmin = hasRole("admin");

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

  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const form = useForm<ProfileFormSchemaType>({
    defaultValues: {
      name: "",
      email: "",
      cpf: "",
      advogado: {
        celular: "",
        oab_numero: "",
        oab_uf: "",
        especialidade: [],
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
    },
    resolver: zodResolver(profileFormSchema),
  });

  const { isDirty } = form.formState;

  useEffect(() => {
    if (!user?.id) return;
    getUserById(String(user.id))
      .then((user) => {
        setProfileUser(user);
        setAvatar(
          user.advogado?.foto_perfil_url ??
            user.funcionario?.foto_perfil_url ??
            null,
        );

        form.reset({
          name: user.name ?? "",
          email: user.email ?? "",
          cpf: user.cpf ?? "",

          advogado: isAdvogado
            ? {
                celular: user.advogado?.celular ?? "",
                oab_numero: user.advogado?.oab_numero ?? "",
                oab_uf: user.advogado?.oab_uf ?? "",
                especialidade: Array.isArray(user.advogado?.especialidade)
                  ? user.advogado.especialidade
                  : [],
                sexo: user.advogado?.sexo ?? null,
                resumo_pessoal: user.advogado?.resumo_pessoal ?? "",
              }
            : undefined,

          funcionario: isFuncionario
            ? {
                celular: user.funcionario?.celular ?? "",
                data_nascimento: user.funcionario?.data_nascimento ?? "",
                sexo: user.funcionario?.sexo ?? null,
                resumo_pessoal: user.funcionario?.resumo_pessoal ?? "",
              }
            : undefined,

          endereco:
            user.advogado?.endereco ?? user.funcionario?.endereco ?? null,

          tema: themeMode,
          idioma: language,
        });
      })
      .catch(() => {});
  }, [user?.id]);

  useEffect(() => {
    form.reset((current) => ({
      ...current,
      tema: themeMode,
      idioma: language,
    }));
  }, [themeMode, language]);

  const handleSaveProfile = form.handleSubmit(async (data) => {
    if (!user?.id) return;

    const { tema, idioma, ...payload } = data;

    try {
      await updateUser(String(user.id), {
        ...payload,
        ...(roleNormalized ? { role: roleNormalized } : {}),
      });
      await setLanguage(idioma);
      setThemeMode(tema);
      form.reset(data);
    } catch (err) {
      console.error("Erro ao salvar:", err);
    }
  });

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setAvatar(URL.createObjectURL(file));
  };

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        display: "block",
      }}
    >
      <SidebarDashboard activeKey="perfil" />

      <Box sx={{ ml: { xs: 0, md: "280px" }, minWidth: 0 }}>
        <HeaderDashboard showSearch={false} />

        <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 }, pb: 3.2 }}>
          <Grid
            container
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography variant="h4" fontWeight={700} color="text.primary">
                {t("title")}
              </Typography>
            </Box>
          </Grid>

          <FormProvider {...form}>
            <form onSubmit={handleSaveProfile}>
              {" "}
              {/* ← chamada do handler */}
              <Card sx={{ borderRadius: "16px", overflow: "hidden", p: 0 }}>
                <Box
                  sx={{
                    width: { xs: "calc(100% + 32px)", md: "calc(100% + 64px)" },
                    ml: { xs: "-16px", md: "-32px" },
                    mr: { xs: "-16px", md: "-32px" },
                    height: 150,
                    background:
                      "linear-gradient(90deg, #2563eb 0%, #60a5fa 100%)",
                    display: "flex",
                    alignItems: "flex-end",
                    px: 2.5,
                    pb: 3,
                  }}
                >
                  <Grid spacing={6} ml={5}>
                    <Typography fontWeight={700} fontSize="1.8rem" color="#fff">
                      {roleLabel}
                    </Typography>
                  </Grid>
                </Box>

                <Box sx={{ px: 2.5, pb: 3 }}>
                  <Grid
                    container
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ px: 2.5, mb: 2 }}
                  >
                    <Grid display="flex" alignItems="center" gap={2}>
                      <Box sx={{ position: "relative" }}>
                        <Avatar
                          src={avatar ?? undefined}
                          sx={{
                            width: 76,
                            height: 76,
                            border: "4px solid #fff",
                            position: "relative",
                            top: -25,
                            cursor: "pointer",
                          }}
                        />
                        <input
                          type="file"
                          accept="image/*"
                          style={{
                            position: "absolute",
                            inset: 0,
                            opacity: 0,
                            cursor: "pointer",
                          }}
                          onChange={handleAvatarChange}
                        />
                      </Box>
                      <Box>
                        <Typography fontWeight={600}>{user?.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user?.email}
                        </Typography>
                        {isAdvogado && profileUser?.advogado && (
                          <Typography
                            variant="body2"
                            color="primary"
                            fontSize="0.82rem"
                          >
                            OAB/{profileUser.advogado.oab_uf}{" "}
                            {profileUser.advogado.oab_numero}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                    <Grid>
                      <Button
                        type="submit"
                        variant="contained"
                        sx={{
                          textTransform: "none",
                          borderRadius: "10px",
                          px: 2.2,
                        }}
                        disabled={!isDirty}
                      >
                        {t("actions.saveChanges")}
                      </Button>
                    </Grid>
                  </Grid>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", lg: "1.8fr 0.85fr" },
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography
                        fontWeight={700}
                        color="text.primary"
                        mb={1.2}
                      >
                        {t("sections.personalInfo")}
                      </Typography>

                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                          gap: 1.4,
                          mb: 2.3,
                        }}
                      >
                        <Controller
                          name="name"
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <TextField
                              {...field}
                              label={t("fields.fullName")}
                              placeholder={t("fields.namePlaceholder")}
                              error={!!fieldState.error}
                              helperText={fieldState.error?.message}
                              fullWidth
                              sx={{ mt: "1.5em" }}
                            />
                          )}
                        />
                        <Controller
                          name="email"
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <TextField
                              {...field}
                              label={t("fields.professionalEmail")}
                              placeholder={t("fields.emailPlaceholder")}
                              error={!!fieldState.error}
                              helperText={fieldState.error?.message}
                              fullWidth
                              sx={{ mt: "1.5em" }}
                            />
                          )}
                        />
                        <Controller
                          name={
                            isAdvogado
                              ? "advogado.celular"
                              : "funcionario.celular"
                          }
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <TextField
                              label={t("fields.phone")}
                              placeholder="(00) 00000-0000"
                              value={formatTelefone(field.value || "")}
                              onChange={(e) =>
                                field.onChange(clearNumber(e.target.value))
                              }
                              error={!!fieldState.error}
                              helperText={fieldState.error?.message}
                              fullWidth
                            />
                          )}
                        />
                        <Controller
                          name="cpf"
                          control={form.control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label={t("fields.cpf")}
                              placeholder="000.000.000-00"
                              value={formatCpf(field.value || "")}
                              onChange={(e) =>
                                field.onChange(clearNumber(e.target.value))
                              }
                              fullWidth
                              disabled
                            />
                          )}
                        />
                      </Box>

                      {isAdvogado && (
                        <Box sx={{ display: "grid", gap: 1.4 }}>
                          <Typography
                            fontWeight={700}
                            color="text.primary"
                            mb={1.2}
                          >
                            {t("sections.professionalData")}
                          </Typography>
                          <Box
                            sx={{
                              display: "grid",
                              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                              gap: 1.4,
                            }}
                          >
                            <Controller
                              name="advogado.oab_numero"
                              control={form.control}
                              render={({ field, fieldState }) => (
                                <TextField
                                  {...field}
                                  label={t("fields.oabNumber")}
                                  placeholder={t("fields.oabNumberPlaceholder")}
                                  error={!!fieldState.error}
                                  helperText={fieldState.error?.message}
                                  fullWidth
                                />
                              )}
                            />
                            <Controller
                              name="advogado.oab_uf"
                              control={form.control}
                              render={({ field, fieldState }) => (
                                <TextField
                                  {...field}
                                  label="UF OAB"
                                  inputProps={{ maxLength: 2 }}
                                  error={!!fieldState.error}
                                  helperText={fieldState.error?.message}
                                  fullWidth
                                />
                              )}
                            />
                          </Box>
                          <FormControl fullWidth>
                            <Controller
                              name="advogado.especialidade"
                              control={form.control}
                              render={({ field }) => (
                                <Autocomplete
                                  multiple
                                  freeSolo
                                  options={practiceAreaKeys.map((k) =>
                                    t(`practiceAreas.${k}`),
                                  )}
                                  value={field.value ?? []}
                                  onChange={(_, value) => field.onChange(value)}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      label={t("fields.specialties")}
                                      placeholder={
                                        field.value?.length
                                          ? ""
                                          : t("fields.specialtiesPlaceholder")
                                      }
                                    />
                                  )}
                                />
                              )}
                            />
                          </FormControl>
                        </Box>
                      )}

                      {isFuncionario && profileUser?.funcionario && (
                        <Box sx={{ display: "grid", gap: 1.4 }}>
                          <Typography
                            fontWeight={700}
                            color="text.primary"
                            mb={1.2}
                          >
                            {t("sections.professionalData")}
                          </Typography>
                          <Controller
                            name="funcionario.resumo_pessoal"
                            control={form.control}
                            render={({ field, fieldState }) => (
                              <TextField
                                {...field}
                                label={t("fields.position")}
                                placeholder={t("fields.positionPlaceholder")}
                                error={!!fieldState.error}
                                helperText={fieldState.error?.message}
                                fullWidth
                              />
                            )}
                          />
                        </Box>
                      )}
                    </Box>

                    <Box flexDirection="column">
                      <CardPersonalizacao form={form} />
                      <CardSeguranca
                        privacyOpen={privacyOpen}
                        onOpenPrivacy={() => setPrivacyOpen(true)}
                        onClosePrivacy={() => setPrivacyOpen(false)}
                        onOpenChangePassword={() => setChangePasswordOpen(true)}
                      />
                      <ChangePasswordModal
                        open={changePasswordOpen}
                        onClose={() => setChangePasswordOpen(false)}
                      />
                    </Box>
                  </Box>
                </Box>
              </Card>
            </form>
          </FormProvider>
        </Container>
      </Box>
    </Box>
  );
}

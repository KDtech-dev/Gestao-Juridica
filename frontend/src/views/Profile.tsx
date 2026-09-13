"use client";

import {
  Avatar,
  Box,
  Button,
  Card,
  Container,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { HeaderDashboard } from "@/components/HeaderADM";
import { SidebarDashboard } from "@/components/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createProfileFormSchema,
  ProfileFormSchemaType,
} from "@/schemas/ProfileSchema";
import CardSeguranca from "@/components/users/CardSeguranca";
import CardPersonalizacao from "@/components/users/CardPersonalizacao";
import { useThemeMode } from "@/theme/ThemeRegistry";
import { useLanguage } from "@/context/LanguageContext";
import { ChangePasswordModal } from "@/components/modals/ChangePasswordModal";
import { getUserById, postFotoPerfil, updateUser } from "@/api/ApiUsers";
import type { CategoriaType, RoleType, UserType } from "@/@core/types";
import { CardDadosProfissionais } from "@/components/CardDadosProfissionais";
import { CardDadosPessoais } from "@/components/CardDadosPessoais";
import { useRouter } from "next/navigation";
import { toast, formatToastErrorMessage } from "@/utils/toast";
import { CardEndereco } from "@/components/CardEndereco";
import PickColor from "@/components/PickColor";
import { Icon } from "@/components/AppIcon";

export default function ProfileView() {
  const t = useTranslations("internal.profile");
  const tValidation = useTranslations("validation");
  const { themeMode, setThemeMode } = useThemeMode();
  const { hasRole, user, refreshUser } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarHovered, setAvatarHovered] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [profileUser, setProfileUser] = useState<UserType | null>(null);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
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

  const profileFormSchema = createProfileFormSchema(tValidation);

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

    const loadUser = async () => {
      try {
        const { data: fetchedUser } = await getUserById(String(user.id));

        setProfileUser(fetchedUser);

        setAvatar(fetchedUser.foto_perfil_url ?? null);

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
      } catch (err) {
        toast.error(formatToastErrorMessage(err, t("toast.loadProfileError")));
      }
    };

    loadUser();
  }, [user?.id]);
  const formRef = useRef(form);
  useEffect(() => {
    formRef.current.setValue("tema", themeMode);
    formRef.current.setValue("idioma", language);
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
      router.refresh();
      toast.success(t("toast.saveSuccess"));
    } catch (err) {
      toast.error(formatToastErrorMessage(err, t("toast.saveError")));
    }
  });

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    const previewUrl = URL.createObjectURL(file);
    const avatarAnterior = avatar;
    setAvatar(previewUrl);
    setAvatarUploading(true);

    try {
      const { data: usuarioAtualizado } = await postFotoPerfil(
        String(user.id),
        file,
      );

      setAvatar(usuarioAtualizado.foto_perfil_url ?? null);
      setProfileUser((prev) =>
        prev ? { ...prev, foto_perfil_url: usuarioAtualizado.foto_perfil_url } : prev,
      );
      refreshUser({ foto_perfil_url: usuarioAtualizado.foto_perfil_url });
      toast.success(t("toast.avatarUploadSuccess"));
    } catch (err) {
      setAvatar(avatarAnterior);
      toast.error(formatToastErrorMessage(err, t("toast.avatarUploadError")));
    } finally {
      setAvatarUploading(false);
      URL.revokeObjectURL(previewUrl);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }
    }
  };
  const corPerfil = form.watch("cor_perfil");
  const bannerBackground =
    corPerfil && corPerfil !== "#9e9e9e"
      ? `linear-gradient(90deg, ${corPerfil} 0%, ${corPerfil}99 100%)`
      : "linear-gradient(90deg, #2563eb 0%, #60a5fa 100%)";
  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <SidebarDashboard activeKey="perfil" />
      <Box sx={{ ml: { xs: 0, md: "280px" }, minWidth: 0 }}>
        <HeaderDashboard showSearch={false} />
        <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 }, pb: 3.2 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h4" fontWeight={700} color="text.primary">
              {t("title")}
            </Typography>
          </Box>
          <FormProvider {...form}>
            <form>
              <Card sx={{ borderRadius: "16px", overflow: "hidden", p: 0 }}>
                <Box
                  sx={{
                    width: { xs: "calc(100% + 32px)", md: "calc(100% + 64px)" },
                    ml: { xs: "-16px", md: "-32px" },
                    mr: { xs: "-16px", md: "-32px" },
                    height: 150,
                    background: bannerBackground,
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    px: 2.5,
                    pb: 3,
                    pr: 5,
                  }}
                >
                  <Grid spacing={6} ml={5}>
                    <Typography fontWeight={700} fontSize="1.8rem" color="#fff">
                      {roleLabel}
                    </Typography>
                  </Grid>
                  <PickColor
                    name="cor_perfil"
                    defaultColor={profileUser?.cor_perfil ?? "#9e9e9e"}
                  />
                </Box>
                <Box sx={{ px: 2.5, pb: 3 }}>
                  <Grid
                    container
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ px: 2.5, mb: 2 }}
                  >
                    <Grid display="flex" alignItems="center" gap={2}>
                      <Box
                        component="label"
                        onMouseEnter={() => setAvatarHovered(true)}
                        onMouseLeave={() => setAvatarHovered(false)}
                        sx={{
                          position: "relative",
                          top: -25,
                          cursor: "pointer",
                          display: "inline-block",
                          borderRadius: "50%",
                        }}
                      >
                        <Avatar
                          src={avatar ?? undefined}
                          sx={{
                            width: 76,
                            height: 76,
                            border: "4px solid #fff",
                            transition: "filter 0.2s",
                            filter: avatarHovered ? "brightness(0.75)" : "none",
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
                            transition: "opacity 0.2s",
                            pointerEvents: "none",
                          }}
                        >
                          <Icon icon="mdi:camera" width={24} color="#fff" />
                        </Box>
                        <Box
                          sx={{
                            position: "absolute",
                            bottom: 2,
                            right: 2,
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            bgcolor: "primary.main",
                            border: "2px solid #fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: 1,
                            transition: "transform 0.2s",
                            transform: avatarHovered
                              ? "scale(1.15)"
                              : "scale(1)",
                          }}
                        >
                          <Icon icon="mdi:plus" width={13} color="#fff" />
                        </Box>
                        <input
                          type="file"
                          accept="image/*"
                          style={{
                            display: "none",
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
                        disabled={!isDirty}
                        onClick={handleSaveProfile}
                        sx={{
                          textTransform: "none",
                          borderRadius: "10px",
                          px: 2.2,
                        }}
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
                    </Box>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
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

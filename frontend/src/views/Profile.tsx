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
import InputBasico from "@/components/InputBasico";
import CardSeguranca from "@/components/users/CardSeguranca";
import CardPersonalizacao from "@/components/users/CardPersonalizacao";
import { clearNumber, formatCpf, formatTelefone } from "@/@core/format";
import { useThemeMode } from "@/theme/ThemeRegistry";
import { useLanguage } from "@/context/LanguageContext";
import { ChangePasswordModal } from "@/components/modals/ChangePasswordModal";
const practiceAreasOptions = [
  "Direito Civil",
  "Direito Trabalhista",
  "Direito Tributário",
  "Direito Penal",
  "Direito Empresarial",
  "Direito Administrativo",
  "Direito Previdenciário",
  "Direito de Família",
  "Propriedade Intelectual",
  "Contratos",
];

export default function ProfileView() {
  const { themeMode, setThemeMode } = useThemeMode();
  const { language, setLanguage } = useLanguage();
  const { hasRole } = useAuth();
  const [avatar, setAvatar] = useState<string | null>(null);

  const roleNormalizedFromAuth = hasRole("advogado")
    ? "advogado"
    : hasRole("funcionario")
      ? "funcionario"
      : hasRole("admin")
        ? "admin"
        : "";
  const roleNormalized = (roleNormalizedFromAuth || "").toLowerCase();
  const isAdvogadoRole = roleNormalized === "advogado";
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const handleOpenPrivacy = () => setPrivacyOpen(true);
  const handleClosePrivacy = () => setPrivacyOpen(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const handleChangePassword = () => setChangePasswordOpen(true);
  const handleCloseChangePassword = () => setChangePasswordOpen(false);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setAvatar(imageUrl);
    }
  };

  const form = useForm<ProfileFormSchemaType>({
    defaultValues: {
      nome: "",
      email: "",
      phone: "",
      cpf: "",
      oabNumber: "",
      position: "",
      categoria_ids: [],
      tema: themeMode,
      idioma: language,
    },
    resolver: zodResolver(profileFormSchema),
  });
  useEffect(() => {
    form.reset((currentValues) => ({
      ...currentValues,
      tema: themeMode,
      idioma: language,
    }));
  }, [themeMode, language, form]);
  const { isDirty } = form.formState;

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
                Meu Perfil
              </Typography>
            </Box>
          </Grid>

          <FormProvider {...form}>
            <form
              onSubmit={form.handleSubmit(async (data) => {
                await setLanguage(data.idioma);
                setThemeMode(data.tema);
                console.log("Dados do form:", data);
              })}
            >
              <Card
                sx={{
                  borderRadius: "16px",
                  overflow: "hidden",
                  p: 0,
                }}
              >
                <Box
                  sx={{
                    width: {
                      xs: "calc(100% + 32px)",
                      md: "calc(100% + 64px)",
                    },
                    ml: {
                      xs: "-16px",
                      md: "-32px",
                    },
                    mr: {
                      xs: "-16px",
                      md: "-32px",
                    },
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
                      Admistrador
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
                          src={
                            avatar ||
                            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80"
                          }
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
                        <Typography fontWeight={600}>
                          {"Administrador"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {"Administrador"}
                        </Typography>
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
                        Salvar Alterações
                      </Button>
                    </Grid>
                  </Grid>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        lg: "1.8fr 0.85fr",
                      },
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography
                        fontWeight={700}
                        color="text.primary"
                        mb={1.2}
                      >
                        Informações Pessoais
                      </Typography>

                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: {
                            xs: "1fr",
                            md: "1fr 1fr",
                          },
                          gap: 1.4,
                          mb: 2.3,
                        }}
                      >
                        <Controller
                          name="nome"
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <TextField
                              {...field}
                              label="Nome Completo"
                              placeholder="Nome"
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
                              label="E-mail Profissional"
                              placeholder="E-mail"
                              error={!!fieldState.error}
                              helperText={fieldState.error?.message}
                              fullWidth
                              sx={{ mt: "1.5em" }}
                            />
                          )}
                        />
                        <Controller
                          name="phone"
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <TextField
                              label="Telefone"
                              placeholder="(00) 00000-0000"
                              value={formatTelefone(field.value || "")}
                              onChange={(e) => {
                                field.onChange(clearNumber(e.target.value));
                              }}
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
                              label="CPF"
                              placeholder="000.000.000-00"
                              value={formatCpf(field.value || "")}
                              onChange={(e) => {
                                field.onChange(clearNumber(e.target.value));
                              }}
                              fullWidth
                            />
                          )}
                        />
                      </Box>

                      {isAdvogadoRole && (
                        <Box
                          sx={{
                            display: "grid",
                            gap: 1.4,
                          }}
                        >
                          <Typography
                            fontWeight={700}
                            color="text.primary"
                            mb={1.2}
                          >
                            Dados Profissionais
                          </Typography>

                          <Box
                            sx={{
                              display: "grid",
                              gridTemplateColumns: {
                                xs: "1fr",
                                md: "1fr 1fr",
                              },
                              gap: 1.4,
                            }}
                          >
                            <InputBasico
                              label="oabNumber"
                              field="oabNumber"
                              placeholder="Número OAB"
                            />
                            <InputBasico
                              label="position"
                              field="position"
                              placeholder="Cargo/Função"
                            />
                          </Box>
                          <Box
                            sx={{
                              display: "grid",
                              gap: 1.4,
                            }}
                          >
                            <FormControl fullWidth>
                              <Controller
                                name="categoria_ids"
                                control={form.control}
                                render={({ field }) => (
                                  <Autocomplete
                                    multiple
                                    options={practiceAreasOptions.map(
                                      (label, index) => ({
                                        id: index + 1,
                                        label,
                                      }),
                                    )}
                                    value={field.value.map((id) => ({
                                      id,
                                      label: practiceAreasOptions[id - 1],
                                    }))}
                                    onChange={(_, value) =>
                                      field.onChange(
                                        value.map((item) => Number(item.id)),
                                      )
                                    }
                                    isOptionEqualToValue={(option, value) =>
                                      option.id === value.id
                                    }
                                    getOptionLabel={(option) => option.label}
                                    renderInput={(params) => (
                                      <TextField
                                        {...params}
                                        label="Especialidades"
                                        placeholder={
                                          field.value?.length
                                            ? ""
                                            : "Selecione as especialidades"
                                        }
                                      />
                                    )}
                                  />
                                )}
                              />
                            </FormControl>
                          </Box>
                        </Box>
                      )}
                    </Box>
                    <Box flexDirection="column">
                      <CardPersonalizacao form={form} />
                      <CardSeguranca
                        privacyOpen={privacyOpen}
                        onOpenPrivacy={handleOpenPrivacy}
                        onClosePrivacy={handleClosePrivacy}
                        onOpenChangePassword={handleChangePassword}
                      />
                      <ChangePasswordModal
                        open={changePasswordOpen}
                        onClose={handleCloseChangePassword}
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

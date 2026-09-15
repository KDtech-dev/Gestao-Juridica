"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createProfileFormSchema } from "@/schemas/ProfileSchema";
import {
  getOwnProfile,
  updateOwnProfile,
  uploadOwnProfilePhoto,
} from "@/api/ApiProfile";
import { HeaderDashboard } from "@/components/HeaderADM";
import { SidebarDashboard } from "@/components/Sidebar";
import { CardDadosProfissionais } from "@/components/CardDadosProfissionais";
import InputBasico from "@/components/InputBasico";
import type { UserType } from "@/@core/types";
import { advogadoHref, publicLawyerPhoto } from "@/utils/advogadoPublico";
import { toast, formatToastErrorMessage } from "@/utils/toast";
import { useAuth } from "@/hooks/useAuth";

export default function PublicProfileEditor() {
  const t = useTranslations("internal.profile");
  const validation = useTranslations("validation");
  const schema = createProfileFormSchema(validation).pick({
    name: true,
    advogado: true,
  });
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      advogado: {
        resumo_pessoal: "",
        oab_numero: "",
        oab_uf: "",
        categorias: [],
      },
    },
  });
  const [profile, setProfile] = useState<UserType | null>(null);
  const [failed, setFailed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { refreshUser } = useAuth();

  useEffect(() => {
    let active = true;
    getOwnProfile()
      .then((user) => {
        if (!active) return;
        if (!user.advogado) {
          router.replace("/profile");
          return;
        }
        setProfile(user);
        form.reset({
          name: user.name,
          advogado: {
            resumo_pessoal: user.advogado.resumo_pessoal ?? "",
            oab_numero: user.advogado.oab_numero,
            oab_uf: user.advogado.oab_uf,
            categorias:
              user.advogado.categorias?.map((category) => category.id) ?? [],
          },
        });
      })
      .catch((error) => {
        if (!active) return;
        setFailed(true);
        toast.error(
          formatToastErrorMessage(error, t("toast.loadProfileError")),
        );
      });
    return () => {
      active = false;
    };
  }, [form, router, t, attempt]);

  const save = form.handleSubmit(async (values) => {
    if (!profile) return;
    try {
      const user = await updateOwnProfile({
        name: values.name,
        advogado: {
          resumo_pessoal: values.advogado?.resumo_pessoal,
          oab_numero: values.advogado?.oab_numero,
          oab_uf: values.advogado?.oab_uf,
          categorias: values.advogado?.categorias,
        },
      });
      setProfile(user);
      refreshUser({ name: user.name });
      form.reset(values);
      toast.success(t("toast.saveSuccess"));
    } catch (error) {
      toast.error(formatToastErrorMessage(error, t("toast.saveError")));
    }
  });

  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const user = await uploadOwnProfilePhoto(file);
      setProfile(user);
      refreshUser({ foto_perfil_url: user.foto_perfil_url });
      toast.success(t("toast.avatarUploadSuccess"));
    } catch (error) {
      toast.error(formatToastErrorMessage(error, t("toast.avatarUploadError")));
    } finally {
      setUploading(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <SidebarDashboard activeKey="perfil" />
      <Box sx={{ ml: { xs: 0, md: "280px" }, minWidth: 0 }}>
        <HeaderDashboard showSearch={false} />
        <Container maxWidth="md" sx={{ py: 3 }}>
          <Button component={Link} href="/profile" sx={{ mb: 2 }}>
            {t("publicPage.back")}
          </Button>
          <Typography component="h1" variant="h4" fontWeight={700}>
            {t("publicPage.edit")}
          </Typography>
          <Typography color="text.secondary" sx={{ my: 2 }}>
            {t("publicPage.description")}
          </Typography>
          {!profile ? (
            failed ? (
              <Button
                onClick={() => {
                  setFailed(false);
                  setAttempt((value) => value + 1);
                }}
              >
                {t("publicPage.retry")}
              </Button>
            ) : (
              <CircularProgress aria-label={t("publicPage.loading")} />
            )
          ) : (
            <Paper
              variant="outlined"
              sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}
            >
              <FormProvider {...form}>
                <form onSubmit={save}>
                  <Stack spacing={3}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar
                        src={
                          publicLawyerPhoto(profile.foto_perfil_url) ??
                          undefined
                        }
                        alt={profile.name}
                        sx={{ width: 80, height: 80 }}
                      />
                      <Button
                        type="button"
                        onClick={() => input.current?.click()}
                        disabled={uploading || form.formState.isSubmitting}
                      >
                        {t("publicPage.changePhoto")}
                      </Button>
                      <input
                        ref={input}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        hidden
                        onChange={upload}
                      />
                    </Stack>
                    <InputBasico field="name" label={t("fields.fullName")} />
                    <CardDadosProfissionais
                      isAdvogado
                      profileUser={profile}
                      showPublicSummary
                    />
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={
                          !form.formState.isDirty ||
                          form.formState.isSubmitting ||
                          uploading
                        }
                      >
                        {t("actions.saveChanges")}
                      </Button>
                      <Button
                        component="a"
                        href={advogadoHref({
                          uuid: String(profile.id),
                          name: profile.name,
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t("publicPage.view")}
                      </Button>
                    </Stack>
                  </Stack>
                </form>
              </FormProvider>
            </Paper>
          )}
        </Container>
      </Box>
    </Box>
  );
}

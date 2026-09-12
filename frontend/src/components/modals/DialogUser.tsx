"use client";

import { useEffect, useRef } from "react";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  alpha,
  Autocomplete,
  CircularProgress,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { BaseModal } from "@/components/modals/BaseModal";
import {
  createUserSchema,
  UF_SIGLAS,
  updateUserSchema,
} from "@/schemas/UserSchema";
import type {
  CreateUserPayload,
  UpdateUserPayload,
} from "@/schemas/UserSchema";
import { Avatar, Box } from "@mui/material";
import { Icon } from "@/components/AppIcon";
import { postFotoPerfil } from "@/api/ApiUsers";
import InputBasico from "@/components/InputBasico";
import type { UserType, RoleType, CategoriaType } from "@/@core/types";
import { getCategorias } from "@/api/ApiCategorias";
import { useState } from "react";
import { useTranslations } from "next-intl";
import PasswordVisibilityAdornment from "@/components/PasswordVisibilityAdornment";
import { Controller } from "react-hook-form";
import { formatCpf, formatTelefone } from "@/@core/format";
import { categoriaNomeParaChave } from "@/constants/categorias";
import { formatToastErrorMessage, toast } from "@/utils/toast";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserPayload | UpdateUserPayload) => Promise<UserType | void>;
  submitting: boolean;
  mode: "create" | "edit" | "view";
  user?: UserType | null;
};

export default function DialogUser({
  open,
  onClose,
  onSubmit,
  submitting,
  mode,
  user,
}: Props) {
  const t = useTranslations("internal.users.dialog");
  const theme = useTheme();
  const tValidation = useTranslations("validation");
  const tPracticeAreas = useTranslations("internal.profile.practiceAreas");
  const isEdit = mode === "edit";
  const isView = mode === "view";
  const isReadOnly = isView;
  const [avatar, setAvatar] = useState<string | null>(user?.foto_perfil_url ?? null);
  const [avatarHovered, setAvatarHovered] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [categorias, setCategorias] = useState<CategoriaType[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [visiblePasswords, setVisiblePasswords] = useState({
    password: false,
    confirmation: false,
  });
  const methods = useForm<CreateUserPayload | UpdateUserPayload>({
    resolver: zodResolver(
      isEdit ? updateUserSchema(tValidation) : createUserSchema(tValidation),
    ),
    defaultValues: buildDefaultValues(user, isEdit),
    mode: "onChange",
    reValidateMode: "onChange",
  });
  const { handleSubmit, reset, setValue } = methods;

  const role = useWatch({ control: methods.control, name: "role" }) as
    | RoleType
    | undefined;

  useEffect(() => {
    const loadCategorias = async () => {
      try {
        const response = await getCategorias();
        setCategorias(response.data);
      } catch (err) {

        toast.error(
          formatToastErrorMessage(
            err,
            t("toast.loadCategoriesError"),
          ),
        );
      } finally {
        setLoadingCategorias(false);
      }
    };

    loadCategorias();
  }, [t]);

  useEffect(() => {
    if (open) {
      reset(buildDefaultValues(user, isEdit));
      setAvatar(user?.foto_perfil_url ?? null);
      setPendingAvatarFile(null);
    }
  }, [open, user, isEdit, reset]);

  const togglePasswordVisibility = (field: keyof typeof visiblePasswords) => {
    setVisiblePasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    const avatarAnterior = avatar;
    setAvatar(previewUrl);

    if (isEdit && user?.id) {
      setAvatarUploading(true);
      try {
        const { data: usuarioAtualizado } = await postFotoPerfil(
          String(user.id),
          file,
        );
        setAvatar(usuarioAtualizado.foto_perfil_url ?? null);
      } catch (err) {
        setAvatar(avatarAnterior);
        toast.error(formatToastErrorMessage(err, t("toast.avatarUploadError")));
      } finally {
        setAvatarUploading(false);
        URL.revokeObjectURL(previewUrl);
      }
    } else {
      setPendingAvatarFile(file);
    }

    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  const handleFormSubmit = handleSubmit(async (data) => {
    const result = await onSubmit(data);

    if (!isEdit && pendingAvatarFile && result?.id) {
      try {
        await postFotoPerfil(String(result.id), pendingAvatarFile);
      } catch (err) {
        toast.error(formatToastErrorMessage(err, t("toast.avatarUploadError")));
      } finally {
        setPendingAvatarFile(null);
      }
    }

    onClose();
  });

  useEffect(() => {
    if (role !== "advogado") {
      setValue("advogado", {
        celular: "",
        data_nascimento: "",
        resumo_pessoal: "",
        oab_numero: "",
        oab_uf: "",
        categorias: [],
      });
    }

    if (role !== "funcionario") {
      setValue("funcionario", {
        celular: "",
        data_nascimento: "",
        resumo_pessoal: "",
      });
    }
  }, [role, setValue]);

  const title =
    mode === "create"
      ? t("title.create")
      : mode === "edit"
        ? t("title.edit")
        : t("title.view");

  const handleClose = () => {
    if (submitting) return;
    setVisiblePasswords({ password: false, confirmation: false });
    onClose();
  };
  return (
    <FormProvider {...methods}>
      <BaseModal
        open={open}
        onClose={handleClose}
        title={title}
        confirmText={
          submitting
            ? t("actions.saving")
            : isEdit
              ? t("actions.save")
              : t("actions.create")
        }
        cancelText={isView ? t("actions.close") : t("actions.cancel")}
        confirmDisabled={submitting}
        onSubmit={isView ? handleClose : handleFormSubmit}
        maxWidth="md"
      >
        <Stack spacing={2.5}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
              py: 3,
              mx: -3,
              mt: -3,
              mb: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box
              component={isReadOnly ? "div" : "label"}
              onMouseEnter={() => !isReadOnly && setAvatarHovered(true)}
              onMouseLeave={() => setAvatarHovered(false)}
              sx={{
                position: "relative",
                cursor: isReadOnly ? "default" : "pointer",
                display: "inline-block",
                borderRadius: "50%",
              }}
            >
              <Avatar
                src={avatar ?? undefined}
                sx={{
                  width: 96,
                  height: 96,
                  border: "3px solid",
                  borderColor: "background.paper",
                  boxShadow: theme.shadows[2],
                  filter: avatarHovered && !isReadOnly ? "brightness(0.75)" : "none",
                  transition: "filter 0.2s",
                }}
              />

              {avatarUploading && (
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "rgba(0,0,0,0.35)",
                  }}
                >
                  <CircularProgress size={28} sx={{ color: "#fff" }} />
                </Box>
              )}

              {!isReadOnly && !avatarUploading && (
                <>
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
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                      border: "2px solid",
                      borderColor: "background.paper",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: theme.shadows[1],
                      transition: "transform 0.2s",
                      transform: avatarHovered ? "scale(1.12)" : "scale(1)",
                    }}
                  >
                    <Icon icon="mdi:plus" width={15} color="#fff" />
                  </Box>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleAvatarChange}
                    disabled={avatarUploading || submitting}
                  />
                </>
              )}
            </Box>

            {!isReadOnly && (
              <Typography variant="caption" color="text.secondary">
                {avatarUploading
                  ? t("fields.photoUploading")
                  : t("fields.photoHelper")}
              </Typography>
            )}
          </Box>
          <FormControl fullWidth disabled={isReadOnly}>
            <InputLabel shrink>{t("fields.role")}</InputLabel>
            <Select
              label={t("fields.role")}
              value={role ?? ""}
              onChange={(e) => setValue("role", e.target.value as RoleType)}
            >
              <MenuItem value="admin">{t("roles.admin")}</MenuItem>
              <MenuItem value="advogado">{t("roles.advogado")}</MenuItem>
              <MenuItem value="funcionario">{t("roles.funcionario")}</MenuItem>
            </Select>
          </FormControl>

          <InputBasico
            field="name"
            label={t("fields.name")}
            placeholder={t("fields.namePlaceholder")}
            disabled={isReadOnly}
          />
          <InputBasico
            field="email"
            label={t("fields.email")}
            type="email"
            placeholder={t("fields.emailPlaceholder")}
            disabled={isReadOnly}
          />

          {!isEdit && !isView && (
            <Controller
              name="cpf"
              control={methods.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={t("fields.cpf")}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  inputProps={{ maxLength: 14 }}
                  InputLabelProps={{ shrink: true }}
                  onChange={(e) => field.onChange(formatCpf(e.target.value))}
                />
              )}
            />
          )}

          {role === "funcionario" && (
            <>
              <Controller
                name="funcionario.celular"
                control={methods.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t("fields.mobile")}
                    disabled={isReadOnly}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    inputProps={{ maxLength: 15 }}
                    onChange={(e) =>
                      field.onChange(formatTelefone(e.target.value))
                    }
                  />
                )}
              />
              <InputBasico
                field="funcionario.data_nascimento"
                label={t("fields.birthDate")}
                type="date"
                disabled={isReadOnly}
              />
              <InputBasico
                field="funcionario.resumo_pessoal"
                label={t("fields.personalSummary")}
                multiline
                rows={3}
                disabled={isReadOnly}
              />
            </>
          )}

          {role === "advogado" && (
            <>
              <Controller
                name="advogado.celular"
                control={methods.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ""}
                    fullWidth
                    label={t("fields.mobile")}
                    placeholder={t("fields.mobilePlaceholder")}
                    disabled={isReadOnly}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    inputProps={{ maxLength: 15 }}
                    onChange={(e) =>
                      field.onChange(formatTelefone(e.target.value))
                    }
                  />
                )}
              />
              <InputBasico
                field="advogado.data_nascimento"
                label={t("fields.birthDate")}
                placeholder={t("fields.birthDatePlaceholder")}
                type="date"
                disabled={isReadOnly}
              />
              <Stack
                direction="row"
                spacing={1.5}
                flexWrap="wrap"
                alignItems="stretch"
              >
                <Controller
                  name="advogado.oab_numero"
                  control={methods.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t("fields.oabNumber")}
                      placeholder={t("fields.oabNumberPlaceholder")}
                      disabled={isReadOnly}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      inputProps={{ maxLength: 20 }}
                      sx={{ flex: 1, minWidth: 150 }}
                    />
                  )}
                />

                <Controller
                  name="advogado.oab_uf"
                  control={methods.control}
                  render={({ field, fieldState }) => (
                    <FormControl
                      sx={{ minWidth: 120, flexShrink: 0 }}
                      error={!!fieldState.error}
                      disabled={isReadOnly}
                    >
                      <InputLabel id="oab-uf-label">
                        {t("fields.oabUf")}
                      </InputLabel>
                      <Select
                        {...field}
                        labelId="oab-uf-label"
                        label={t("fields.oabUf")}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      >
                        <MenuItem value="">
                          <em>{t("fields.oabUfPlaceholder")}</em>
                        </MenuItem>
                        {UF_SIGLAS.map((uf) => (
                          <MenuItem key={uf} value={uf}>
                            {uf}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText sx={{ minHeight: "1.5rem" }}>
                        {fieldState.error?.message || "\u00A0"}
                      </FormHelperText>
                    </FormControl>
                  )}
                />
              </Stack>
              <FormControl fullWidth>
                <Controller
                  name="advogado.categorias"
                  control={methods.control}
                  render={({ field }) => {
                    const selectedIds: (string | number)[] = Array.isArray(
                      field.value,
                    )
                      ? field.value
                      : [];
                    const selectedCategorias = categorias.filter((c) =>
                      selectedIds.includes(c.id),
                    );

                    return (
                      <Autocomplete
                        multiple
                        options={categorias}
                        getOptionLabel={(option) => {
                          if (typeof option === "string") return option;
                          const chave = categoriaNomeParaChave[option.nome];
                          return chave ? tPracticeAreas(chave) : option.nome;
                        }}
                        isOptionEqualToValue={(option, value) =>
                          option.id ===
                          (typeof value === "string" ? value : value.id)
                        }
                        value={selectedCategorias}
                        onChange={(_, value) => {
                          const ids = value.map((c) =>
                            typeof c === "string" ? c : c.id,
                          );
                          field.onChange(ids);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={t("fields.specialties")}
                            placeholder={
                              selectedCategorias.length
                                ? ""
                                : t("fields.specialtiesPlaceholder")
                            }
                            error={false}
                            helperText={undefined}
                            InputLabelProps={{ shrink: true }}
                            InputProps={{
                              ...params.InputProps,
                            }}
                          />
                        )}
                      />
                    );
                  }}
                />
              </FormControl>
              <InputBasico
                field="advogado.resumo_pessoal"
                label={t("fields.personalSummary")}
                placeholder={t("fields.personalSummaryPlaceholder")}
                multiline
                rows={3}
                disabled={isReadOnly}
              />
            </>
          )}

          {!isEdit && !isView && (
            <>
              <InputBasico
                field="password"
                label={t("fields.password")}
                type={visiblePasswords.password ? "text" : "password"}
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <PasswordVisibilityAdornment
                      visible={visiblePasswords.password}
                      onToggle={() => togglePasswordVisibility("password")}
                      disabled={submitting}
                    />
                  ),
                }}
              />
              <InputBasico
                field="password_confirmation"
                label={t("fields.confirmPassword")}
                type={visiblePasswords.confirmation ? "text" : "password"}
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <PasswordVisibilityAdornment
                      visible={visiblePasswords.confirmation}
                      onToggle={() => togglePasswordVisibility("confirmation")}
                      disabled={submitting}
                    />
                  ),
                }}
              />
            </>
          )}
        </Stack>
      </BaseModal>
    </FormProvider>
  );
}

function buildDefaultValues(
  user: UserType | null | undefined,
  isEdit: boolean,
): Partial<CreateUserPayload | UpdateUserPayload> {
  const role = (user?.roles?.[0] ?? "admin") as RoleType;

  return {
    role,
    name: user?.name ?? "",
    email: user?.email ?? "",
    cpf: user?.cpf ?? "",
    ...(isEdit ? {} : { password: "", password_confirmation: "" }),

    funcionario:
      role === "funcionario"
        ? {
          celular: user?.funcionario?.celular ?? "",
          data_nascimento: user?.funcionario?.data_nascimento ?? "",
          resumo_pessoal: user?.funcionario?.resumo_pessoal ?? "",
        }
        : undefined,

    advogado:
      role === "advogado"
        ? {
          celular: user?.advogado?.celular ?? "",
          oab_numero: user?.advogado?.oab_numero ?? "",
          oab_uf: user?.advogado?.oab_uf ?? "",
          categorias: Array.isArray(user?.advogado?.categorias)
            ? user.advogado.categorias.map((c) =>
              typeof c === "object" ? c.id : c,
            )
            : [],
          resumo_pessoal: user?.advogado?.resumo_pessoal ?? "",
        }
        : undefined,
  };
}

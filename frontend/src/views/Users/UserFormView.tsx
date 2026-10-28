"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Resolver } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/AppIcon";
import { HeaderDashboard } from "@/components/HeaderADM";
import { SidebarDashboard } from "@/components/Sidebar";
import InputBasico from "@/components/InputBasico";
import LocalizedDatePicker from "@/components/LocalizedDatePicker";
import PasswordVisibilityAdornment from "@/components/PasswordVisibilityAdornment";
import PickColor from "@/components/PickColor";
import ExtraPermissionsModal from "@/components/modals/ExtraPermissionsModal";
import { getPermissionCatalog, getUserById, postFotoPerfil, postUser, syncUserPermissions, updateUser } from "@/api/ApiUsers";
import { getCategorias } from "@/api/ApiCategorias";
import type { CategoriaType, RoleType, UserType } from "@/@core/types";
import type { PermissionCatalogEntry } from "@/api/ApiUsers";
import { formatCpf, formatTelefone } from "@/@core/format";
import { categoriaNomeParaChave } from "@/constants/categorias";
import { useApiErrorTranslator } from "@/utils/translateApiErrors";
import { toast } from "@/utils/toast";
import { CreateUserPayload, UpdateUserPayload, createUserSchema, UF_SIGLAS, updateUserSchema } from "@/schemas/UserSchema";
import { profileColorName, profileColorTextColor } from "@/constants/profileColors";
import usePermission from "@/@core/hooks/custom/usePermission";

type Mode = "create" | "edit" | "view";
type Props = { mode: Mode; userId?: string };

export default function UserFormView({ mode, userId }: Props) {
  const t = useTranslations("internal.users");
  const locale = useLocale() as "pt" | "en" | "es";
  const tf = useTranslations("internal.users.form");
  const td = useTranslations("internal.users.dialog");
  const tv = useTranslations("validation");
  const tp = useTranslations("internal.profile.practiceAreas");
  const router = useRouter();
  const theme = useTheme();
  const translateError = useApiErrorTranslator();
  const { hasPermission } = usePermission();
  const canManagePermissions = hasPermission("permissoes.gerenciar");
  const canEditUser = hasPermission("usuarios.editar");
  const canCreateUser = hasPermission("usuarios.criar");
  const isCreate = mode === "create";
  const isView = mode === "view";
  const [loading, setLoading] = useState(!isCreate);
  const [saving, setSaving] = useState(false);
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [permissionCatalog, setPermissionCatalog] = useState<PermissionCatalogEntry[]>([]);
  const [categorias, setCategorias] = useState<CategoriaType[]>([]);
  const [user, setUser] = useState<UserType | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarHovered, setAvatarHovered] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordConfirmationVisible, setPasswordConfirmationVisible] = useState(false);

  const schema = useMemo(
    () => (isCreate ? createUserSchema(tv) : updateUserSchema(tv)),
    [isCreate, tv],
  );
  const methods = useForm<CreateUserPayload | UpdateUserPayload>({
    resolver: zodResolver(schema) as Resolver<CreateUserPayload | UpdateUserPayload>,
    defaultValues: defaults(null),
    mode: "onChange",
  });
  const { reset } = methods;
  const role = useWatch({ control: methods.control, name: "role" }) as RoleType | undefined;
  const permissions = methods.watch("permissions") ?? [];

  useEffect(() => {
    if (canManagePermissions) {
      getPermissionCatalog().then(setPermissionCatalog).catch((error) => {
        toast.error(translateError(error) || tf("errors.permissions"));
      });
    }
    getCategorias().then((response) => setCategorias(response.data)).catch(() => setCategorias([]));
  }, [canManagePermissions, translateError]);

  useEffect(() => {
    if (isCreate || !userId) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    getUserById(userId)
      .then((response) => {
        if (!active) return;
        setUser(response.data);
        reset(defaults(response.data));
        setAvatarPreview(response.data.foto_perfil_url ?? null);
      })
      .catch((error) => toast.error(translateError(error) || tf("errors.load")))
      .finally(() => active && setLoading(false));

    return () => { active = false; };
  }, [isCreate, userId, reset, translateError]);

  const handleAvatarSelect = (file?: File) => {
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const onSubmit = methods.handleSubmit(async (values) => {
    if (isCreate ? !canCreateUser : !canEditUser) return;
    setSaving(true);
    try {
      const payload = {
        ...values,
        advogado: values.role === "advogado" ? values.advogado : undefined,
        funcionario: values.role === "funcionario" ? values.funcionario : undefined,
      };
      let saved: UserType;

      if (isCreate) {
        const response = await postUser(payload as CreateUserPayload);
        saved = response.data;
      } else {
        const response = await updateUser(userId!, payload as UpdateUserPayload);
        saved = response.data;
      }

      const selectedPermissions = values.role === "advogado" || values.role === "funcionario"
        ? values.permissions ?? []
        : [];
      if (canManagePermissions) {
        saved.permissions_extras = await syncUserPermissions(String(saved.id), selectedPermissions);
      }

      if (avatarFile) await postFotoPerfil(String(saved.id), avatarFile);

      toast.success(isCreate ? t("toast.created") : t("toast.updated"));
      router.push("/users");
    } catch (error) {
      toast.error(translateError(error) || tf("errors.save"));
    } finally {
      setSaving(false);
    }
  });

  const pageTitle = mode === "create" ? tf("title.create") : mode === "edit" ? tf("title.edit") : tf("title.view");
  const roleFieldsEnabled = role === "advogado" || role === "funcionario";
  const corPerfil = methods.watch("cor_perfil");
  const corPerfilText = profileColorTextColor(corPerfil);
  const bannerBackground = corPerfil
    ? `linear-gradient(90deg, ${corPerfil} 0%, ${corPerfil}99 100%)`
    : "linear-gradient(90deg, #2563eb 0%, #60a5fa 100%)";

  if (loading) {
    return <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <SidebarDashboard activeKey="users" />
      <Box sx={{ ml: { xs: 0, md: "280px" }, minWidth: 0 }}>
        <HeaderDashboard showSearch={false} />
        <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 }, py: 3.2 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={3.5}>
            <IconButton onClick={() => router.push("/users")}><Icon icon="mdi:arrow-left" width={22} /></IconButton>
            <Box>
              <Typography variant="h4" fontWeight={800} color="text.primary">{pageTitle}</Typography>
              {user && <Typography color="text.secondary">{user.name}</Typography>}
            </Box>
          </Stack>

          <FormProvider {...methods}>
            <Box component="form" onSubmit={onSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Paper elevation={0} sx={{ borderRadius: "20px", border: `1px solid ${theme.palette.divider}`, overflow: "hidden", p: 0 }}>
                <Box sx={{ minHeight: 112, background: bannerBackground, borderBottom: corPerfil?.toLowerCase() === "#ffffff" ? "1px solid rgba(0,0,0,0.12)" : "none", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, px: { xs: 2, md: 3 } }}>
                  <Typography fontWeight={700} fontSize="1.35rem" sx={{ color: corPerfilText }}>{tf("sections.account")}</Typography>
                  {!isView ? <PickColor name="cor_perfil" scope="users" excludeUserId={isCreate ? undefined : userId} defaultColor={user?.cor_perfil ?? "#2563eb"} textColor={corPerfilText} /> : (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: corPerfil ?? "#2563eb", border: "2px solid", borderColor: corPerfil?.toLowerCase() === "#ffffff" ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.8)" }} />
                      <Typography variant="caption" sx={{ color: corPerfilText }}>{profileColorName(corPerfil, locale)}</Typography>
                    </Stack>
                  )}
                </Box>
                <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "230px minmax(0, 1fr)" }, gap: { xs: 3, md: 4 }, alignItems: "stretch" }}>
                  <Stack alignItems="center" spacing={1.5}>
                    <Box
                      component={isView ? "div" : "label"}
                      onMouseEnter={() => !isView && setAvatarHovered(true)}
                      onMouseLeave={() => setAvatarHovered(false)}
                      sx={{ position: "relative", display: "inline-flex", borderRadius: "50%", cursor: isView ? "default" : "pointer" }}
                    >
                      <Avatar
                        src={avatarPreview ?? undefined}
                        sx={{ width: 180, height: 180, border: "4px solid", borderColor: "background.paper", boxShadow: theme.shadows[2], fontSize: "3rem", transition: "filter 0.2s", filter: avatarHovered ? "brightness(0.75)" : "none" }}
                      >{user?.name?.[0]?.toUpperCase()}</Avatar>
                      {!isView && <>
                        <Box sx={{ position: "absolute", inset: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", opacity: avatarHovered ? 1 : 0, transition: "opacity 0.2s", pointerEvents: "none" }}>
                          <Icon icon="mdi:camera" width={30} color="#fff" />
                        </Box>
                        <Box sx={{ position: "absolute", bottom: 6, right: 6, width: 30, height: 30, borderRadius: "50%", bgcolor: "primary.main", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: 1 }}>
                          <Icon icon="mdi:plus" width={16} color="#fff" />
                        </Box>
                        <input hidden type="file" accept="image/*" aria-label={td("fields.changePhoto")} onChange={(event) => {
                          handleAvatarSelect(event.target.files?.[0]);
                          event.currentTarget.value = "";
                        }} />
                      </>}
                    </Box>
                    <Typography fontWeight={700} textAlign="center">{td("fields.photoLabel")}</Typography>
                    <Typography variant="body2" color="text.secondary" textAlign="center">{td("fields.photoHelper")}</Typography>
                  </Stack>
                  <Box sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: isCreate ? "repeat(2, 1fr)" : "1fr" },
                    alignContent: "center",
                    alignItems: "stretch",
                    height: { sm: "100%" },
                    columnGap: 2,
                    rowGap: { sm: isCreate ? 2 : 1 },
                  }}>
                  <InputBasico field="name" label={td("fields.name")} placeholder={td("fields.namePlaceholder")} required={!isView} disabled={isView} />
                  <Controller name="role" control={methods.control} render={({ field, fieldState }) => (
                    <FormControl fullWidth disabled={isView} error={!!fieldState.error} required={!isView}>
                    <InputLabel>{td("fields.role")}</InputLabel>
                    <Select {...field} label={td("fields.role")} value={field.value ?? "funcionario"}>
                      <MenuItem value="admin">{td("roles.admin")}</MenuItem>
                      <MenuItem value="advogado">{td("roles.advogado")}</MenuItem>
                      <MenuItem value="funcionario">{td("roles.funcionario")}</MenuItem>
                    </Select>
                    {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                    </FormControl>
                  )} />
                  <InputBasico field="email" label={td("fields.email")} placeholder={td("fields.emailPlaceholder")} type="email" required={!isView} disabled={isView} />
                  {isCreate && <Controller name="cpf" control={methods.control} render={({ field, fieldState }) => (
                    <TextField {...field} fullWidth label={td("fields.cpf")} placeholder={td("fields.cpfPlaceholder")} required error={!!fieldState.error} helperText={fieldState.error?.message} inputProps={{ maxLength: 14 }} onChange={(event) => field.onChange(formatCpf(event.target.value))} />
                  )} />}
                  {!isCreate && <TextField fullWidth label={td("fields.cpf")} value={formatCpf(user?.cpf ?? "")} disabled />}
                  {isCreate && <InputBasico
                    field="password"
                    label={td("fields.password")}
                    placeholder={td("fields.passwordPlaceholder")}
                    required
                    type={passwordVisible ? "text" : "password"}
                    autoComplete="new-password"
                    InputProps={{
                      endAdornment: <PasswordVisibilityAdornment
                        visible={passwordVisible}
                        onToggle={() => setPasswordVisible((visible) => !visible)}
                        showLabel={td("fields.showPassword")}
                        hideLabel={td("fields.hidePassword")}
                      />,
                    }}
                  />}
                  {isCreate && <InputBasico
                    field="password_confirmation"
                    label={td("fields.confirmPassword")}
                    placeholder={td("fields.confirmPasswordPlaceholder")}
                    required
                    type={passwordConfirmationVisible ? "text" : "password"}
                    autoComplete="new-password"
                    InputProps={{
                      endAdornment: <PasswordVisibilityAdornment
                        visible={passwordConfirmationVisible}
                        onToggle={() => setPasswordConfirmationVisible((visible) => !visible)}
                        showLabel={td("fields.showPassword")}
                        hideLabel={td("fields.hidePassword")}
                      />,
                    }}
                  />}
                  </Box>
                </Box>
                </Box>
              </Paper>

              {(role === "advogado" || role === "funcionario") && (
                <Paper elevation={0} sx={{ borderRadius: "20px", border: `1px solid ${theme.palette.divider}`, p: { xs: 2, md: 3 } }}>
                  <Typography fontWeight={700} mb={2}>{tf("sections.profile")}</Typography>
                  <Stack spacing={2}>
                    {role === "funcionario" && <>
                      <Controller name="funcionario.celular" control={methods.control} render={({ field, fieldState }) => <TextField {...field} value={formatTelefone(field.value ?? "")} label={td("fields.mobile")} placeholder={td("fields.mobilePlaceholder")} disabled={isView} error={!!fieldState.error} helperText={fieldState.error?.message} onChange={(event) => field.onChange(formatTelefone(event.target.value))} />} />
                      <Controller name="funcionario.data_nascimento" control={methods.control} render={({ field, fieldState }) => <LocalizedDatePicker value={field.value} onChange={field.onChange} onBlur={field.onBlur} label={td("fields.birthDate")} disabled={isView} error={!!fieldState.error} helperText={fieldState.error?.message} />} />
                      <InputBasico field="funcionario.resumo_pessoal" label={td("fields.personalSummary")} placeholder={td("fields.personalSummaryPlaceholder")} multiline rows={3} disabled={isView} />
                    </>}
                    {role === "advogado" && <>
                      <Controller name="advogado.celular" control={methods.control} render={({ field, fieldState }) => <TextField {...field} value={formatTelefone(field.value ?? "")} label={td("fields.mobile")} placeholder={td("fields.mobilePlaceholder")} disabled={isView} error={!!fieldState.error} helperText={fieldState.error?.message} onChange={(event) => field.onChange(formatTelefone(event.target.value))} />} />
                      <Controller name="advogado.data_nascimento" control={methods.control} render={({ field, fieldState }) => <LocalizedDatePicker value={field.value} onChange={field.onChange} onBlur={field.onBlur} label={td("fields.birthDate")} disabled={isView} error={!!fieldState.error} helperText={fieldState.error?.message} />} />
                      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "2fr 1fr" }, gap: 2 }}>
                        <InputBasico field="advogado.oab_numero" label={td("fields.oabNumber")} placeholder={td("fields.oabNumberPlaceholder")} disabled={isView} />
                        <Controller name="advogado.oab_uf" control={methods.control} render={({ field, fieldState }) => <FormControl fullWidth disabled={isView} error={!!fieldState.error}>
                          <InputLabel>{td("fields.oabUf")}</InputLabel><Select {...field} value={field.value ?? ""} label={td("fields.oabUf")}>
                            <MenuItem value=""><em>{td("fields.oabUfPlaceholder")}</em></MenuItem>
                            {UF_SIGLAS.map((uf) => <MenuItem key={uf} value={uf}>{uf}</MenuItem>)}
                          </Select>
                        </FormControl>} />
                      </Box>
                      <Controller name="advogado.categorias" control={methods.control} render={({ field }) => {
                        const selectedIds = Array.isArray(field.value) ? field.value : [];
                        const selected = categorias.filter((category) => selectedIds.includes(category.id));
                        return <Autocomplete multiple options={categorias} value={selected} disabled={isView} getOptionLabel={(option) => {
                          const key = categoriaNomeParaChave[option.nome];
                          return key ? tp(key) : option.nome;
                        }} isOptionEqualToValue={(option, value) => option.id === value.id} onChange={(_, value) => field.onChange(value.map((category) => category.id))} renderInput={(params) => <TextField {...params} label={td("fields.specialties")} placeholder={td("fields.specialtiesPlaceholder")} />} />;
                      }} />
                      <InputBasico field="advogado.resumo_pessoal" label={td("fields.personalSummary")} placeholder={td("fields.personalSummaryPlaceholder")} multiline rows={3} disabled={isView} />
                    </>}
                  </Stack>
                </Paper>
              )}

              {roleFieldsEnabled && (
                <Paper elevation={0} sx={{ borderRadius: "20px", border: `1px solid ${theme.palette.divider}`, p: { xs: 2, md: 3 } }}>
                  <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between" gap={2}>
                    <Box>
                      <Typography fontWeight={700}>{tf("sections.access")}</Typography>
                      <Typography variant="body2" color="text.secondary">{tf("sections.accessDescription")}</Typography>
                      <Stack direction="row" flexWrap="wrap" gap={0.75} mt={1.5}>
                        {permissions.length ? permissions.map((permission) => <Chip key={permission} size="small" label={permissionLabel(permissionCatalog, permission)} />) : <Typography variant="body2" color="text.secondary">{tf("permissions.none")}</Typography>}
                      </Stack>
                    </Box>
                    {!isView && canManagePermissions && <Button variant="outlined" startIcon={<Icon icon="mdi:shield-key-outline" />} onClick={() => setPermissionModalOpen(true)}>{tf("permissions.open")}</Button>}
                  </Stack>
                </Paper>
              )}

              {!isView && <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
                <Button variant="outlined" onClick={() => router.push("/users")}>{tf("actions.cancel")}</Button>
                <Button type="submit" variant="contained" disabled={saving}>{saving ? tf("actions.saving") : tf("actions.save")}</Button>
              </Stack>}
              {isView && <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
                <Button variant="outlined" onClick={() => router.push("/users")}>{tf("actions.back")}</Button>
                {canEditUser && <Button variant="contained" onClick={() => router.push(`/users/${userId}/edit`)}>{tf("actions.edit")}</Button>}
              </Stack>}
            </Box>
          </FormProvider>
        </Container>
      </Box>

      {canManagePermissions && <ExtraPermissionsModal
        open={permissionModalOpen}
        catalog={permissionCatalog}
        selected={permissions}
        onClose={() => setPermissionModalOpen(false)}
        onSave={(selected) => {
          methods.setValue("permissions", selected, { shouldDirty: true });
          setPermissionModalOpen(false);
        }}
      />}
    </Box>
  );
}

function defaults(user: UserType | null): Partial<CreateUserPayload | UpdateUserPayload> {
  return {
    role: user?.roles?.[0] ?? "funcionario",
    name: user?.name ?? "",
    email: user?.email ?? "",
    cpf: user?.cpf ?? "",
    cor_perfil: user?.cor_perfil ?? "#2563eb",
    ...(user ? {} : { password: "", password_confirmation: "" }),
    permissions: user?.permissions_extras ?? [],
    funcionario: {
      celular: user?.funcionario?.celular ?? "",
      data_nascimento: user?.funcionario?.data_nascimento ?? "",
      resumo_pessoal: user?.funcionario?.resumo_pessoal ?? "",
    },
    advogado: {
      data_nascimento: user?.advogado?.data_nascimento ?? "",
      celular: user?.advogado?.celular ?? "",
      oab_numero: user?.advogado?.oab_numero ?? "",
      oab_uf: user?.advogado?.oab_uf ?? "",
      categorias: user?.advogado?.categorias?.map((category) => category.id) ?? [],
      resumo_pessoal: user?.advogado?.resumo_pessoal ?? "",
    },
  };
}

function permissionLabel(catalog: PermissionCatalogEntry[], name: string): string {
  const permission = catalog.find((entry) => entry.name === name);
  return permission ? `${permission.group_label} · ${permission.action_label}` : name;
}

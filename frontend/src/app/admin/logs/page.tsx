"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { HeaderDashboard } from "@/components/HeaderADM";
import { SidebarDashboard } from "@/components/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import api from "@/configs/axios";
import { formatToastErrorMessage, toast } from "@/utils/toast";

type AuditLog = {
  id: string;
  usuario_id: string | null;
  usuario_nome: string | null;
  perfis: string[];
  acao: string;
  modulo: string;
  metodo: string;
  rota: string;
  registros: Record<string, string>;
  status_http: number;
  ocorrido_em: string;
};
type Archive = {
  id: string;
  inicio_em: string;
  fim_em: string;
  quantidade: number;
  sha256: string;
  criado_em: string;
};
const actions: Record<string, string> = {
  consultar: "Consulta",
  criar: "Cadastro / envio",
  alterar: "Alteração",
  excluir: "Exclusão",
  restaurar: "Restauração",
  login: "Login",
  logout: "Logout",
  renovar_sessao: "Renovação de sessão",
  alterar_senha: "Alteração de senha",
  recuperar_senha: "Recuperação de senha",
  baixar_arquivo: "Download",
};
const modules: Record<string, string> = {
  clientes: "Clientes",
  casos: "Casos",
  publicacoes: "Publicações",
  posts: "Publicações públicas",
  compromissos: "Agenda",
  users: "Usuários",
  profile: "Perfil",
  notificacoes: "Notificações",
  anexos: "Anexos",
  lixeira: "Lixeira",
  auditoria: "Auditoria",
  auth: "Autenticação",
  categorias: "Categorias",
  advogados: "Equipe",
};
const emptyFilters = {
  usuario: "",
  acao: "",
  modulo: "",
  resultado: "",
  inicio: "",
  fim: "",
};
const date = (value: string) => new Date(value).toLocaleString("pt-BR");

export default function AuditPage() {
  const { loading: authLoading, hasRole } = useAuth();
  const admin = hasRole("admin");
  const [tab, setTab] = useState("logs");
  const [draft, setDraft] = useState(emptyFilters);
  const [filters, setFilters] = useState(emptyFilters);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [archives, setArchives] = useState<Archive[]>([]);
  const [nextArchive, setNextArchive] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    if (!admin) return;
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, string | number> = { page };
        for (const [key, value] of Object.entries(filters)) {
          if (!value) continue;
          if (key === "inicio" || key === "fim") {
            const boundary = new Date(`${value}T00:00:00`);
            if (key === "fim") boundary.setDate(boundary.getDate() + 1);
            params[key] = boundary.toISOString();
          } else params[key] = value;
        }
        const { data } = await api.get(
          tab === "logs" ? "/auditoria" : "/auditoria/arquivos",
          {
            params: tab === "logs" ? params : { page },
            signal: controller.signal,
          },
        );
        if (controller.signal.aborted) return;
        const result = tab === "logs" ? data : data.arquivos;
        setLastPage(result.last_page);
        setTotal(result.total);
        if (tab === "logs") setLogs(result.data);
        else {
          setArchives(result.data);
          setNextArchive(data.proximo_arquivamento);
        }
      } catch (err) {
        if (!controller.signal.aborted)
          setError(
            formatToastErrorMessage(
              err,
              "Não foi possível carregar a auditoria.",
            ),
          );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [admin, filters, page, tab, reload]);

  async function download(file: Archive) {
    setDownloading(file.id);
    try {
      const { data } = await api.get(
        `/auditoria/arquivos/${file.id}/download`,
        { responseType: "blob" },
      );
      const url = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `auditoria-${file.inicio_em.slice(0, 10)}-${file.fim_em.slice(0, 10)}.jsonl`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      toast.error(
        formatToastErrorMessage(err, "Não foi possível baixar o arquivo."),
      );
    } finally {
      setDownloading(null);
    }
  }

  if (authLoading) return <CircularProgress aria-label="Verificando acesso" />;
  if (!admin)
    return <Alert severity="error">Acesso restrito aos administradores.</Alert>;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <SidebarDashboard activeKey="auditoria" />
      <Box sx={{ ml: { md: "280px" } }}>
        <HeaderDashboard showSearch={false} />
        <Box
          component="main"
          sx={{ p: { xs: 2, md: 4 }, maxWidth: 1800, mx: "auto" }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            gap={2}
            mb={1}
          >
            <Typography variant="h4" component="h1">
              Logs de atividade
            </Typography>
            <Button
              variant="outlined"
              disabled={loading}
              onClick={() => setReload(reload + 1)}
            >
              Atualizar
            </Button>
          </Stack>
          <Typography color="text.secondary" mb={3}>
            Acompanhe as ações dos usuários, os registros envolvidos e o
            resultado de cada operação.
          </Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            Os logs são salvos continuamente. A cada 30 dias, uma cópia é
            arquivada em um arquivo privado no servidor. O histórico permanece
            nesta tela.
          </Alert>
          <Tabs
            value={tab}
            onChange={(_, value) => {
              setTab(value);
              setPage(1);
            }}
            sx={{ mb: 2 }}
          >
            <Tab value="logs" label="Histórico de atividades" />
            <Tab value="arquivos" label="Arquivos de 30 dias" />
          </Tabs>
          {tab === "logs" && (
            <Paper
              variant="outlined"
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                setPage(1);
                setFilters({ ...draft });
              }}
              sx={{ p: 2, mb: 3 }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    xl: "repeat(4, 1fr)",
                  },
                  gap: 2,
                }}
              >
                <TextField
                  size="small"
                  label="Nome do usuário"
                  value={draft.usuario}
                  onChange={(e) =>
                    setDraft({ ...draft, usuario: e.target.value })
                  }
                />
                <TextField
                  select
                  size="small"
                  label="Ação"
                  value={draft.acao}
                  onChange={(e) => setDraft({ ...draft, acao: e.target.value })}
                >
                  <MenuItem value="">Todas</MenuItem>
                  {Object.entries(actions).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  size="small"
                  label="Módulo"
                  value={draft.modulo}
                  onChange={(e) =>
                    setDraft({ ...draft, modulo: e.target.value })
                  }
                >
                  <MenuItem value="">Todos</MenuItem>
                  {Object.entries(modules).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  size="small"
                  label="Resultado"
                  value={draft.resultado}
                  onChange={(e) =>
                    setDraft({ ...draft, resultado: e.target.value })
                  }
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="sucesso">Concluído</MenuItem>
                  <MenuItem value="falha">Falhou / bloqueado</MenuItem>
                </TextField>
                <TextField
                  size="small"
                  type="date"
                  label="De"
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={draft.inicio}
                  onChange={(e) =>
                    setDraft({ ...draft, inicio: e.target.value })
                  }
                />
                <TextField
                  size="small"
                  type="date"
                  label="Até"
                  slotProps={{
                    inputLabel: { shrink: true },
                    htmlInput: { min: draft.inicio },
                  }}
                  value={draft.fim}
                  onChange={(e) => setDraft({ ...draft, fim: e.target.value })}
                />
                <Stack direction="row" spacing={1} alignItems="center">
                  <Button type="submit" variant="contained">
                    Filtrar
                  </Button>
                  <Button
                    onClick={() => {
                      setDraft(emptyFilters);
                      setFilters(emptyFilters);
                      setPage(1);
                    }}
                  >
                    Limpar filtros
                  </Button>
                </Stack>
              </Box>
            </Paper>
          )}
          {error ? (
            <Alert severity="error">{error}</Alert>
          ) : loading ? (
            <CircularProgress aria-label="Carregando logs" />
          ) : (
            <>
              {tab === "logs" ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table
                    size="small"
                    aria-label="Histórico de atividade dos usuários"
                    sx={{ minWidth: 950 }}
                  >
                    <TableHead>
                      <TableRow>
                        {[
                          "Data e hora",
                          "Usuário",
                          "Ação",
                          "Módulo / registro",
                          "Resultado",
                        ].map((label) => (
                          <TableCell key={label}>{label}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {!logs.length && (
                        <TableRow>
                          <TableCell colSpan={5}>
                            Nenhuma atividade encontrada para estes filtros.
                          </TableCell>
                        </TableRow>
                      )}
                      {logs.map((log) => (
                        <TableRow key={log.id} hover>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                            {date(log.ocorrido_em)}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {log.usuario_nome ?? "Não autenticado"}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {log.perfis.join(", ")}
                            </Typography>
                            <Typography
                              variant="caption"
                              display="block"
                              color="text.secondary"
                            >
                              {log.usuario_id}
                            </Typography>
                          </TableCell>
                          <TableCell>{actions[log.acao] ?? log.acao}</TableCell>
                          <TableCell
                            sx={{ maxWidth: 430, overflowWrap: "anywhere" }}
                          >
                            <Typography variant="body2">
                              {modules[log.modulo] ?? log.modulo}
                            </Typography>
                            {Object.entries(log.registros).map(
                              ([key, value]) => (
                                <Typography
                                  key={key}
                                  variant="caption"
                                  display="block"
                                >
                                  {key}: {value}
                                </Typography>
                              ),
                            )}
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {log.metodo} /{log.rota}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              color={
                                log.status_http < 400 ? "success" : "error"
                              }
                              variant="outlined"
                              label={`${log.status_http < 400 ? "Concluído" : "Falhou / bloqueado"} · ${log.status_http}`}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Stack spacing={2}>
                  {nextArchive && (
                    <Typography color="text.secondary">
                      Próximo fechamento de 30 dias: {date(nextArchive)}. O
                      arquivo será gerado na execução seguinte do agendamento do
                      servidor.
                    </Typography>
                  )}
                  {!archives.length && (
                    <Paper variant="outlined" sx={{ p: 3 }}>
                      Nenhum período de 30 dias foi arquivado ainda. As
                      atividades já estão disponíveis no histórico.
                    </Paper>
                  )}
                  {archives.map((file) => (
                    <Paper key={file.id} variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="h6">
                        {date(file.inicio_em)} — {date(file.fim_em)}
                      </Typography>
                      <Typography variant="body2">
                        {file.quantidade} atividades · Gerado em{" "}
                        {date(file.criado_em)}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ overflowWrap: "anywhere", display: "block" }}
                      >
                        SHA-256: {file.sha256}
                      </Typography>
                      <Button
                        sx={{ mt: 1 }}
                        variant="outlined"
                        disabled={downloading !== null}
                        onClick={() => void download(file)}
                      >
                        {downloading === file.id
                          ? "Baixando…"
                          : "Baixar log (.jsonl)"}
                      </Button>
                    </Paper>
                  ))}
                </Stack>
              )}
              <Stack direction="row" alignItems="center" spacing={2} mt={2}>
                <Button disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  Anterior
                </Button>
                <Typography variant="body2">
                  {total} registros · Página {page} de {lastPage}
                </Typography>
                <Button
                  disabled={page >= lastPage}
                  onClick={() => setPage(page + 1)}
                >
                  Próxima
                </Button>
              </Stack>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { SidebarDashboard } from "@/components/Sidebar";
import { HeaderDashboard } from "@/components/HeaderADM";
import { useAuth } from "@/hooks/useAuth";
import api from "@/configs/axios";
import { formatToastErrorMessage, toast } from "@/utils/toast";

type Item = {
  id: string;
  tipo: string;
  descricao: string;
  excluido_por: string | null;
  created_at: string;
  expira_em: string;
  restaurado_em: string | null;
  restaurado_por: string | null;
  eliminado_em: string | null;
};
const date = (value: string) => new Date(value).toLocaleString("pt-BR");
const types: Record<string, string> = {
  notificacao: "Notificação",
  vinculo_cliente: "Vínculo entre caso e cliente",
  cliente: "Cliente",
  caso: "Caso",
  publicacao: "Publicação",
  compromisso: "Compromisso",
  anexo: "Anexo",
  usuario: "Usuário",
  arquivo: "Arquivo removido ou substituído",
};

export default function LixeiraPage() {
  const { loading: authLoading, hasRole } = useAuth();
  const admin = hasRole("admin");
  const [items, setItems] = useState<Item[]>([]);
  const [status, setStatus] = useState("disponiveis");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (!admin) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/lixeira", { params: { status, page } });
      setItems(data.data);
      setLastPage(data.last_page);
    } catch (err) {
      setError(
        formatToastErrorMessage(err, "Não foi possível carregar a lixeira."),
      );
    } finally {
      setLoading(false);
    }
  }, [admin, status, page]);
  useEffect(() => {
    void load();
  }, [load]);

  async function recover(item: Item) {
    setBusy(item.id);
    try {
      if (item.tipo === "arquivo") {
        const { data } = await api.get(`/lixeira/${item.id}/arquivo`, {
          responseType: "blob",
        });
        const url = URL.createObjectURL(data);
        const link = document.createElement("a");
        link.href = url;
        link.download = item.descricao;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else {
        await api.post(`/lixeira/${item.id}/restaurar`);
        toast.success("Item restaurado com sucesso.");
        await load();
      }
    } catch (err) {
      toast.error(
        formatToastErrorMessage(err, "Não foi possível recuperar o item."),
      );
    } finally {
      setBusy(null);
    }
  }

  if (authLoading) return <CircularProgress aria-label="Verificando acesso" />;
  if (!admin)
    return <Alert severity="error">Acesso restrito aos administradores.</Alert>;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <SidebarDashboard activeKey="lixeira" />
      <Box sx={{ ml: { md: "280px" } }}>
        <HeaderDashboard showSearch={false} />
        <Box component="main" sx={{ p: { xs: 2, md: 4 } }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Lixeira e registro de exclusões
          </Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            Os itens podem ser recuperados por 30 dias após a exclusão. Após
            esse prazo, o conteúdo é eliminado pela limpeza automática e o
            registro da operação permanece. Versões anteriores de fotos e
            banners podem ser baixadas.
          </Alert>
          <Tabs
            value={status}
            onChange={(_, value) => {
              setStatus(value);
              setPage(1);
            }}
            sx={{ mb: 2 }}
          >
            <Tab value="disponiveis" label="Disponíveis para recuperar" />
            <Tab value="historico" label="Histórico" />
          </Tabs>
          {error ? (
            <Alert
              severity="error"
              action={
                <Button onClick={() => void load()}>Tentar novamente</Button>
              }
            >
              {error}
            </Alert>
          ) : loading ? (
            <CircularProgress aria-label="Carregando lixeira" />
          ) : (
            <Stack spacing={2}>
              {!items.length && (
                <Typography color="text.secondary">
                  Nenhum item nesta lista.
                </Typography>
              )}
              {items.map((item) => {
                const available =
                  !item.restaurado_em &&
                  !item.eliminado_em &&
                  new Date(item.expira_em).getTime() > Date.now();
                return (
                  <Paper
                    key={item.id}
                    variant="outlined"
                    sx={{ p: 2, overflowWrap: "anywhere" }}
                  >
                    <Typography variant="overline">
                      {types[item.tipo] ?? item.tipo}
                    </Typography>
                    <Typography variant="h6">{item.descricao}</Typography>
                    <Typography variant="body2">
                      Excluído em {date(item.created_at)} · Responsável (ID):{" "}
                      {item.excluido_por ?? "Sistema"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Prazo de recuperação: {date(item.expira_em)}
                    </Typography>
                    {item.restaurado_em && (
                      <Typography variant="body2">
                        Restaurado em {date(item.restaurado_em)} · Responsável
                        (ID): {item.restaurado_por ?? "Sistema"}
                      </Typography>
                    )}
                    {item.eliminado_em && (
                      <Typography variant="body2">
                        Conteúdo eliminado em {date(item.eliminado_em)}
                      </Typography>
                    )}
                    {!available &&
                      !item.restaurado_em &&
                      !item.eliminado_em && (
                        <Typography variant="body2">
                          Prazo encerrado. Aguardando limpeza.
                        </Typography>
                      )}
                    {available && (
                      <Button
                        sx={{ mt: 1 }}
                        variant="outlined"
                        disabled={busy !== null}
                        onClick={() => void recover(item)}
                      >
                        {busy === item.id
                          ? "Recuperando…"
                          : item.tipo === "arquivo"
                            ? "Baixar arquivo"
                            : "Restaurar"}
                      </Button>
                    )}
                  </Paper>
                );
              })}
              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  disabled={page === 1 || busy !== null}
                  onClick={() => setPage(page - 1)}
                >
                  Anterior
                </Button>
                <Typography>
                  Página {page} de {lastPage}
                </Typography>
                <Button
                  disabled={page >= lastPage || busy !== null}
                  onClick={() => setPage(page + 1)}
                >
                  Próxima
                </Button>
              </Stack>
            </Stack>
          )}
        </Box>
      </Box>
    </Box>
  );
}

"use client";

import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
  Switch,
} from "@mui/material";
import { Icon } from "@/components/AppIcon";
import { useMemo, useState } from "react";
import type { User } from "@/services/userService";

type Order = "asc" | "desc";
type SortKey = "name" | "email" | "phone" | "type" | "extra" | "active";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (first + second).toUpperCase();
}

function getUserTypeLabel(type: User["type"]): string {
  if (type === "admin") return "Administrador";
  if (type === "advogado") return "Advogado";
  return "Funcionário";
}

function compare(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === "string" || typeof b === "string") {
    return String(a).localeCompare(String(b), "pt-BR", { sensitivity: "base" });
  }
  if (typeof a === "boolean" || typeof b === "boolean")
    return Number(a) - Number(b);
  return a < b ? -1 : a > b ? 1 : 0;
}

function stableSort<T>(array: T[], comparator: (a: T, b: T) => number): T[] {
  return array
    .map((el, index) => [el, index] as const)
    .sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    })
    .map((el) => el[0]);
}

type Props = {
  users: User[];
  loading?: boolean;
  canManage?: boolean;
  busyIds?: Array<string | number>;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onToggleActive?: (user: User, nextActive: boolean) => void | Promise<void>;
};

export function UserTable({
  users,
  loading = false,
  canManage = false,
  busyIds = [],
  onEdit,
  onDelete,
  onToggleActive,
}: Props) {
  const busy = useMemo(() => new Set(busyIds.map(String)), [busyIds]);
  const [orderBy, setOrderBy] = useState<SortKey>("name");
  const [order, setOrder] = useState<Order>("asc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const sorted = useMemo(() => {
    const getValue = (u: User) => {
      switch (orderBy) {
        case "name":
          return u.name;
        case "email":
          return u.email;
        case "phone":
          return u.phone ?? "";
        case "type":
          return u.type;
        case "extra":
          return u.type === "advogado"
            ? (u.oabNumber ?? "")
            : (u.position ?? "");
        case "active":
          return u.active;
      }
    };
    const comp = (a: User, b: User) =>
      compare(getValue(a), getValue(b)) * (order === "asc" ? 1 : -1);
    return stableSort(users, comp);
  }, [users, order, orderBy]);

  const paged = useMemo(() => {
    const start = page * rowsPerPage;
    return sorted.slice(start, start + rowsPerPage);
  }, [page, rowsPerPage, sorted]);

  const headCellStyle = {
    fontSize: "0.75rem",
    fontWeight: 700,
    color: "text.secondary",
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    borderBottom: "1px solid",
    borderColor: "divider",
    py: 1.4,
    px: 2,
    bgcolor: "background.paper",
  };

  const bodyCellStyle = {
    py: 1.35,
    px: 2,
    borderBottom: "1px solid",
    borderColor: "divider",
    fontSize: "0.92rem",
  };

  const toggleSort = (key: SortKey) => {
    if (orderBy === key) {
      setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setOrderBy(key);
      setOrder("asc");
    }
  };

  const statusChip = (active: boolean) => (
    <Chip
      size="small"
      label={active ? "Ativo" : "Inativo"}
      sx={{
        height: 26,
        fontWeight: 700,
        borderRadius: "999px",
        bgcolor: active ? "#b8ead2" : "#e2e8f0",
        color: active ? "#047857" : "#334155",
      }}
    />
  );

  return (
    <Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={headCellStyle}>
              <TableSortLabel
                active={orderBy === "name"}
                direction={orderBy === "name" ? order : "asc"}
                onClick={() => toggleSort("name")}
              >
                NOME
              </TableSortLabel>
            </TableCell>
            <TableCell sx={headCellStyle}>
              <TableSortLabel
                active={orderBy === "email"}
                direction={orderBy === "email" ? order : "asc"}
                onClick={() => toggleSort("email")}
              >
                E-MAIL
              </TableSortLabel>
            </TableCell>
            <TableCell sx={headCellStyle}>
              <TableSortLabel
                active={orderBy === "phone"}
                direction={orderBy === "phone" ? order : "asc"}
                onClick={() => toggleSort("phone")}
              >
                TELEFONE
              </TableSortLabel>
            </TableCell>
            <TableCell sx={headCellStyle}>
              <TableSortLabel
                active={orderBy === "type"}
                direction={orderBy === "type" ? order : "asc"}
                onClick={() => toggleSort("type")}
              >
                TIPO
              </TableSortLabel>
            </TableCell>
            <TableCell sx={headCellStyle}>
              <TableSortLabel
                active={orderBy === "extra"}
                direction={orderBy === "extra" ? order : "asc"}
                onClick={() => toggleSort("extra")}
              >
                CARGO / OAB
              </TableSortLabel>
            </TableCell>
            <TableCell sx={headCellStyle}>
              <TableSortLabel
                active={orderBy === "active"}
                direction={orderBy === "active" ? order : "asc"}
                onClick={() => toggleSort("active")}
              >
                STATUS
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ ...headCellStyle, textAlign: "right" }}>
              AÇÕES
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {loading && users.length === 0 ? (
            <TableRow>
              <TableCell sx={bodyCellStyle} colSpan={7}>
                <Stack direction="row" alignItems="center" gap={1}>
                  <Icon icon="mdi:loading" width={18} />
                  <Typography color="text.secondary">
                    Carregando usuários...
                  </Typography>
                </Stack>
              </TableCell>
            </TableRow>
          ) : null}

          {!loading && users.length === 0 ? (
            <TableRow>
              <TableCell sx={bodyCellStyle} colSpan={7}>
                <Typography color="text.secondary">
                  Nenhum usuário encontrado.
                </Typography>
              </TableCell>
            </TableRow>
          ) : null}

          {paged.map((u) => {
            const isBusy = busy.has(String(u.id));
            return (
              <TableRow key={String(u.id)} hover>
                <TableCell sx={bodyCellStyle}>
                  <Stack direction="row" alignItems="center" gap={1.2}>
                    <Avatar
                      sx={{
                        width: 34,
                        height: 34,
                        fontWeight: 800,
                        bgcolor: "primary.main",
                      }}
                    >
                      {getInitials(u.name)}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography fontWeight={700} noWrap>
                        {u.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {getUserTypeLabel(u.type)}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell sx={bodyCellStyle}>
                  <Typography noWrap>{u.email}</Typography>
                </TableCell>
                <TableCell sx={bodyCellStyle}>
                  <Typography noWrap>{u.phone || "—"}</Typography>
                </TableCell>
                <TableCell sx={bodyCellStyle}>
                  <Typography sx={{ textTransform: "capitalize" }}>
                    {getUserTypeLabel(u.type)}
                  </Typography>
                </TableCell>
                <TableCell sx={bodyCellStyle}>
                  <Typography noWrap>
                    {u.type === "advogado"
                      ? u.oabNumber || "—"
                      : u.type === "funcionario"
                        ? u.position || "—"
                        : "—"}
                  </Typography>
                </TableCell>
                <TableCell sx={bodyCellStyle}>
                  <Stack direction="row" alignItems="center" gap={1}>
                    {statusChip(u.active)}
                    {canManage ? (
                      <Switch
                        size="small"
                        checked={u.active}
                        disabled={isBusy}
                        onChange={(e) => onToggleActive?.(u, e.target.checked)}
                        inputProps={{
                          "aria-label": "Ativar/Desativar",
                        }}
                      />
                    ) : null}
                  </Stack>
                </TableCell>
                <TableCell sx={{ ...bodyCellStyle, textAlign: "right" }}>
                  {canManage ? (
                    <Stack
                      direction="row"
                      justifyContent="flex-end"
                      spacing={0.5}
                    >
                      <Tooltip title="Editar">
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => onEdit?.(u)}
                            disabled={isBusy}
                          >
                            <Icon icon="mdi:pencil-outline" width={18} />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => onDelete?.(u)}
                            disabled={isBusy}
                          >
                            <Icon icon="mdi:trash-can-outline" width={18} />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>
                  ) : (
                    <Typography color="text.secondary">—</Typography>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <TablePagination
        component="div"
        count={sorted.length}
        page={page}
        onPageChange={(_, next) => setPage(next)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage="Linhas"
      />
    </Box>
  );
}

export default UserTable;

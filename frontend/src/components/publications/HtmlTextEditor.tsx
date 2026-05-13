"use client";

import { useRef } from "react";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { Icon } from "@iconify/react";

type HtmlTextEditorProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  minRows?: number;
  helperText?: string;
};

type HtmlAction = {
  label: string;
  icon: string;
  before: string;
  after: string;
  fallback: string;
};

const actions: HtmlAction[] = [
  {
    label: "Negrito",
    icon: "mdi:format-bold",
    before: "<strong>",
    after: "</strong>",
    fallback: "texto em destaque",
  },
  {
    label: "Itálico",
    icon: "mdi:format-italic",
    before: "<em>",
    after: "</em>",
    fallback: "texto enfatizado",
  },
  {
    label: "Parágrafo",
    icon: "mdi:format-paragraph",
    before: "<p>",
    after: "</p>",
    fallback: "Novo parágrafo",
  },
  {
    label: "Lista",
    icon: "mdi:format-list-bulleted",
    before: "<ul><li>",
    after: "</li></ul>",
    fallback: "Item da lista",
  },
];

export function HtmlTextEditor({
  label,
  value,
  onChange,
  error,
  minRows = 5,
  helperText,
}: HtmlTextEditorProps) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const insertTag = (action: HtmlAction) => {
    const input = inputRef.current;
    const start = input?.selectionStart ?? value.length;
    const end = input?.selectionEnd ?? value.length;
    const selected = value.slice(start, end) || action.fallback;
    const nextValue = `${value.slice(0, start)}${action.before}${selected}${action.after}${value.slice(end)}`;

    onChange(nextValue);

    window.requestAnimationFrame(() => {
      input?.focus();
      const cursor = start + action.before.length + selected.length;
      input?.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        gap={1}
        mb={0.8}
      >
        <Typography fontWeight={700} color="text.primary">
          {label}
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={0.6}>
          {actions.map((action) => (
            <Button
              key={action.label}
              type="button"
              size="small"
              variant="outlined"
              aria-label={action.label}
              title={action.label}
              onClick={() => insertTag(action)}
              sx={{
                minWidth: 34,
                width: 34,
                height: 30,
                p: 0,
                borderColor: "divider",
              }}
            >
              <Icon icon={action.icon} width={17} />
            </Button>
          ))}
        </Stack>
      </Stack>

      <TextField
        fullWidth
        multiline
        minRows={minRows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        error={Boolean(error)}
        helperText={error || helperText}
        inputRef={inputRef}
        placeholder="<p>Digite seu texto em HTML...</p>"
      />
    </Box>
  );
}

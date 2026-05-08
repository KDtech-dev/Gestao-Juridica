"use client";

import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import { ContentErrors, PublicacaoFormData } from "./types";

type Props = {
  isEn?: boolean;
  data: PublicacaoFormData;
  errors: ContentErrors;
  onChange: <K extends keyof PublicacaoFormData>(
    field: K,
    value: PublicacaoFormData[K],
  ) => void;
};

export function StepConteudo({ isEn = false, data, errors, onChange }: Props) {
  return (
    <Stack spacing={2}>
      <TextField
        fullWidth
        multiline
        minRows={3}
        label={isEn ? "Summary" : "Resumo"}
        value={data.resumo}
        onChange={(event) => onChange("resumo", event.target.value)}
        error={Boolean(errors.resumo)}
        helperText={errors.resumo}
      />

      <TextField
        fullWidth
        multiline
        minRows={8}
        label={isEn ? "Full content" : "Conteúdo completo"}
        value={data.conteudo}
        onChange={(event) => onChange("conteudo", event.target.value)}
        error={Boolean(errors.conteudo)}
        helperText={errors.conteudo}
      />

      <Box>
        <Button
          component="label"
          variant="outlined"
          startIcon={<Icon icon="mdi:paperclip" />}
          sx={{ textTransform: "none", borderColor: "divider" }}
        >
          {isEn ? "Upload attachments" : "Upload de anexos"}
          <input
            hidden
            type="file"
            multiple
            onChange={(event) =>
              onChange("anexos", Array.from(event.target.files || []))
            }
          />
        </Button>

        {data.anexos.length > 0 && (
          <Stack spacing={0.6} mt={1.2}>
            {data.anexos.map((file) => (
              <Typography
                key={`${file.name}-${file.size}`}
                fontSize="0.86rem"
                color="text.secondary"
              >
                • {file.name}
              </Typography>
            ))}
          </Stack>
        )}
      </Box>
    </Stack>
  );
}

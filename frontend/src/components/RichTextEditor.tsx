"use client";

import { useEffect, useCallback } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";

import {
  Box,
  Divider,
  FormHelperText,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { useState } from "react";

import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatStrikethroughIcon from "@mui/icons-material/FormatStrikethrough";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import LinkIcon from "@mui/icons-material/Link";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import TitleIcon from "@mui/icons-material/Title";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

interface RichTextEditorProps {
  label?: string;
  value: string;
  onChange: (html: string) => void;
  error?: string;
  helperText?: string;
  minRows?: number;
  placeholder?: string;
}


const HEADING_OPTIONS = [
  { label: "Texto normal", level: 0 as const },
  { label: "Título 1", level: 1 as const },
  { label: "Título 2", level: 2 as const },
  { label: "Título 3", level: 3 as const },
];

function ToolbarButton({
  active,
  disabled,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <Tooltip title={title}>
      <span>
        <IconButton
          size="small"
          onClick={onClick}
          disabled={disabled}
          sx={{
            borderRadius: "8px",
            color: active ? theme.palette.primary.main : theme.palette.text.secondary,
            backgroundColor: active
              ? theme.palette.primary.main + "1a" // ~10% opacity
              : "transparent",
            "&:hover": {
              backgroundColor: active
                ? theme.palette.primary.main + "26"
                : theme.palette.action.hover,
            },
          }}
        >
          {children}
        </IconButton>
      </span>
    </Tooltip>
  );
}

function HeadingMenu({ editor }: { editor: Editor }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const currentLevel =
    ([1, 2, 3] as const).find((l) => editor.isActive("heading", { level: l })) ?? 0;

  const currentLabel =
    HEADING_OPTIONS.find((o) => o.level === currentLevel)?.label ?? "Texto normal";

  const handleSelect = (level: 0 | 1 | 2 | 3) => {
    if (level === 0) {
      editor.chain().focus().setParagraph().run();
    } else {
      editor.chain().focus().toggleHeading({ level }).run();
    }
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip title="Estilo do parágrafo">
        <IconButton
          size="small"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{ borderRadius: "8px", px: 1, gap: 0.5 }}
        >
          <TitleIcon fontSize="small" />
          <Typography variant="caption" sx={{ minWidth: 72, textAlign: "left" }}>
            {currentLabel}
          </Typography>
          <ArrowDropDownIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        {HEADING_OPTIONS.map((opt) => (
          <MenuItem
            key={opt.label}
            selected={opt.level === currentLevel}
            onClick={() => handleSelect(opt.level)}
          >
            <Typography
              variant={opt.level === 0 ? "body2" : ("h" + Math.min(opt.level + 3, 6)) as any}
              sx={{ fontWeight: opt.level === 0 ? 400 : 700 }}
            >
              {opt.label}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

function Toolbar({ editor }: { editor: Editor | null }) {
  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL do link:", previousUrl ?? "");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <Stack
      direction="row"
      spacing={0.5}
      alignItems="center"
      flexWrap="wrap"
      sx={{
        p: 1,
        rowGap: 0.5,
        borderBottom: (t) => `1px solid ${t.palette.divider}`,
      }}
    >
      <HeadingMenu editor={editor} />
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />

      <ToolbarButton
        title="Negrito (Ctrl+B)"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <FormatBoldIcon fontSize="small" />
      </ToolbarButton>
      <ToolbarButton
        title="Itálico (Ctrl+I)"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <FormatItalicIcon fontSize="small" />
      </ToolbarButton>
      <ToolbarButton
        title="Sublinhado (Ctrl+U)"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <FormatUnderlinedIcon fontSize="small" />
      </ToolbarButton>
      <ToolbarButton
        title="Tachado"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <FormatStrikethroughIcon fontSize="small" />
      </ToolbarButton>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />

      <ToolbarButton
        title="Lista com marcadores"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <FormatListBulletedIcon fontSize="small" />
      </ToolbarButton>
      <ToolbarButton
        title="Lista numerada"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <FormatListNumberedIcon fontSize="small" />
      </ToolbarButton>
      <ToolbarButton
        title="Citação"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <FormatQuoteIcon fontSize="small" />
      </ToolbarButton>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />

      <ToolbarButton title="Inserir link" active={editor.isActive("link")} onClick={setLink}>
        <LinkIcon fontSize="small" />
      </ToolbarButton>
      <ToolbarButton
        title="Remover link"
        disabled={!editor.isActive("link")}
        onClick={() => editor.chain().focus().unsetLink().run()}
      >
        <LinkOffIcon fontSize="small" />
      </ToolbarButton>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />

      <ToolbarButton
        title="Desfazer (Ctrl+Z)"
        disabled={!editor.can().undo()}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <UndoIcon fontSize="small" />
      </ToolbarButton>
      <ToolbarButton
        title="Refazer (Ctrl+Shift+Z)"
        disabled={!editor.can().redo()}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <RedoIcon fontSize="small" />
      </ToolbarButton>
    </Stack>
  );
}


export default function RichTextEditor({
  label,
  value,
  onChange,
  error,
  helperText,
  minRows = 4,
  placeholder,
}: RichTextEditorProps) {
  const theme = useTheme();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({
        placeholder: placeholder ?? "Digite aqui...",
      }),
    ],
    content: value || "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        style: `min-height:${minRows * 1.6}em;`,
      },
    },
  });

  // mantém o editor sincronizado se o value mudar externamente
  // (ex.: reset do form, carregar dados de edição)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current && value !== undefined) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  return (
    <Box>
      {label && (
        <Typography variant="body2" fontWeight={600} mb={0.5}>
          {label}
        </Typography>
      )}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "12px",
          border: `1px solid ${error ? theme.palette.error.main : theme.palette.divider}`,
          overflow: "hidden",
          "&:focus-within": {
            borderColor: theme.palette.primary.main,
            boxShadow: `0 0 0 2px ${theme.palette.primary.main}22`,
          },
        }}
      >
        <Toolbar editor={editor} />
        <Box
          sx={{
            px: 2,
            py: 1.5,
            "& .ProseMirror": {
              outline: "none",
              fontSize: 15,
              lineHeight: 1.6,
              color: theme.palette.text.primary,
            },
            "& .ProseMirror p.is-editor-empty:first-of-type::before": {
              content: "attr(data-placeholder)",
              color: theme.palette.text.disabled,
              float: "left",
              height: 0,
              pointerEvents: "none",
            },
            "& .ProseMirror h1": { fontSize: "1.6em", fontWeight: 700, margin: "0.6em 0 0.3em" },
            "& .ProseMirror h2": { fontSize: "1.35em", fontWeight: 700, margin: "0.6em 0 0.3em" },
            "& .ProseMirror h3": { fontSize: "1.15em", fontWeight: 700, margin: "0.6em 0 0.3em" },
            "& .ProseMirror ul, & .ProseMirror ol": { paddingLeft: "1.4em", margin: "0.4em 0" },
            "& .ProseMirror blockquote": {
              borderLeft: `3px solid ${theme.palette.divider}`,
              margin: "0.6em 0",
              paddingLeft: "1em",
              color: theme.palette.text.secondary,
              fontStyle: "italic",
            },
            "& .ProseMirror a": { color: theme.palette.primary.main },
            "& .ProseMirror strong": { fontWeight: 700 },
          }}
        >
          <EditorContent editor={editor} />
        </Box>
      </Paper>
      <FormHelperText error={!!error}>{error ?? helperText}</FormHelperText>
    </Box>
  );
}
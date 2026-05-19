"use client";

import { Box, Typography, Stack } from "@mui/material";
import { Icon } from "@/components/AppIcon";
import Link from "next/link";

type Post = {
  title: string;
  description: string;
  category: string;
  date: string;
  author: string;
  image: string;
  href?: string;
};

type Props = {
  post: Post;
};

export function PostCard({ post }: Props) {
  const content = (
    <Box
      sx={{
        width: "100%",
        borderRadius: 3,
        overflow: "hidden",
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        transition: "0.3s",
        "&:hover": {
          boxShadow: 4,
          transform: "translateY(-6px)",
        },
        "&:hover img": {
          transform: "scale(1.05)",
        },
      }}
    >
      <Box
        component="img"
        src={post.image}
        alt={post.title}
        sx={{
          width: "100%",
          height: 180,
          objectFit: "cover",
          transition: "0.4s",
        }}
      />

      <Box p={3}>
        <Stack direction="row" spacing={2} mb={2} alignItems="center">
          <Box
            sx={{
              bgcolor: "action.hover",
              color: "primary.main",
              px: 1.5,
              py: 0.5,
              borderRadius: 5,
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            {post.category}
          </Box>

          <Stack direction="row" spacing={0.5} alignItems="center">
            <Icon icon="mdi:calendar" width={16} />
            <Typography variant="caption" color="text.secondary">
              {post.date}
            </Typography>
          </Stack>
        </Stack>

        <Typography fontWeight="bold" mb={1}>
          {post.title}
        </Typography>

        <Typography variant="body2" color="text.secondary" mb={2}>
          {post.description}
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <Icon icon="mdi:account" width={16} />
          <Typography variant="caption" color="text.secondary">
            {post.author}
          </Typography>
        </Stack>
      </Box>
    </Box>
  );

  if (post.href) {
    return (
      <Link
        href={post.href}
        style={{
          textDecoration: "none",
          color: "inherit",
          display: "block",
        }}
      >
        {content}
      </Link>
    );
  }

  return content;
}

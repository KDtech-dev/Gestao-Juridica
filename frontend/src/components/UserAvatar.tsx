import React from "react";
import MuiAvatar from "@mui/material/Avatar";
import { AvatarProps } from "@mui/material/Avatar";
import { Typography } from "@mui/material";

interface UserAvatarProps extends Omit<AvatarProps, "src"> {
  name: string;
  imageUrl?: string | null;
  sx?: object;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  imageUrl,
  sx,
  ...avatarProps
}) => {
  const avatarPalette = [
    { background: "#DDF4E8", text: "#008148" },
    { background: "#E2F3FF", text: "#0A8DE3" },
    { background: "#DDF4F4", text: "#00796B" },
    { background: "#FFF4D6", text: "#C88700" },
    { background: "#FFE7D6", text: "#E46A2E" },
    { background: "#FFE1DE", text: "#FF4D49" },
    { background: "#E7EEF9", text: "#242565" },
    { background: "#EEF3F8", text: "#4C4E64" },
  ];

  const getInitials = (name: string): string => {
    const names = name.split(" ");
    if (names.length === 0) return "";

    return `${names[0].charAt(0).toUpperCase()}${names.length > 1 ? names[1].charAt(0).toUpperCase() : ""}`;
  };

  const getPaletteIndexFromName = (name: string): number => {
    const normalizedName = name.trim().toUpperCase() || "USUARIO";
    const hash = normalizedName
      .split("")
      .reduce(
        (accumulator, character) => accumulator + character.charCodeAt(0),
        0,
      );

    return hash % avatarPalette.length;
  };

  const palette = avatarPalette[getPaletteIndexFromName(name)];
  const avatarColor = imageUrl ? "transparent" : palette.background;
  const textColor = imageUrl ? undefined : palette.text;

  return (
    <MuiAvatar
      {...avatarProps}
      sx={{
        backgroundColor: avatarColor,
        ...sx,
        fontSize: "1rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        "& img": {
          objectFit: "cover",
          width: "100%",
          height: "100%",
        },
      }}
      src={imageUrl || undefined}
    >
      {imageUrl ? null : (
        <Typography variant="body2" sx={{ fontSize: "1rem", color: textColor }}>
          {getInitials(name)}
        </Typography>
      )}
    </MuiAvatar>
  );
};

export default UserAvatar;

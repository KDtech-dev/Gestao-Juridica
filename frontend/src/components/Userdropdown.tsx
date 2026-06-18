"use client";

import { Fragment, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import Badge from "@mui/material/Badge";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import UserAvatar from "./UserAvatar";
import IconifyIcon from "@/@core/components/icon";
import { useAuth } from "@/hooks/useAuth";
import { useTranslations } from "next-intl";

const BadgeContentSpan = styled("span")(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: "50%",
  backgroundColor: theme.palette.success.main,
  boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
}));

const UserDropdown = () => {
  const t = useTranslations("internal.userMenu");
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const router = useRouter();
  const { logout, user } = useAuth();
  const userName = user?.name || t("fallbackUser");
  const userEmail = user?.email || "";
  const userRole = user?.roles?.[0]
    ? t(`roles.${String(user.roles[0])}`)
    : t("fallbackUser");

  const handleDropdownOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const getUserFirstName = () => {
    const name = user?.name;

    return name ? name.split(" ")[0] : "";
  };

  const handleDropdownClose = (url?: string) => {
    setAnchorEl(null);

    if (url) {
      router.push(url);
    }
  };

  const styles = {
    py: 1.25,
    px: 2,
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 1.25,
    color: "text.primary",
    textDecoration: "none",
    "& svg": {
      flexShrink: 0,
      fontSize: "1.2rem",
      color: "text.primary",
    },
  };

  const handleLogout = () => {
    logout();
    handleDropdownClose();
  };

  return (
    <Fragment>
      <Badge
        overlap="circular"
        onClick={handleDropdownOpen}
        sx={{ ml: 2, cursor: "pointer" }}
        badgeContent={<BadgeContentSpan />}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <UserAvatar
          id="userAvatar"
          name={userName}
          sx={{ width: 40, height: 40, cursor: "pointer" }}
        />
      </Badge>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => handleDropdownClose()}
        sx={{
          "& .MuiMenu-paper": {
            width: 260,
            maxWidth: "calc(100vw - 24px)",
            mt: 1.5,
            borderRadius: 2,
            overflow: "hidden",
          },
          "& .MuiMenu-list": {
            py: 0.75,
          },
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", minWidth: 0 }}>
            <Badge
              overlap="circular"
              badgeContent={<BadgeContentSpan />}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
            >
              <UserAvatar
                name={userName}
                sx={{ width: "2.0rem", height: "2.0rem" }}
              />
            </Badge>
            <Box
              sx={{
                display: "flex",
                ml: 1.5,
                minWidth: 0,
                alignItems: "flex-start",
                flexDirection: "column",
              }}
            >
              <Typography
                sx={{
                  width: "100%",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  lineHeight: 1.25,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {getUserFirstName()}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  width: "100%",
                  mt: 0.25,
                  fontSize: "0.75rem",
                  lineHeight: 1.25,
                  color: "text.disabled",
                  overflowWrap: "anywhere",
                }}
              >
                {userEmail || userRole}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Divider sx={{ mt: "0 !important" }} />
        <MenuItem sx={{ p: 0 }} onClick={() => handleDropdownClose("/profile")}>
          <Box sx={styles}>
            <IconifyIcon icon="mdi:account-outline" width="18" height="18" />{" "}
            <Typography
              sx={{ fontSize: "0.875rem", fontWeight: 500, lineHeight: 1.3 }}
            >
              {t("profile")}
            </Typography>
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={handleLogout}
          sx={{
            gap: 1.25,
            px: 2,
            py: 1.25,
            minHeight: 38,
            "& svg": { flexShrink: 0, color: "text.primary" },
          }}
        >
          <IconifyIcon icon="mdi:logout-variant" width="18" height="18" />{" "}
          <Typography
            sx={{ fontSize: "0.875rem", fontWeight: 500, lineHeight: 1.3 }}
          >
            {t("logout")}
          </Typography>
        </MenuItem>
      </Menu>
    </Fragment>
  );
};

export default UserDropdown;

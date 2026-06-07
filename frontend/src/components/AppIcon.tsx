"use client";

import {
  Icon as RemoteIcon,
  type IconProps as RemoteIconProps,
} from "@iconify/react";
import type { ComponentType, SVGProps } from "react";
import MdiAccount from "@iconify-react/mdi/account";
import MdiAccountGroupOutline from "@iconify-react/mdi/account-group-outline";
import MdiAccountMultipleOutline from "@iconify-react/mdi/account-multiple-outline";
import MdiAccountOutline from "@iconify-react/mdi/account-outline";
import MdiAccountPlusOutline from "@iconify-react/mdi/account-plus-outline";
import MdiAlertCircleOutline from "@iconify-react/mdi/alert-circle-outline";
import MdiArchiveOutline from "@iconify-react/mdi/archive-outline";
import MdiArrowLeft from "@iconify-react/mdi/arrow-left";
import MdiArrowRight from "@iconify-react/mdi/arrow-right";
import MdiBellOutline from "@iconify-react/mdi/bell-outline";
import MdiBellSleepOutline from "@iconify-react/mdi/bell-sleep-outline";
import MdiBriefcaseOutline from "@iconify-react/mdi/briefcase-outline";
import MdiCalendar from "@iconify-react/mdi/calendar";
import MdiCalendarCheckOutline from "@iconify-react/mdi/calendar-check-outline";
import MdiCalendarClock from "@iconify-react/mdi/calendar-clock";
import MdiCalendarMonthOutline from "@iconify-react/mdi/calendar-month-outline";
import MdiCalendarOutline from "@iconify-react/mdi/calendar-outline";
import MdiChartLine from "@iconify-react/mdi/chart-line";
import MdiCheckAll from "@iconify-react/mdi/check-all";
import MdiCheckCircle from "@iconify-react/mdi/check-circle";
import MdiChevronLeft from "@iconify-react/mdi/chevron-left";
import MdiChevronRight from "@iconify-react/mdi/chevron-right";
import MdiClockOutline from "@iconify-react/mdi/clock-outline";
import MdiClose from "@iconify-react/mdi/close";
import MdiDeleteOutline from "@iconify-react/mdi/delete-outline";
import MdiDownload from "@iconify-react/mdi/download";
import MdiDownloadOutline from "@iconify-react/mdi/download-outline";
import MdiEmailOutline from "@iconify-react/mdi/email-outline";
import MdiEyeOutline from "@iconify-react/mdi/eye-outline";
import MdiFacebook from "@iconify-react/mdi/facebook";
import MdiFileDocumentOutline from "@iconify-react/mdi/file-document-outline";
import MdiFileSearchOutline from "@iconify-react/mdi/file-search-outline";
import MdiFileUploadOutline from "@iconify-react/mdi/file-upload-outline";
import MdiFilterRemove from "@iconify-react/mdi/filter-remove";
import MdiFilterVariant from "@iconify-react/mdi/filter-variant";
import MdiFlagOutline from "@iconify-react/mdi/flag-outline";
import MdiFormatBold from "@iconify-react/mdi/format-bold";
import MdiFormatItalic from "@iconify-react/mdi/format-italic";
import MdiFormatListBulleted from "@iconify-react/mdi/format-list-bulleted";
import MdiFormatParagraph from "@iconify-react/mdi/format-paragraph";
import MdiGavel from "@iconify-react/mdi/gavel";
import MdiInstagram from "@iconify-react/mdi/instagram";
import MdiLinkedin from "@iconify-react/mdi/linkedin";
import MdiLoading from "@iconify-react/mdi/loading";
import MdiLogoutVariant from "@iconify-react/mdi/logout-variant";
import MdiMagnify from "@iconify-react/mdi/magnify";
import MdiMapMarkerOutline from "@iconify-react/mdi/map-marker-outline";
import MdiMenu from "@iconify-react/mdi/menu";
import MdiNewspaperVariantOutline from "@iconify-react/mdi/newspaper-variant-outline";
import MdiPaletteOutline from "@iconify-react/mdi/palette-outline";
import MdiPaperclip from "@iconify-react/mdi/paperclip";
import MdiPencilOutline from "@iconify-react/mdi/pencil-outline";
import MdiPhoneOutline from "@iconify-react/mdi/phone-outline";
import MdiPlus from "@iconify-react/mdi/plus";
import MdiShareVariantOutline from "@iconify-react/mdi/share-variant-outline";
import MdiShieldCheck from "@iconify-react/mdi/shield-check";
import MdiShieldOutline from "@iconify-react/mdi/shield-outline";
import MdiTimerSand from "@iconify-react/mdi/timer-sand";
import MdiTrashCanOutline from "@iconify-react/mdi/trash-can-outline";
import MdiUpdate from "@iconify-react/mdi/update";
import MdiUploadOutline from "@iconify-react/mdi/upload-outline";
import MdiUser from "@iconify-react/mdi/user";
import MdiWhatsapp from "@iconify-react/mdi/whatsapp";
import MdiWeatherNight from "@iconify-react/mdi/weather-night";
import MdiWhiteBalanceSunny from "@iconify-react/mdi/white-balance-sunny";

export type IconProps = RemoteIconProps;

type MdiIconComponent = ComponentType<
  Omit<SVGProps<SVGSVGElement>, "width" | "height" | "viewBox" | "xmlns"> & {
    width?: string;
    height?: string;
  }
>;

const mdiIcons: Record<string, MdiIconComponent> = {
  "mdi:account": MdiAccount,
  "mdi:account-group-outline": MdiAccountGroupOutline,
  "mdi:account-multiple-outline": MdiAccountMultipleOutline,
  "mdi:account-outline": MdiAccountOutline,
  "mdi:account-plus-outline": MdiAccountPlusOutline,
  "mdi:alert-circle-outline": MdiAlertCircleOutline,
  "mdi:archive-outline": MdiArchiveOutline,
  "mdi:arrow-left": MdiArrowLeft,
  "mdi:arrow-right": MdiArrowRight,
  "mdi:bell-outline": MdiBellOutline,
  "mdi:bell-sleep-outline": MdiBellSleepOutline,
  "mdi:briefcase-outline": MdiBriefcaseOutline,
  "mdi:calendar": MdiCalendar,
  "mdi:calendar-check-outline": MdiCalendarCheckOutline,
  "mdi:calendar-clock": MdiCalendarClock,
  "mdi:calendar-month-outline": MdiCalendarMonthOutline,
  "mdi:calendar-outline": MdiCalendarOutline,
  "mdi:chart-line": MdiChartLine,
  "mdi:check-all": MdiCheckAll,
  "mdi:check-circle": MdiCheckCircle,
  "mdi:chevron-left": MdiChevronLeft,
  "mdi:chevron-right": MdiChevronRight,
  "mdi:clock-outline": MdiClockOutline,
  "mdi:close": MdiClose,
  "mdi:delete-outline": MdiDeleteOutline,
  "mdi:download": MdiDownload,
  "mdi:download-outline": MdiDownloadOutline,
  "mdi:email-outline": MdiEmailOutline,
  "mdi:eye-outline": MdiEyeOutline,
  "mdi:facebook": MdiFacebook,
  "mdi:file-document-outline": MdiFileDocumentOutline,
  "mdi:file-search-outline": MdiFileSearchOutline,
  "mdi:file-upload-outline": MdiFileUploadOutline,
  "mdi:filter-remove": MdiFilterRemove,
  "mdi:filter-variant": MdiFilterVariant,
  "mdi:flag-outline": MdiFlagOutline,
  "mdi:format-bold": MdiFormatBold,
  "mdi:format-italic": MdiFormatItalic,
  "mdi:format-list-bulleted": MdiFormatListBulleted,
  "mdi:format-paragraph": MdiFormatParagraph,
  "mdi:gavel": MdiGavel,
  "mdi:instagram": MdiInstagram,
  "mdi:linkedin": MdiLinkedin,
  "mdi:loading": MdiLoading,
  "mdi:logout-variant": MdiLogoutVariant,
  "mdi:magnify": MdiMagnify,
  "mdi:map-marker-outline": MdiMapMarkerOutline,
  "mdi:menu": MdiMenu,
  "mdi:newspaper-remove-outline": MdiNewspaperVariantOutline,
  "mdi:newspaper-variant-outline": MdiNewspaperVariantOutline,
  "mdi:palette-outline": MdiPaletteOutline,
  "mdi:paperclip": MdiPaperclip,
  "mdi:pencil-outline": MdiPencilOutline,
  "mdi:phone-outline": MdiPhoneOutline,
  "mdi:plus": MdiPlus,
  "mdi:share-variant-outline": MdiShareVariantOutline,
  "mdi:shield-check": MdiShieldCheck,
  "mdi:shield-outline": MdiShieldOutline,
  "mdi:timer-sand": MdiTimerSand,
  "mdi:trash-can-outline": MdiTrashCanOutline,
  "mdi:update": MdiUpdate,
  "mdi:upload-outline": MdiUploadOutline,
  "mdi:user": MdiUser,
  "mdi:whatsapp": MdiWhatsapp,
  "mdi:weather-night": MdiWeatherNight,
  "mdi:white-balance-sunny": MdiWhiteBalanceSunny,
};

const toIconSize = (size: RemoteIconProps["width"]) =>
  size === undefined || size === null ? undefined : String(size);

export function Icon({ icon, width, height, ...props }: IconProps) {
  if (typeof icon === "string") {
    const LocalIcon = mdiIcons[icon];

    if (LocalIcon) {
      return (
        <LocalIcon
          {...(props as SVGProps<SVGSVGElement>)}
          width={toIconSize(width)}
          height={toIconSize(height)}
        />
      );
    }
  }

  return <RemoteIcon icon={icon} width={width} height={height} {...props} />;
}

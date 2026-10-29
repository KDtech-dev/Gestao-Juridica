
import { Icon, type IconProps } from "@/components/AppIcon";

const IconifyIcon = ({ icon, ...rest }: IconProps) => {
  return <Icon icon={icon} fontSize="1.5rem" {...rest} />;
};

export default IconifyIcon;

"use client";

import { useRouter } from "next/navigation";
import { ChangePasswordModal } from "@/components/modals/ChangePasswordModal";

export default function ChangePasswordView() {
  const router = useRouter();

  return <ChangePasswordModal open onClose={() => router.push("/profile")} />;
}

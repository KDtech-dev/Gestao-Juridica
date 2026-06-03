"use client";

import AdminUsersView from "@/views/Users/Users";

export default function AdminTeamView() {
  // Legacy route kept for backwards-compatibility.
  // Team management is now unified under the Users module.
  return <AdminUsersView />;
}

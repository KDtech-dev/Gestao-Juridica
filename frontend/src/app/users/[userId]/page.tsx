import UserFormView from "@/views/Users/UserFormView";

type Props = { params: Promise<{ userId: string }> };

export default async function UserDetailsPage({ params }: Props) {
  const { userId } = await params;
  return <UserFormView mode="view" userId={userId} />;
}

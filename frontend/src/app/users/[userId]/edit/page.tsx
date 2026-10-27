import UserFormView from "@/views/Users/UserFormView";

type Props = { params: Promise<{ userId: string }> };

export default async function EditUserPage({ params }: Props) {
  const { userId } = await params;
  return <UserFormView mode="edit" userId={userId} />;
}

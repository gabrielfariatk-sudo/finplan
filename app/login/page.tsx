import LoginView from "@/components/auth/LoginView";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return <LoginView next={next} />;
}

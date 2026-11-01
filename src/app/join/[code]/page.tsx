import App from "@/components/App";
export default async function JoinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  return <App inviteCode={(await params).code} />;
}

import { RepertorizationProvider } from "@/contexts/repertorization-context";

export default function RepertoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RepertorizationProvider>{children}</RepertorizationProvider>;
}

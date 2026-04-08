import { CleanerShell } from '@/components/cleaner-shell'

export default function CleanerLayout({ children }: { children: React.ReactNode }) {
  return <CleanerShell>{children}</CleanerShell>
}

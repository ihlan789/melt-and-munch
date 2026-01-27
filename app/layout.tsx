import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dimsum website frontend',
  description: 'Generated with BLACKBOX AI Builder',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
  <body suppressHydrationWarning={true}>
    {children}
  </body>
</html>
  )
}

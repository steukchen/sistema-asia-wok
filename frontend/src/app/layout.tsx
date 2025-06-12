import { AuthProvider } from './providers/providers';
import type { Metadata } from 'next';
import './globals.css';
import { montserrat, lusitana } from '../components/font'; 


export const metadata: Metadata = {
  title: 'Sistema ASIA WOK',
}

export default function RootLayout({
  children,
}: {
  children : React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${montserrat.className} antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}

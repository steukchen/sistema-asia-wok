import { AuthProvider } from './providers/providers';
import type { Metadata } from 'next';
import './globals.css';


export const metadata: Metadata = {
  title: 'Asia Wok - Restaurante',
}

export default function RootLayout({
  children,
}: {
  children : React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}

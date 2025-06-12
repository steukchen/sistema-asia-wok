import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/login'); // Redirige automáticamente al login
}
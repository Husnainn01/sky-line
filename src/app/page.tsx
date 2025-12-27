import HomePage from '@/components/HomePage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Skyline TRD - Japanese Car Exports',
  description: 'Skyline TRD - Your trusted partner for importing quality Japanese vehicles worldwide',
};

export default function Home() {
  return <HomePage />;
}

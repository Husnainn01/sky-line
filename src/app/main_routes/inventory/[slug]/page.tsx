import { Metadata } from 'next';
import InventoryDetailClient from '@/components/InventoryDetailClient';

export const metadata: Metadata = {
  title: 'Vehicle Details - Skyline TRD',
  description: 'View detailed information about this vehicle including specifications, features, and pricing.',
};

export default function InventoryDetailPage() {
  return <InventoryDetailClient />;
}

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PromotionBanner from '@/components/PromotionBanner';
import NewArrivalsPopup from '@/components/NewArrivalsPopup';
import { CartProvider } from '@/components/CartProvider';
import { listProducts } from '@/lib/catalog';

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const newArrivals = await listProducts({ filter: 'new', limit: 6 });

  return (
    <CartProvider>
      <PromotionBanner />
      <Header />
      {children}
      <Footer />
      <NewArrivalsPopup products={newArrivals} />
    </CartProvider>
  );
}

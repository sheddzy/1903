import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PromotionBanner from '@/components/PromotionBanner';
import { CartProvider } from '@/components/CartProvider';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <PromotionBanner />
      <Header />
      {children}
      <Footer />
    </CartProvider>
  );
}

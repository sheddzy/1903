export type Variant = {
  id: string;
  size: string;
  color: string;
  stock_on_hand: number;
  reserved_qty: number;
  is_active: boolean;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_minor: number;
  discount_price_minor: number | null;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  is_preorder: boolean;
  tags: string[];
  category: { name: string; slug: string } | null;
  images: { storage_path: string; sort_order: number; color: string | null }[];
  variants: Variant[];
};

export type Category = { id: string; name: string; slug: string };

export const availableQty = (v: Variant) => Math.max(0, v.stock_on_hand - v.reserved_qty);
export const unitPrice = (p: Pick<Product, 'price_minor' | 'discount_price_minor'>) =>
  p.discount_price_minor ?? p.price_minor;
export const activeVariants = (p: Product) => p.variants.filter((v) => v.is_active);
export const isSoldOut = (p: Product) => !activeVariants(p).some((v) => availableQty(v) > 0);

const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];
export const sortSizes = (sizes: string[]) =>
  [...sizes].sort((a, b) => {
    const ia = SIZE_ORDER.indexOf(a), ib = SIZE_ORDER.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.localeCompare(b);
  });

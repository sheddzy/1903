import CustomerAuthForm from '@/components/CustomerAuthForm';

export const metadata = { title: 'Customer Login | 1903 Originals' };

export default function CustomerLoginPage() {
  return <CustomerAuthForm mode="login" />;
}

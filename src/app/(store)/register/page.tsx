import CustomerAuthForm from '@/components/CustomerAuthForm';

export const metadata = { title: 'Create Account | 1903 Originals' };

export default function CustomerRegisterPage() {
  return <CustomerAuthForm mode="register" />;
}

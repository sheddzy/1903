export default function Contact() {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, '');
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-4xl">Contact</h1>
      <div className="mt-6 space-y-3 text-sm">
        {email && <p>Email: <a className="underline" href={`mailto:${email}`}>{email}</a></p>}
        {whatsapp && <p>WhatsApp: <a className="underline" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">Message us</a></p>}
        {!email && !whatsapp && <p className="text-ink/60">Contact details will be published here soon.</p>}
      </div>
    </main>
  );
}

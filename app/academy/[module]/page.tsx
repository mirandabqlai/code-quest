// app/academy/[module]/page.tsx
//
// Dynamic route for individual academy modules.
// Loads the module data by its URL slug and renders AcademyShell.
// If the slug doesn't match any module, shows a 404.

import { notFound } from 'next/navigation';
import { getModuleBySlug, MODULES } from '@/lib/academy/modules';
import AcademyShell from '@/components/academy/AcademyShell';

// Tell Next.js which slugs are valid so it can statically generate them.
// This avoids a runtime lookup for every request.
export function generateStaticParams() {
  return MODULES.map((mod) => ({
    module: mod.id,
  }));
}

interface PageProps {
  params: Promise<{ module: string }>;
}

export default async function AcademyModulePage({ params }: PageProps) {
  const { module: slug } = await params;
  const mod = getModuleBySlug(slug);

  if (!mod) {
    notFound();
  }

  return <AcademyShell module={mod} />;
}

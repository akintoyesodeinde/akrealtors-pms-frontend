import { useEffect } from 'react';

interface SeoHeadProps {
  title: string;
  description?: string;
  canonicalPath?: string;
  ogImage?: string | null;
  jsonLd?: Record<string, unknown> | null;
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string): void {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

export function SeoHead({
  title,
  description = 'Discover verified residential and commercial property sales, rentals, and leases across Nigeria on AkRealtors PMS.',
  canonicalPath,
  ogImage,
  jsonLd,
}: SeoHeadProps) {
  useEffect(() => {
    const fullTitle = `${title} | AkRealtors PMS`;
    document.title = fullTitle;
    upsertMeta('name', 'description', description);
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:type', 'website');
    if (ogImage) {
      upsertMeta('property', 'og:image', ogImage);
    }

    if (canonicalPath) {
      let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', `${window.location.origin}${canonicalPath}`);
    }

    const existingLd = document.head.querySelector('script[data-akrealtors-ld="true"]');
    if (existingLd) {
      existingLd.remove();
    }
    if (jsonLd) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-akrealtors-ld', 'true');
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
  }, [title, description, canonicalPath, ogImage, jsonLd]);

  return null;
}

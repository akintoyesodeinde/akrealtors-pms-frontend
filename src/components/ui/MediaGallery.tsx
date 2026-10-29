import { ChevronLeft, ChevronRight, Film, ImageIcon, Maximize2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { PublicMediaItem } from '../../api/contracts';

export function MediaGallery({
  title,
  media,
}: {
  title: string;
  media: PublicMediaItem[];
}) {
  const photos = media.filter((m) => m.mediaKind === 'IMAGE' && m.url);
  const videos = media.filter((m) => m.mediaKind === 'VIDEO' && m.url);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) =>
          prev === null ? null : (prev + 1) % Math.max(photos.length, 1),
        );
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) =>
          prev === null ? null : (prev - 1 + photos.length) % Math.max(photos.length, 1),
        );
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxIndex, photos.length]);

  const activeLightboxPhoto =
    lightboxIndex !== null ? photos[lightboxIndex] ?? null : null;

  return (
    <div className="space-y-6">
      {photos.length > 0 ? (
        <section aria-label="Property photographs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setLightboxIndex(0)}
              className="md:col-span-2 relative h-72 md:h-96 bg-slate-900 group text-left"
              aria-label={`Open photo 1 of ${photos.length} in full screen`}
            >
              <img
                src={photos[0]?.url ?? ''}
                alt={`${title} — main view`}
                className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-300"
              />
              <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/75 text-white text-xs font-medium">
                <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
                View all {photos.length} photos
              </span>
            </button>

            <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
              {photos.slice(1, 3).map((photo, idx) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setLightboxIndex(idx + 1)}
                  className="relative h-36 md:h-[11.6rem] bg-slate-900 overflow-hidden group"
                  aria-label={`Open photo ${idx + 2} of ${photos.length}`}
                >
                  <img
                    src={photo.thumbnailUrl ?? photo.url ?? ''}
                    alt={`${title} — view ${idx + 2}`}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </button>
              ))}
              {photos.length === 1 && (
                <div className="hidden md:flex flex-col items-center justify-center bg-slate-100 rounded-xl text-slate-500 text-xs p-4">
                  <ImageIcon className="w-6 h-6 text-slate-400 mb-1" aria-hidden="true" />
                  <span>1 verified photograph</span>
                </div>
              )}
            </div>
          </div>
        </section>
      ) : (
        <div className="h-64 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-500">
          <ImageIcon className="w-10 h-10 text-slate-400" aria-hidden="true" />
          <p className="text-sm font-medium mt-2">No photographs published for this offer yet</p>
        </div>
      )}

      {videos.length > 0 && (
        <section aria-label="Property video walkthroughs" className="space-y-3">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Film className="w-4 h-4 text-emerald-700" aria-hidden="true" />
            Property Video Walkthrough ({videos.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((vid, idx) => (
              <div
                key={vid.id}
                className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-800"
              >
                <video
                  controls
                  preload="metadata"
                  src={vid.url ?? undefined}
                  aria-label={`${title} video walkthrough ${idx + 1}`}
                  className="w-full max-h-80"
                >
                  Your browser does not support embedded property videos.
                </video>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeLightboxPhoto && lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Property photo gallery viewer"
          className="fixed inset-0 z-50 bg-slate-950/90 flex flex-col items-center justify-center p-4"
        >
          <div className="w-full max-w-5xl flex items-center justify-between text-white mb-3">
            <span className="text-sm font-medium">
              Photo {lightboxIndex + 1} of {photos.length}
            </span>
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              aria-label="Close photo viewer"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <div className="relative w-full max-w-5xl flex items-center justify-center">
            {photos.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setLightboxIndex((lightboxIndex - 1 + photos.length) % photos.length)
                }
                aria-label="Previous photo"
                className="absolute left-2 p-2.5 rounded-full bg-slate-900/80 text-white hover:bg-slate-800"
              >
                <ChevronLeft className="w-6 h-6" aria-hidden="true" />
              </button>
            )}

            <img
              src={activeLightboxPhoto.url ?? ''}
              alt={`${title} — full view ${lightboxIndex + 1}`}
              className="max-h-[78vh] max-w-full object-contain rounded-xl"
            />

            {photos.length > 1 && (
              <button
                type="button"
                onClick={() => setLightboxIndex((lightboxIndex + 1) % photos.length)}
                aria-label="Next photo"
                className="absolute right-2 p-2.5 rounded-full bg-slate-900/80 text-white hover:bg-slate-800"
              >
                <ChevronRight className="w-6 h-6" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

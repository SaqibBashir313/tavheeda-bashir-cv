import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/pagination';

import { ArrowLeft, ArrowRight, FileText } from 'lucide-react';
import { useCallback, useState } from 'react';
import type { Swiper as SwiperInstance } from 'swiper';
import { A11y, FreeMode, Keyboard, Mousewheel, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Tooltip } from '@/components/ui/Tooltip';
import type { ContractVehicle } from '@/data/resume';

interface VehiclesCarouselProps {
  vehicles: readonly ContractVehicle[];
}

interface Edges {
  atStart: boolean;
  atEnd: boolean;
}

/**
 * Contract vehicles, tuned for a "momentum + snap" feel on every input device.
 *
 *  - `freeMode` with `sticky` = flick, glide, then settle on a slide.
 *  - `mousewheel.forceToAxis` lets a trackpad's horizontal component drive the
 *    carousel while vertical scrolling still moves the page.
 *  - `releaseOnEdges` hands scrolling back to the document at either end.
 *  - `Keyboard` + `A11y` give arrow-key control and slide announcements.
 */
export function VehiclesCarousel({ vehicles }: VehiclesCarouselProps) {
  const [swiper, setSwiper] = useState<SwiperInstance | null>(null);
  const [edges, setEdges] = useState<Edges>({ atStart: true, atEnd: false });

  // Returning the previous object when nothing changed lets React bail out —
  // `onProgress` fires on every frame of a drag, so this matters.
  const syncEdges = useCallback((instance: SwiperInstance) => {
    setEdges((previous) =>
      previous.atStart === instance.isBeginning && previous.atEnd === instance.isEnd
        ? previous
        : { atStart: instance.isBeginning, atEnd: instance.isEnd },
    );
  }, []);

  return (
    <div className="space-y-6">
      <Swiper
        modules={[FreeMode, Mousewheel, Keyboard, Pagination, A11y]}
        onSwiper={setSwiper}
        onProgress={syncEdges}
        grabCursor
        watchSlidesProgress
        slidesPerView={1.15}
        spaceBetween={16}
        breakpoints={{
          640: { slidesPerView: 2.1, spaceBetween: 20 },
          1024: { slidesPerView: 3.1, spaceBetween: 24 },
          1280: { slidesPerView: 4.1, spaceBetween: 24 },
        }}
        freeMode={{
          enabled: true,
          momentum: true,
          momentumRatio: 0.7,
          momentumVelocityRatio: 0.7,
          momentumBounce: false,
          sticky: true,
        }}
        mousewheel={{ forceToAxis: true, releaseOnEdges: true, sensitivity: 0.7 }}
        keyboard={{ enabled: true, onlyInViewport: true }}
        pagination={{ clickable: true, dynamicBullets: true }}
        a11y={{
          enabled: true,
          containerMessage: 'Federal contract vehicles carousel',
          prevSlideMessage: 'Previous contract vehicle',
          nextSlideMessage: 'Next contract vehicle',
        }}
        className="w-full pb-10!"
      >
        {vehicles.map((vehicle) => (
          <SwiperSlide key={vehicle.name} className="h-auto!">
            <Tooltip content={vehicle.context} side="top">
              <Card
                interactive
                className="flex h-full min-h-36 cursor-default flex-col justify-between gap-4"
              >
                <FileText aria-hidden="true" className="size-4.5 text-brand" />
                <div className="space-y-1">
                  <p className="font-display text-lg leading-tight font-semibold tracking-[-0.015em]">
                    {vehicle.name}
                  </p>
                  <p className="text-xs text-content-muted">{vehicle.context}</p>
                </div>
              </Card>
            </Tooltip>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="icon"
          disabled={edges.atStart}
          onClick={() => swiper?.slidePrev()}
        >
          <ArrowLeft className="size-4" />
          <span className="sr-only">Previous contract vehicle</span>
        </Button>
        <Button
          variant="secondary"
          size="icon"
          disabled={edges.atEnd}
          onClick={() => swiper?.slideNext()}
        >
          <ArrowRight className="size-4" />
          <span className="sr-only">Next contract vehicle</span>
        </Button>
        <p className="ml-2 text-xs text-content-muted">
          Drag, scroll horizontally, or use the arrow keys.
        </p>
      </div>
    </div>
  );
}

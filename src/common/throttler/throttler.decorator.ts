import { SetMetadata } from '@nestjs/common';

export const SkipThrottle = (skip = true) => SetMetadata('skipThrottle', skip);
export const Throttle = (
  limitOrOptions: number | { name: string },
  ttl?: number,
) => {
  if (typeof limitOrOptions === 'number') {
    return SetMetadata('throttle', { limit: limitOrOptions, ttl });
  }
  return SetMetadata('throttler', limitOrOptions);
};

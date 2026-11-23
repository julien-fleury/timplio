/// <reference types="vite/client" />
import type { TimplioApi } from '../../shared/types';

declare global {
  interface Window { timplio: TimplioApi; }
}

export {};

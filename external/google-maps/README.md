# External Google Maps Module

## Env
- NEXT_PUBLIC_GOOGLE_MAPS_API_KEY must be set.

## Install
- pnpm add @googlemaps/js-api-loader

## Usage
```tsx
import { MapContainer } from "@/external/google-maps";

export default function Demo() {
  return (
    <MapContainer defaultCenter={{ lat: 37.7749, lng: -122.4194 }} />
  );
}
```

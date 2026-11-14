"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Crosshair, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/ui/field";
import { cn } from "@/lib/utils";

// Mapbox's widget touches `window`, so it is loaded client-side only and only
// when a token is configured.
const AddressAutofill = dynamic(
  () => import("@mapbox/search-js-react").then((m) => m.AddressAutofill),
  { ssr: false },
);

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

interface LocationInputProps {
  id: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  onCoordinatesChange: (lat: number | null, lng: number | null) => void;
}

const GEO_ERRORS: Record<number, string> = {
  1: "Location access was denied. Allow it in your browser settings or type an address.",
  2: "Your location is unavailable right now. Please type an address instead.",
  3: "Getting your location timed out. Please try again.",
};

export function LocationInput({
  id,
  value,
  error,
  onChange,
  onCoordinatesChange,
}: LocationInputProps) {
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const useMyLocation = () => {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError("Your browser doesn't support location access.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        onCoordinatesChange(coords.latitude, coords.longitude);
        onChange(
          `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`,
        );
        setLocating(false);
      },
      (err) => {
        setGeoError(GEO_ERRORS[err.code] ?? "Unable to get your location.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 0 },
    );
  };

  const describedBy = [
    error && `${id}-error`,
    geoError && `${id}-geo-error`,
    `${id}-hint`,
  ]
    .filter(Boolean)
    .join(" ");

  const input = (
    <Input
      id={id}
      type="text"
      autoComplete="street-address"
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
        onCoordinatesChange(null, null);
      }}
      placeholder="Street, landmark or area"
      className="pr-14"
      aria-invalid={!!error}
      aria-describedby={describedBy}
      maxLength={300}
    />
  );

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="flex items-baseline gap-2 text-sm font-medium"
      >
        Location{" "}
        <span className="text-xs font-normal text-muted-foreground">
          Optional
        </span>
      </label>
      <div className="relative">
        {MAPBOX_TOKEN ? (
          <AddressAutofill
            accessToken={MAPBOX_TOKEN}
            onRetrieve={(res) => {
              const coords = res.features[0]?.geometry?.coordinates;
              if (coords) onCoordinatesChange(coords[1], coords[0]);
            }}
          >
            {input}
          </AddressAutofill>
        ) : (
          input
        )}
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          aria-label="Use my current location"
          title="Use my current location"
          className={cn(
            "absolute right-1.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-primary transition-colors hover:bg-primary/10 disabled:opacity-60",
          )}
        >
          {locating ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Crosshair className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>
      <p id={`${id}-hint`} className="text-xs text-muted-foreground">
        {MAPBOX_TOKEN
          ? "Start typing to search addresses, or"
          : "Type a place, or"}{" "}
        use the crosshair to share your GPS position.
      </p>
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
      {geoError && <FieldError id={`${id}-geo-error`}>{geoError}</FieldError>}
    </div>
  );
}

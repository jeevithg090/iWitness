"use client";

import { useRef, useState } from "react";
import {
  AlertTriangle,
  ImagePlus,
  Info,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { REPORT_CATEGORIES, type ReportTypeValue } from "@/lib/constants";
import { prepareImage } from "@/lib/client-image";
import { cn } from "@/lib/utils";
import { createReportSchema, fieldErrors } from "@/lib/validation";
import { LocationInput } from "./location-input";
import { ReportSubmitted } from "./report-submitted";

type FormState = {
  type: ReportTypeValue | "";
  specificType: string;
  title: string;
  description: string;
  location: string;
};

const EMPTY_FORM: FormState = {
  type: "",
  specificType: "",
  title: "",
  description: "",
  location: "",
};

const TYPE_OPTIONS = [
  {
    value: "EMERGENCY" as const,
    label: "Emergency",
    hint: "Someone is at risk right now",
    icon: AlertTriangle,
    selected: "border-destructive bg-destructive/10 ring-1 ring-destructive",
    iconClass: "text-destructive",
  },
  {
    value: "NON_EMERGENCY" as const,
    label: "Non-emergency",
    hint: "General report or past incident",
    icon: Info,
    selected: "border-primary bg-primary/10 ring-1 ring-primary",
    iconClass: "text-primary",
  },
];

export function ReportForm({ aiEnabled }: { aiEnabled: boolean }) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [coords, setCoords] = useState<{
    lat: number | null;
    lng: number | null;
  }>({ lat: null, lng: null });
  const [image, setImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiFilled, setAiFilled] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(({ [key]: _removed, ...rest }) => rest);
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setImageError(null);
    let dataUrl: string;
    try {
      dataUrl = await prepareImage(file);
    } catch (err) {
      setImageError(
        err instanceof Error ? err.message : "Could not use that image.",
      );
      return;
    }
    setImage(dataUrl);
    if (!aiEnabled) return;

    setAnalyzing(true);
    try {
      const res = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Image analysis failed.");

      setForm((prev) => ({
        ...prev,
        title: data.title || prev.title,
        description: data.description || prev.description,
        specificType: data.reportType || prev.specificType,
      }));
      setErrors({});
      setAiFilled(true);
      toast.success("Details suggested from your photo. Please review them.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Image analysis failed.",
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImageError(null);
    if (fileInput.current) fileInput.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const payload = {
      type: form.type || undefined,
      specificType: form.specificType || undefined,
      title: form.title,
      description: form.description,
      location: form.location,
      latitude: coords.lat,
      longitude: coords.lng,
      image,
    };

    const parsed = createReportSchema.safeParse(payload);
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error);
      setErrors(errs);
      const first = Object.keys(errs)[0];
      document
        .getElementById(first === "specificType" ? "category" : first)
        ?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reports/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.fields) setErrors(data.fields);
        throw new Error(
          data.error || "We couldn't submit your report. Please try again.",
        );
      }
      setSubmittedId(data.reportId);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setForm(EMPTY_FORM);
    setCoords({ lat: null, lng: null });
    setImage(null);
    setErrors({});
    setAiFilled(false);
    setSubmittedId(null);
  };

  if (submittedId)
    return <ReportSubmitted reportId={submittedId} onReset={reset} />;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      {formError && (
        <Alert tone="error" title="Report not submitted">
          {formError}
        </Alert>
      )}

      <fieldset aria-describedby={errors.type ? "type-error" : undefined}>
        <legend className="mb-3 text-sm font-medium">
          How urgent is it?{" "}
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {TYPE_OPTIONS.map((option) => {
            const checked = form.type === option.value;
            const Icon = option.icon;
            return (
              <label
                key={option.value}
                className={cn(
                  "relative flex cursor-pointer items-center gap-4 rounded-xl border border-border bg-background p-4 transition-all hover:border-foreground/30 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring sm:flex-col sm:p-6 sm:text-center",
                  checked && option.selected,
                )}
              >
                <input
                  type="radio"
                  name="type"
                  id={option.value === "EMERGENCY" ? "type" : undefined}
                  value={option.value}
                  checked={checked}
                  onChange={() => update("type", option.value)}
                  className="sr-only"
                />
                <Icon
                  className={cn("size-7 shrink-0", option.iconClass)}
                  aria-hidden="true"
                />
                <span>
                  <span className="block font-semibold">{option.label}</span>
                  <span className="block text-sm text-muted-foreground">
                    {option.hint}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
        {form.type === "EMERGENCY" && (
          <Alert
            tone="error"
            className="mt-3"
            title="If anyone is in immediate danger, call 112 now."
          >
            This form is not monitored around the clock.
          </Alert>
        )}
        {errors.type && (
          <p
            id="type-error"
            role="alert"
            className="mt-2 text-sm text-destructive"
          >
            {errors.type}
          </p>
        )}
      </fieldset>

      <div className="space-y-2">
        <p
          className="flex items-baseline gap-2 text-sm font-medium"
          id="photo-label"
        >
          Photo evidence{" "}
          <span className="text-xs font-normal text-muted-foreground">
            Optional
          </span>
        </p>
        <div
          className={cn(
            "relative overflow-hidden rounded-xl border-2 border-dashed border-input transition-colors",
            dragging && "border-primary bg-primary/5",
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
        >
          <input
            ref={fileInput}
            id="image-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            aria-labelledby="photo-label"
            aria-describedby="photo-hint"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          {image ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element -- local data URL preview */}
              <img
                src={image}
                alt="Selected evidence preview"
                className="h-56 w-full object-cover sm:h-64"
              />
              <div className="absolute right-2 top-2 flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => fileInput.current?.click()}
                >
                  Change
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={removeImage}
                  aria-label="Remove photo"
                >
                  <X aria-hidden="true" />
                </Button>
              </div>
            </div>
          ) : (
            <label
              htmlFor="image-upload"
              className="flex cursor-pointer flex-col items-center gap-3 px-6 py-10 text-center transition-colors hover:bg-muted/50"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ImagePlus className="size-6" aria-hidden="true" />
              </span>
              <span className="text-sm">
                <span className="font-medium text-primary">Choose a photo</span>{" "}
                or drag it here
              </span>
            </label>
          )}
          {analyzing && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm"
              role="status"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-primary">
                <Sparkles className="size-4 animate-pulse" aria-hidden="true" />
                Analysing image…
              </span>
            </div>
          )}
        </div>
        <p id="photo-hint" className="text-xs text-muted-foreground">
          JPEG, PNG, WebP or GIF. Large photos are resized automatically.
          {aiEnabled &&
            " We'll suggest details from the photo using AI; you can edit everything."}
        </p>
        {imageError && (
          <p role="alert" className="text-sm text-destructive">
            {imageError}
          </p>
        )}
        {errors.image && (
          <p role="alert" className="text-sm text-destructive">
            {errors.image}
          </p>
        )}
      </div>

      {aiFilled && (
        <Alert tone="info" title="AI suggestions applied">
          Check the category, title and description below. They&apos;re
          suggestions, not facts.
        </Alert>
      )}

      <Field
        id="category"
        label="Category"
        required
        error={errors.specificType}
      >
        {(props) => (
          <Select
            {...props}
            value={form.specificType}
            onChange={(e) => update("specificType", e.target.value)}
          >
            <option value="">Select a category</option>
            {REPORT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        )}
      </Field>

      <LocationInput
        id="location"
        value={form.location}
        error={errors.location}
        onChange={(v) => update("location", v)}
        onCoordinatesChange={(lat, lng) => setCoords({ lat, lng })}
      />

      <Field
        id="title"
        label="Title"
        required
        error={errors.title}
        hint="A short summary, e.g. “Car break-in on Elm Street”."
      >
        {(props) => (
          <Input
            {...props}
            value={form.title}
            maxLength={120}
            onChange={(e) => update("title", e.target.value)}
          />
        )}
      </Field>

      <Field
        id="description"
        label="What happened?"
        required
        error={errors.description}
        hint={`${form.description.trim().length}/5000 · Include when it happened and anything that would help, but avoid details that identify you.`}
      >
        {(props) => (
          <Textarea
            {...props}
            rows={6}
            maxLength={5000}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
        )}
      </Field>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        loading={submitting}
        disabled={analyzing}
      >
        {!submitting && <Send aria-hidden="true" />}
        {submitting ? "Submitting…" : "Submit anonymous report"}
      </Button>
    </form>
  );
}

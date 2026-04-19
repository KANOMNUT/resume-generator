"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import { ResumeData } from "@/lib/schema";
import Field from "@/components/ui/Field";
import { StyledInput } from "@/components/ui/inputs";
import Icon from "@/components/ui/Icon";

interface PersonalSectionProps {
  register: UseFormRegister<ResumeData>;
  errors: FieldErrors<ResumeData>;
  onPhotoChange: (base64: string | null) => void;
  photoPreview: string | null;
}

export default function PersonalSection({
  register,
  errors,
  onPhotoChange,
  photoPreview,
}: PersonalSectionProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Photo must be smaller than 2MB");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => onPhotoChange(evt.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
        }}
      >
        <Field label="First name" required error={errors.firstName?.message}>
          <StyledInput {...register("firstName")} placeholder="Jane" />
        </Field>
        <Field label="Last name" required error={errors.lastName?.message}>
          <StyledInput {...register("lastName")} placeholder="Doe" />
        </Field>
        <Field
          label="Headline"
          optional
          hint="Appears under your name on the resume"
        >
          <StyledInput
            {...register("title")}
            placeholder="Senior Product Designer"
          />
        </Field>
        <Field label="Nickname" optional>
          <StyledInput {...register("nickname")} placeholder="" />
        </Field>
        <Field label="Email" required error={errors.email?.message}>
          <StyledInput
            type="email"
            {...register("email")}
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Phone" required error={errors.phone?.message}>
          <StyledInput
            type="tel"
            {...register("phone")}
            placeholder="+1 (555) 123-4567"
          />
        </Field>
        <Field label="Location" optional full>
          <StyledInput
            {...register("location")}
            placeholder="City, Country"
          />
        </Field>
      </div>

      <Field label="Profile photo" optional hint="JPEG, PNG, or WebP · max 2 MB">
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "14px",
            marginTop: "12px",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "10px",
              background: "#f2f2ef",
              border: "1px dashed var(--line)",
              display: "grid",
              placeItems: "center",
              color: "var(--ink-4)",
              overflow: "hidden",
              flexShrink: 0,
              position: "relative",
            }}
          >
            {photoPreview ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoPreview}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <button
                  type="button"
                  onClick={() => onPhotoChange(null)}
                  title="Remove"
                  style={{
                    position: "absolute",
                    top: "-6px",
                    right: "-6px",
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    background: "var(--ink)",
                    color: "#fff",
                    border: "2px solid #fff",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "11px",
                    cursor: "pointer",
                  }}
                >
                  <Icon name="x" size={10} />
                </button>
              </>
            ) : (
              <span style={{ opacity: 0.55 }}>
                <Icon name="photo" size={24} />
              </span>
            )}
          </div>
          <div>
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                height: "34px",
                padding: "0 12px",
                borderRadius: "8px",
                border: "1px solid var(--line)",
                background: "var(--panel)",
                color: "var(--ink-2)",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              <Icon name="upload" size={14} />
              {photoPreview ? "Change photo" : "Upload photo"}
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </label>
            <div
              style={{
                fontSize: "11.5px",
                color: "var(--ink-4)",
                marginTop: "8px",
              }}
            >
              Looks best with a square crop.
            </div>
          </div>
        </div>
      </Field>
    </div>
  );
}

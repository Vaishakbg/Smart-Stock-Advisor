"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { InvestmentHorizon, RiskLevel, UserProfile } from "@/utils/scoreStock";

const STORAGE_KEY = "smart-stock-advisor.user-profile";

export type UserProfileForm = {
  investmentHorizon: InvestmentHorizon;
  riskProfile: RiskLevel;
  preferredSectors: string[];
  notificationsOptIn: boolean;
};

const DEFAULT_PROFILE: UserProfileForm = {
  investmentHorizon: "mid",
  riskProfile: "moderate",
  preferredSectors: [],
  notificationsOptIn: false
};

function readProfile(): UserProfileForm {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return { ...DEFAULT_PROFILE, preferredSectors: [...DEFAULT_PROFILE.preferredSectors] };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_PROFILE, preferredSectors: [...DEFAULT_PROFILE.preferredSectors] };
    }
    const parsed = JSON.parse(raw) as Partial<UserProfileForm>;
    return {
      investmentHorizon: parsed.investmentHorizon ?? DEFAULT_PROFILE.investmentHorizon,
      riskProfile: parsed.riskProfile ?? DEFAULT_PROFILE.riskProfile,
      preferredSectors: Array.isArray(parsed.preferredSectors)
        ? parsed.preferredSectors.filter((entry): entry is string => typeof entry === "string")
        : DEFAULT_PROFILE.preferredSectors,
      notificationsOptIn: Boolean(parsed.notificationsOptIn)
    };
  } catch (error) {
    console.warn("Failed to read user profile from storage, using defaults", error);
    return { ...DEFAULT_PROFILE, preferredSectors: [...DEFAULT_PROFILE.preferredSectors] };
  }
}

function persistProfile(profile: UserProfileForm) {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.warn("Failed to persist user profile", error);
  }
}

function toUserProfile(form: UserProfileForm): UserProfile {
  return {
    risk: form.riskProfile,
    investmentHorizon: form.investmentHorizon,
    preferredSectors: form.preferredSectors,
    notificationsOptIn: form.notificationsOptIn
  };
}

export function useUserProfile() {
  const [form, setForm] = useState<UserProfileForm>(() => readProfile());

  useEffect(() => {
    setForm(readProfile());
  }, []);

  useEffect(() => {
    persistProfile(form);
  }, [form]);

  const updateField = useCallback(<K extends keyof UserProfileForm>(key: K, value: UserProfileForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleSector = useCallback((sector: string) => {
    setForm((prev) => {
      const normalized = sector.trim();
      if (!normalized) return prev;
      const exists = prev.preferredSectors.includes(normalized);
      return {
        ...prev,
        preferredSectors: exists
          ? prev.preferredSectors.filter((entry) => entry !== normalized)
          : [...prev.preferredSectors, normalized]
      };
    });
  }, []);

  const profile = useMemo(() => toUserProfile(form), [form]);

  return {
    form,
    profile,
    updateField,
    toggleSector,
    reset: () =>
      setForm({ ...DEFAULT_PROFILE, preferredSectors: [...DEFAULT_PROFILE.preferredSectors] })
  };
}

export type { UserProfile };

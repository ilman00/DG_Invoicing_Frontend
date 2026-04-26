import { useState, useEffect, useCallback } from 'react';
import { organizationApi } from '../api/organization.api';
import type { Organization, OrganizationFormValues } from '../api/organization.api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UseOrganizationReturn {
  organization: Organization | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  saveError: string | null;
  updateOrganization: (data: OrganizationFormValues) => Promise<void>;
  refresh: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useOrganization(): UseOrganizationReturn {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading]       = useState(true);
  const [isSaving, setIsSaving]         = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [saveError, setSaveError]       = useState<string | null>(null);
  const [tick, setTick]                 = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    const fetchOrganization = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await organizationApi.get();
        if (!cancelled) setOrganization(data);
      } catch (err: unknown) {
        if (!cancelled) {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            'Failed to load organization details';
          setError(message);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchOrganization();
    return () => { cancelled = true; };
  }, [tick]);

  // ── Update ─────────────────────────────────────────────────────────────────

  const updateOrganization = async (formData: OrganizationFormValues): Promise<void> => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const updated = await organizationApi.update(formData);
      setOrganization(updated);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to save organization details';
      setSaveError(message);
      throw err; // re-throw so the form can react (e.g. keep button in error state)
    } finally {
      setIsSaving(false);
    }
  };

  return { organization, isLoading, isSaving, error, saveError, updateOrganization, refresh };
}
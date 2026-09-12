import { useState, useEffect, useCallback, useMemo } from 'react';
import type { CVData, CVTemplate, CVRegionalMode, StoredCVRecord } from './types';
import { DEFAULT_CV } from './types';
import { DEFAULT_COVER_LETTER, type CoverLetterData } from './coverLetterTypes';

const CV_STORAGE_KEY = 'cv_saved_resumes_v1';
const CV_ACTIVE_ID_KEY = 'cv_active_id_v1';

// Legacy keys for backward compatibility and migration
const LEGACY_DATA_KEY = 'cv_data_v1';
const LEGACY_TEMPLATE_KEY = 'cv_template_v1';
const LEGACY_REGIONAL_KEY = 'cv_regional_mode_v1';
const LEGACY_COVER_KEY = 'cv_cover_letter_v1';
const LEGACY_KEYWORDS_KEY = 'cv_jd_keywords_v1';

function generateId(): string {
  return 'cv_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
}

function deriveTitle(data: CVData, fallback = 'My Resume'): string {
  if (data?.personal?.title && data.personal.title.trim()) {
    return `${data.personal.title.trim()} CV`;
  }
  if (data?.personal?.fullName && data.personal.fullName.trim()) {
    return `${data.personal.fullName.trim()}'s CV`;
  }
  return fallback;
}

function loadInitialResumes(): { resumes: StoredCVRecord[]; activeId: string } {
  try {
    const rawStored = localStorage.getItem(CV_STORAGE_KEY);
    if (rawStored) {
      const parsed = JSON.parse(rawStored) as StoredCVRecord[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        const savedActiveId = localStorage.getItem(CV_ACTIVE_ID_KEY);
        const validActiveId = parsed.some((r) => r.id === savedActiveId)
          ? (savedActiveId as string)
          : parsed[0].id;
        return { resumes: parsed, activeId: validActiveId };
      }
    }

    // Migration from legacy single-CV storage if present
    const rawLegacyData = localStorage.getItem(LEGACY_DATA_KEY);
    let initialData = DEFAULT_CV;
    let initialTitle = 'My Resume';

    if (rawLegacyData) {
      try {
        const parsedLegacy = JSON.parse(rawLegacyData);
        if (parsedLegacy && typeof parsedLegacy === 'object') {
          initialData = parsedLegacy;
          initialTitle = deriveTitle(initialData);
        }
      } catch {
        // fallback to default
      }
    }

    let initialTemplate: CVTemplate = 'classic';
    const rawTemplate = localStorage.getItem(LEGACY_TEMPLATE_KEY);
    if (rawTemplate) {
      try {
        initialTemplate = JSON.parse(rawTemplate);
      } catch {
        initialTemplate = (rawTemplate as CVTemplate) || 'classic';
      }
    }

    let initialRegional: CVRegionalMode = 'international';
    const rawRegional = localStorage.getItem(LEGACY_REGIONAL_KEY);
    if (rawRegional) {
      try {
        initialRegional = JSON.parse(rawRegional);
      } catch {
        initialRegional = (rawRegional as CVRegionalMode) || 'international';
      }
    }

    let initialCoverLetter: CoverLetterData = DEFAULT_COVER_LETTER;
    const rawCover = localStorage.getItem(LEGACY_COVER_KEY);
    if (rawCover) {
      try {
        initialCoverLetter = JSON.parse(rawCover);
      } catch {
        // ignore
      }
    }

    let initialKeywords = '';
    const rawKeywords = localStorage.getItem(LEGACY_KEYWORDS_KEY);
    if (rawKeywords) {
      try {
        initialKeywords = JSON.parse(rawKeywords);
      } catch {
        initialKeywords = rawKeywords;
      }
    }

    const firstCV: StoredCVRecord = {
      id: generateId(),
      title: initialTitle,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      data: initialData,
      template: initialTemplate,
      regionalMode: initialRegional,
      coverLetter: initialCoverLetter,
      jdKeywords: initialKeywords,
    };

    const initialList = [firstCV];
    localStorage.setItem(CV_STORAGE_KEY, JSON.stringify(initialList));
    localStorage.setItem(CV_ACTIVE_ID_KEY, firstCV.id);

    return { resumes: initialList, activeId: firstCV.id };
  } catch {
    const fallbackCV: StoredCVRecord = {
      id: generateId(),
      title: 'My Resume',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      data: DEFAULT_CV,
      template: 'classic',
      regionalMode: 'international',
      coverLetter: DEFAULT_COVER_LETTER,
      jdKeywords: '',
    };
    return { resumes: [fallbackCV], activeId: fallbackCV.id };
  }
}

export function useCVDocuments() {
  const [initial] = useState(loadInitialResumes);
  const [resumes, setResumes] = useState<StoredCVRecord[]>(initial.resumes);
  const [activeId, setActiveId] = useState<string>(initial.activeId);

  // Keep localStorage updated with resumes array
  useEffect(() => {
    try {
      localStorage.setItem(CV_STORAGE_KEY, JSON.stringify(resumes));
    } catch (e) {
      console.error('Failed to save resumes to localStorage', e);
    }
  }, [resumes]);

  // Keep localStorage updated with active CV id
  useEffect(() => {
    try {
      localStorage.setItem(CV_ACTIVE_ID_KEY, activeId);
    } catch (e) {
      console.error('Failed to save active CV id to localStorage', e);
    }
  }, [activeId]);

  // Resolve current active CV
  const activeCV = useMemo(() => {
    const found = resumes.find((r) => r.id === activeId);
    return found || resumes[0];
  }, [resumes, activeId]);

  // Sync active CV state back to legacy keys for compatibility
  useEffect(() => {
    if (!activeCV) return;
    try {
      localStorage.setItem(LEGACY_DATA_KEY, JSON.stringify(activeCV.data));
      localStorage.setItem(LEGACY_TEMPLATE_KEY, JSON.stringify(activeCV.template));
      localStorage.setItem(LEGACY_REGIONAL_KEY, JSON.stringify(activeCV.regionalMode));
      if (activeCV.coverLetter) {
        localStorage.setItem(LEGACY_COVER_KEY, JSON.stringify(activeCV.coverLetter));
      }
      if (typeof activeCV.jdKeywords === 'string') {
        localStorage.setItem(LEGACY_KEYWORDS_KEY, JSON.stringify(activeCV.jdKeywords));
      }
    } catch {
      // ignore
    }
  }, [activeCV]);

  // Switch to another CV
  const switchCV = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  // Create a new blank CV
  const createCV = useCallback(
    (customTitle?: string, template: CVTemplate = 'classic', regionalMode: CVRegionalMode = 'international') => {
      const newCV: StoredCVRecord = {
        id: generateId(),
        title: customTitle?.trim() || `Resume ${resumes.length + 1}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        data: DEFAULT_CV,
        template,
        regionalMode,
        coverLetter: DEFAULT_COVER_LETTER,
        jdKeywords: '',
      };

      setResumes((prev) => [newCV, ...prev]);
      setActiveId(newCV.id);
      return newCV;
    },
    [resumes.length]
  );

  // Duplicate an existing CV (useful for tailoring to different roles)
  const duplicateCV = useCallback(
    (idToDuplicate?: string) => {
      const targetId = idToDuplicate || activeId;
      const target = resumes.find((r) => r.id === targetId) || activeCV;
      if (!target) return null;

      const duplicated: StoredCVRecord = {
        id: generateId(),
        title: `${target.title} (Copy)`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        data: JSON.parse(JSON.stringify(target.data)),
        template: target.template,
        regionalMode: target.regionalMode,
        coverLetter: target.coverLetter ? JSON.parse(JSON.stringify(target.coverLetter)) : DEFAULT_COVER_LETTER,
        jdKeywords: target.jdKeywords || '',
      };

      setResumes((prev) => [duplicated, ...prev]);
      setActiveId(duplicated.id);
      return duplicated;
    },
    [activeId, activeCV, resumes]
  );

  // Rename CV
  const renameCV = useCallback((id: string, newTitle: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    setResumes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, title: trimmed, updatedAt: Date.now() } : r))
    );
  }, []);

  // Delete CV
  const deleteCV = useCallback(
    (id: string) => {
      setResumes((prev) => {
        const remaining = prev.filter((r) => r.id !== id);
        if (remaining.length === 0) {
          // If all deleted, generate a fresh blank CV
          const freshCV: StoredCVRecord = {
            id: generateId(),
            title: 'My Resume',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            data: DEFAULT_CV,
            template: 'classic',
            regionalMode: 'international',
            coverLetter: DEFAULT_COVER_LETTER,
            jdKeywords: '',
          };
          setActiveId(freshCV.id);
          return [freshCV];
        }

        // If deleting active CV, select the first remaining
        if (id === activeId) {
          setActiveId(remaining[0].id);
        }
        return remaining;
      });
    },
    [activeId]
  );

  // Update CV data for active CV
  const updateActiveData = useCallback(
    (dataOrFn: CVData | ((prev: CVData) => CVData)) => {
      setResumes((prev) =>
        prev.map((r) => {
          if (r.id !== activeId) return r;
          const nextData = typeof dataOrFn === 'function' ? dataOrFn(r.data) : dataOrFn;
          return {
            ...r,
            data: nextData,
            updatedAt: Date.now(),
          };
        })
      );
    },
    [activeId]
  );

  // Update Template for active CV
  const updateActiveTemplate = useCallback(
    (template: CVTemplate) => {
      setResumes((prev) =>
        prev.map((r) => (r.id === activeId ? { ...r, template, updatedAt: Date.now() } : r))
      );
    },
    [activeId]
  );

  // Update Regional Mode for active CV
  const updateActiveRegionalMode = useCallback(
    (regionalMode: CVRegionalMode) => {
      setResumes((prev) =>
        prev.map((r) => (r.id === activeId ? { ...r, regionalMode, updatedAt: Date.now() } : r))
      );
    },
    [activeId]
  );

  // Update Cover Letter for active CV
  const updateActiveCoverLetter = useCallback(
    (clOrFn: CoverLetterData | ((prev: CoverLetterData) => CoverLetterData)) => {
      setResumes((prev) =>
        prev.map((r) => {
          if (r.id !== activeId) return r;
          const nextCl =
            typeof clOrFn === 'function'
              ? clOrFn(r.coverLetter || DEFAULT_COVER_LETTER)
              : clOrFn;
          return {
            ...r,
            coverLetter: nextCl,
            updatedAt: Date.now(),
          };
        })
      );
    },
    [activeId]
  );

  // Update Job Description Keywords for active CV
  const updateActiveJdKeywords = useCallback(
    (jdKeywords: string) => {
      setResumes((prev) =>
        prev.map((r) => (r.id === activeId ? { ...r, jdKeywords, updatedAt: Date.now() } : r))
      );
    },
    [activeId]
  );

  return {
    resumes,
    activeId,
    activeCV,
    switchCV,
    createCV,
    duplicateCV,
    renameCV,
    deleteCV,
    updateActiveData,
    updateActiveTemplate,
    updateActiveRegionalMode,
    updateActiveCoverLetter,
    updateActiveJdKeywords,
  };
}

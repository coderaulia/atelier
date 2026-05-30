import { useState, useEffect } from 'react';
import { getMe } from '../lib/api';
import { getAuthToken } from '../lib/auth';

export interface PlanResult {
  plan: 'free' | 'pro' | null;
  isLoading: boolean;
  isPro: boolean;
}

export function usePlan(): PlanResult {
  const [plan, setPlan] = useState<'free' | 'pro' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setPlan(null);
      setIsLoading(false);
      return;
    }
    getMe(token)
      .then(({ user }) => setPlan(user.plan))
      .catch(() => setPlan(null))
      .finally(() => setIsLoading(false));
  }, []);

  return { plan, isLoading, isPro: plan === 'pro' };
}

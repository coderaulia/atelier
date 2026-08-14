import { useState, useEffect } from 'react';
import { getMe } from '../lib/api';
import { useAuthToken } from './useAuthToken';

export interface PlanResult {
  plan: 'free' | 'pro' | null;
  isLoading: boolean;
  isPro: boolean;
}

export function usePlan(): PlanResult {
  const token = useAuthToken();
  const [plan, setPlan] = useState<'free' | 'pro' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setPlan(null);
      setIsLoading(false);
      return;
    }
    getMe(token)
      .then(({ user }) => setPlan(user.plan))
      .catch(() => setPlan(null))
      .finally(() => setIsLoading(false));
  }, [token]);

  return { plan, isLoading, isPro: plan === 'pro' };
}

// hooks/useSharePlan.ts
import { useState } from 'react';

interface UseSharePlanProps {
  onSharePlan: (plan: any) => void;
}

export const useSharePlan = ({ onSharePlan }: UseSharePlanProps) => {
  const [showShareModal, setShowShareModal] = useState(false);

  const handleSharePlan = (plan: any) => {
    onSharePlan(plan);
    setShowShareModal(false);
  };

  const openShareModal = () => {
    setShowShareModal(true);
  };

  const closeShareModal = () => {
    setShowShareModal(false);
  };

  return {
    showShareModal,
    handleSharePlan,
    openShareModal,
    closeShareModal,
  };
};



import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { ResourceForm } from '../../components/resources/ResourceForm';
import { useData } from '../../context/DataContext';
import { Resource } from '../../types';

interface CreateResourcePageProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const CreateResourcePage: React.FC<CreateResourcePageProps> = ({ onBack, onSuccess }) => {
  const { createResource } = useData();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setIsLoading(true);
      await createResource(data);
      onSuccess();
    } catch (e) {
      console.error('Failed to create resource:', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Cancel & Return
      </button>

      <PageHeader
        title="List Institutional Equipment"
        description="Register a laboratory instrument, workstation, makerspace tool, or workspace for inter-collegiate sharing."
      />

      <ResourceForm onSubmit={handleSubmit} onCancel={onBack} isLoading={isLoading} />
    </div>
  );
};

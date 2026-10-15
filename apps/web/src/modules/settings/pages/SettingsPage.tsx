import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CompanyProfilePage } from './CompanyProfilePage';
import { TeamManagementTab } from '../components/TeamManagementTab';
import api from '@/lib/api';

export function SettingsPage() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'general';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [workspaceSettings, setWorkspaceSettings] = useState<any>(null);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings/workspace-settings');
      setWorkspaceSettings(res.data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <div className="w-full">
      {/* Content Area */}
      <div>
        {activeTab === 'general' && (
          <CompanyProfilePage settings={workspaceSettings} onRefresh={fetchSettings} />
        )}

        {activeTab === 'team' && (
          <TeamManagementTab />
        )}
      </div>
    </div>
  );
}

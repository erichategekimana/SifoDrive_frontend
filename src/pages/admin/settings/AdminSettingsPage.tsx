import React from 'react';
import {
  useAdminSettingsData,
  SettingsHeader,
  SettingsTabsNav,
  PlatformSettingsSection,
  FinanceSettingsSection,
  OperationalRulesSection,
  NotificationSettingsSection,
  AcademyConfigSection,
} from '../../../features/settings';

export const AdminSettingsPage: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    platformConfig,
    setPlatformConfig,
    featureFlags,
    setFeatureFlags,
    handleResetPlatformDefaults,
    pricing,
    setPricing,
    rules,
    setRules,
    notifications,
    setNotifications,
    academy,
    setAcademy,
    formatRwf,
    handleSave,
    isSaving,
  } = useAdminSettingsData();

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Top Header */}
      <SettingsHeader onSave={handleSave} isSaving={isSaving} />

      {/* Tabs */}
      <SettingsTabsNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* 0. Platform Settings Tab */}
      {activeTab === 'platform' && (
        <PlatformSettingsSection
          platformConfig={platformConfig}
          setPlatformConfig={setPlatformConfig}
          featureFlags={featureFlags}
          setFeatureFlags={setFeatureFlags}
          onResetDefaults={handleResetPlatformDefaults}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}

      {/* 1. Finance Tab */}
      {activeTab === 'finance' && (
        <FinanceSettingsSection
          pricing={pricing}
          setPricing={setPricing}
          formatRwf={formatRwf}
        />
      )}

      {/* 2. Operational Rules Tab */}
      {activeTab === 'rules' && (
        <OperationalRulesSection
          rules={rules}
          setRules={setRules}
        />
      )}

      {/* 3. Notifications Tab */}
      {activeTab === 'notifications' && (
        <NotificationSettingsSection
          notifications={notifications}
          setNotifications={setNotifications}
        />
      )}

      {/* 4. Academy Profile Tab */}
      {activeTab === 'academy' && (
        <AcademyConfigSection
          academy={academy}
          setAcademy={setAcademy}
        />
      )}
    </div>
  );
};

export default AdminSettingsPage;

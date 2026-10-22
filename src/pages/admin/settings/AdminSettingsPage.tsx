import React from 'react';
import {
  useAdminSettingsData,
  SettingsHeader,
  SettingsTabsNav,
  FinanceSettingsSection,
  OperationalRulesSection,
  NotificationSettingsSection,
  AcademyConfigSection,
} from '../../../features/settings';

export const AdminSettingsPage: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isSaving,
    pricing,
    setPricing,
    rules,
    setRules,
    notifications,
    setNotifications,
    academy,
    setAcademy,
    handleSave,
    formatRwf,
  } = useAdminSettingsData();

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Top Header */}
      <SettingsHeader
        isSaving={isSaving}
        onSave={handleSave}
      />

      {/* Tabs */}
      <SettingsTabsNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* 1. Finance Tab */}
      {activeTab === 'finance' && (
        <FinanceSettingsSection
          pricing={pricing}
          setPricing={setPricing}
          formatRwf={formatRwf}
        />
      )}

      {/* 3. Operational Rules Tab */}
      {activeTab === 'rules' && (
        <OperationalRulesSection
          rules={rules}
          setRules={setRules}
        />
      )}

      {/* 4. Notifications Tab */}
      {activeTab === 'notifications' && (
        <NotificationSettingsSection
          notifications={notifications}
          setNotifications={setNotifications}
        />
      )}

      {/* 5. Academy Profile Tab */}
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

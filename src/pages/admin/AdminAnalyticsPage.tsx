import React from 'react';
import { Spinner } from '../../components/common/Spinner';
import {
  useAdminAnalyticsData,
  AnalyticsHeader,
  AnalyticsExecutiveRibbon,
  AnalyticsTabsNav,
  FinanceAnalyticsTab,
  ActivitiesAnalyticsTab,
  StudentsAnalyticsTab,
  GuestsAnalyticsTab,
  OperationsAnalyticsTab,
} from '../../features/analytics';

export const AdminAnalyticsPage: React.FC = () => {
  const {
    timeframe,
    setTimeframe,
    activeTab,
    setActiveTab,
    analyticsData,
    isLoading,
    isRefreshing,
    handleRefresh,
    handleExportSummary,
    formatCurrency,
    formatNumber,
    exec,
    fin,
    act,
    stu,
    gst,
    ops,
    revenueChartData,
    feeStreamSegments,
    domainRadarData,
    bookingBarsData,
    guestFunnelStages,
    operationsChartData,
    timeframeLabels,
  } = useAdminAnalyticsData();

  if (isLoading && !analyticsData) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <Spinner size={44} />
        <p style={{ marginTop: '16px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Loading platform analytics...
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <AnalyticsHeader
        timeframe={timeframe}
        setTimeframe={setTimeframe}
        timeframeLabel={analyticsData?.timeframe_label || timeframeLabels[timeframe]}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        onExport={handleExportSummary}
      />

      <AnalyticsExecutiveRibbon
        exec={exec}
        formatCurrency={formatCurrency}
        formatNumber={formatNumber}
      />

      <AnalyticsTabsNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {activeTab === 'finance' && (
        <FinanceAnalyticsTab
          fin={fin}
          revenueChartData={revenueChartData}
          feeStreamSegments={feeStreamSegments}
          formatCurrency={formatCurrency}
        />
      )}

      {activeTab === 'activities' && (
        <ActivitiesAnalyticsTab
          act={act}
          domainRadarData={domainRadarData}
          bookingBarsData={bookingBarsData}
          formatNumber={formatNumber}
        />
      )}

      {activeTab === 'students' && (
        <StudentsAnalyticsTab
          stu={stu}
        />
      )}

      {activeTab === 'guests' && (
        <GuestsAnalyticsTab
          gst={gst}
          guestFunnelStages={guestFunnelStages}
          formatNumber={formatNumber}
        />
      )}

      {activeTab === 'operations' && (
        <OperationsAnalyticsTab
          ops={ops}
          operationsChartData={operationsChartData}
          formatNumber={formatNumber}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
};

export default AdminAnalyticsPage;

import React from 'react';
import { Spinner } from '../../components/common/Spinner';
import {
  useLiveClassesAdmin,
  LiveClassesHeader,
  CohortsStrip,
  LiveClassesCalendarView,
  LiveClassesTableView,
  CreateCohortModal,
  ScheduleClassModal,
  ClassDetailModal,
} from '../../features/live-classes';

export const AdminLiveClassesPage: React.FC = () => {
  const {
    dayOptions,
    periodOptions,
    weekdaysList,
    classes,
    cohorts,
    isLoading,
    viewMode,
    setViewMode,
    selectedClass,
    setSelectedClass,
    isCohortModalOpen,
    setIsCohortModalOpen,
    isClassModalOpen,
    setIsClassModalOpen,
    cohortName,
    setCohortName,
    cohortStartDate,
    setCohortStartDate,
    cohortEndDate,
    setCohortEndDate,
    cohortDescription,
    setCohortDescription,
    scheduleMode,
    setScheduleMode,
    classTitle,
    setClassTitle,
    classCohortId,
    setClassCohortId,
    classStartTime,
    setClassStartTime,
    classEndTime,
    setClassEndTime,
    classMeetLink,
    setClassMeetLink,
    singleDate,
    setSingleDate,
    recurringDay,
    setRecurringDay,
    recurringStartDate,
    setRecurringStartDate,
    recurringPeriodMonths,
    setRecurringPeriodMonths,
    isSubmitting,
    calendarDays,
    classesByDate,
    monthName,
    loadData,
    handleCreateCohort,
    handleScheduleSubmit,
    handleClassAction,
    handleDayClick,
    nextMonth,
    prevMonth,
    todayMonth,
  } = useLiveClassesAdmin();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <LiveClassesHeader
        viewMode={viewMode}
        setViewMode={setViewMode}
        isLoading={isLoading}
        onRefresh={loadData}
        onOpenCohortModal={() => setIsCohortModalOpen(true)}
        onOpenClassModal={() => setIsClassModalOpen(true)}
      />

      <CohortsStrip cohorts={cohorts} />

      {isLoading ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <Spinner message="Loading live classes..." />
        </div>
      ) : viewMode === 'CALENDAR' ? (
        <LiveClassesCalendarView
          monthName={monthName}
          totalClassesCount={classes.length}
          calendarDays={calendarDays}
          classesByDate={classesByDate}
          weekdaysList={weekdaysList}
          onPrevMonth={prevMonth}
          onNextMonth={nextMonth}
          onTodayMonth={todayMonth}
          onDayClick={handleDayClick}
          onSelectClass={setSelectedClass}
        />
      ) : (
        <LiveClassesTableView
          classes={classes}
          onClassAction={handleClassAction}
        />
      )}

      <CreateCohortModal
        isOpen={isCohortModalOpen}
        onClose={() => setIsCohortModalOpen(false)}
        onSubmit={handleCreateCohort}
        cohortName={cohortName}
        setCohortName={setCohortName}
        cohortStartDate={cohortStartDate}
        setCohortStartDate={setCohortStartDate}
        cohortEndDate={cohortEndDate}
        setCohortEndDate={setCohortEndDate}
        cohortDescription={cohortDescription}
        setCohortDescription={setCohortDescription}
        isSubmitting={isSubmitting}
      />

      <ScheduleClassModal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        onSubmit={handleScheduleSubmit}
        cohorts={cohorts}
        scheduleMode={scheduleMode}
        setScheduleMode={setScheduleMode}
        classTitle={classTitle}
        setClassTitle={setClassTitle}
        classCohortId={classCohortId}
        setClassCohortId={setClassCohortId}
        recurringDay={recurringDay}
        setRecurringDay={setRecurringDay}
        recurringPeriodMonths={recurringPeriodMonths}
        setRecurringPeriodMonths={setRecurringPeriodMonths}
        recurringStartDate={recurringStartDate}
        setRecurringStartDate={setRecurringStartDate}
        singleDate={singleDate}
        setSingleDate={setSingleDate}
        classStartTime={classStartTime}
        setClassStartTime={setClassStartTime}
        classEndTime={classEndTime}
        setClassEndTime={setClassEndTime}
        classMeetLink={classMeetLink}
        setClassMeetLink={setClassMeetLink}
        isSubmitting={isSubmitting}
        dayOptions={dayOptions}
        periodOptions={periodOptions}
      />

      <ClassDetailModal
        selectedClass={selectedClass}
        onClose={() => setSelectedClass(null)}
        onAction={handleClassAction}
      />
    </div>
  );
};

export default AdminLiveClassesPage;

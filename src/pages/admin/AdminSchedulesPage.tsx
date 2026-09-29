import React from 'react';
import { Link } from 'react-router-dom';
import { Video, RefreshCw, Plus } from 'lucide-react';
import { Spinner } from '../../components/common/Spinner';
import {
  useLiveClassesAdmin,
  LiveClassesCalendarView,
  ScheduleClassModal,
  ClassDetailModal,
} from '../../features/live-classes';

export const AdminSchedulesPage: React.FC = () => {
  const {
    t,
    dayOptions,
    periodOptions,
    weekdaysList,
    classes,
    cohorts,
    isLoading,
    selectedClass,
    setSelectedClass,
    isClassModalOpen,
    setIsClassModalOpen,
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
    handleScheduleSubmit,
    handleClassAction,
    handleDayClick,
    nextMonth,
    prevMonth,
    todayMonth,
  } = useLiveClassesAdmin();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            {t('admin.liveClasses.schedulesAndEvents')}
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {t('admin.liveClasses.subtitle')}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link
            to="/admin/live-classes"
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Video size={14} />
            <span>{t('admin.liveClasses.classesAndCohorts')}</span>
          </Link>

          <button
            onClick={loadData}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={13} className={isLoading ? 'spin' : ''} />
            <span>{t('admin.liveClasses.refresh')}</span>
          </button>
          <button
            onClick={() => setIsClassModalOpen(true)}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={14} />
            <span>{t('admin.liveClasses.scheduleEvent')}</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <Spinner message="Loading calendar schedule..." />
        </div>
      ) : (
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
      )}

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

export default AdminSchedulesPage;

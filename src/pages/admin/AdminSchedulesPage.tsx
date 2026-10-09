import React from 'react';
import { Link } from 'react-router-dom';
import { Video, RefreshCw, Plus, Calendar as CalendarIcon, List } from 'lucide-react';
import { Spinner } from '../../components/common/Spinner';
import {
  useLiveClassesAdmin,
  LiveClassesCalendarView,
  LiveClassesTableView,
  ScheduleClassModal,
  ClassDetailModal,
  EditClassModal,
  EditScheduleModal,
} from '../../features/live-classes';

export const AdminSchedulesPage: React.FC = () => {
  const {
    t,
    dayOptions,
    periodOptions,
    weekdaysList,
    classes,
    schedules,
    cohorts,
    isLoading,
    viewMode,
    setViewMode,
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
    recurringDays,
    setRecurringDays,
    recurringPeriodValue,
    setRecurringPeriodValue,
    recurringPeriodUnit,
    setRecurringPeriodUnit,
    recurringStartDate,
    setRecurringStartDate,
    recurringEndDate,
    setRecurringEndDate,
    handleStartDateChange,
    handlePeriodValueChange,
    handlePeriodUnitChange,
    isSubmitting,
    calendarDays,
    classesByDate,
    monthName,
    loadData,
    handleScheduleSubmit,
    handleClassAction,
    handleDayClick,
    isEditModalOpen,
    setIsEditModalOpen,
    editingClass,
    editTitle,
    setEditTitle,
    editTopic,
    setEditTopic,
    editCohortId,
    setEditCohortId,
    editScheduledDate,
    setEditScheduledDate,
    editStartTime,
    setEditStartTime,
    editEndTime,
    setEditEndTime,
    editMeetLink,
    setEditMeetLink,
    editStatus,
    setEditStatus,
    handleOpenEditModal,
    handleUpdateClass,
    handleDeleteClass,
    isEditScheduleModalOpen,
    setIsEditScheduleModalOpen,
    editingSchedule,
    editScheduleTitle,
    setEditScheduleTitle,
    editScheduleTopic,
    setEditScheduleTopic,
    editScheduleCohortId,
    setEditScheduleCohortId,
    editScheduleStartTime,
    setEditScheduleStartTime,
    editScheduleEndTime,
    setEditScheduleEndTime,
    editScheduleMeetLink,
    setEditScheduleMeetLink,
    editScheduleNotes,
    setEditScheduleNotes,
    handleOpenEditSchedule,
    handleUpdateSchedule,
    handleDeleteSchedule,
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

          {/* Calendar / Table viewMode toggle */}
          <div style={{ display: 'flex', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '2px' }}>
            <button
              onClick={() => setViewMode('CALENDAR')}
              style={{
                background: viewMode === 'CALENDAR' ? 'var(--bg-surface)' : 'transparent',
                color: viewMode === 'CALENDAR' ? 'var(--text-primary)' : 'var(--text-muted)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '5px 10px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <CalendarIcon size={13} />
              <span>{t('admin.liveClasses.calendar')}</span>
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              style={{
                background: viewMode === 'TABLE' ? 'var(--bg-surface)' : 'transparent',
                color: viewMode === 'TABLE' ? 'var(--text-primary)' : 'var(--text-muted)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '5px 10px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <List size={13} />
              <span>{t('admin.liveClasses.table')}</span>
            </button>
          </div>

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
          <Spinner message="Loading schedule..." />
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
          schedules={schedules}
          onClassAction={handleClassAction}
          onEditClass={handleOpenEditModal}
          onDeleteClass={handleDeleteClass}
          onEditSchedule={handleOpenEditSchedule}
          onDeleteSchedule={handleDeleteSchedule}
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
        recurringDays={recurringDays}
        setRecurringDays={setRecurringDays}
        recurringPeriodValue={recurringPeriodValue}
        setRecurringPeriodValue={setRecurringPeriodValue}
        recurringPeriodUnit={recurringPeriodUnit}
        setRecurringPeriodUnit={setRecurringPeriodUnit}
        recurringStartDate={recurringStartDate}
        setRecurringStartDate={setRecurringStartDate}
        recurringEndDate={recurringEndDate}
        setRecurringEndDate={setRecurringEndDate}
        onStartDateChange={handleStartDateChange}
        onPeriodValueChange={handlePeriodValueChange}
        onPeriodUnitChange={handlePeriodUnitChange}
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

      <EditClassModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateClass}
        onDelete={handleDeleteClass}
        cohorts={cohorts}
        classId={editingClass?.id || ''}
        classTitle={editTitle}
        setClassTitle={setEditTitle}
        classTopic={editTopic}
        setClassTopic={setEditTopic}
        classCohortId={editCohortId}
        setClassCohortId={setEditCohortId}
        classScheduledDate={editScheduledDate}
        setClassScheduledDate={setEditScheduledDate}
        classStartTime={editStartTime}
        setClassStartTime={setEditStartTime}
        classEndTime={editEndTime}
        setClassEndTime={setEditEndTime}
        classMeetLink={editMeetLink}
        setClassMeetLink={setEditMeetLink}
        classStatus={editStatus}
        setClassStatus={setEditStatus}
        isSubmitting={isSubmitting}
      />

      <EditScheduleModal
        isOpen={isEditScheduleModalOpen}
        onClose={() => setIsEditScheduleModalOpen(false)}
        onSubmit={handleUpdateSchedule}
        onDelete={handleDeleteSchedule}
        cohorts={cohorts}
        schedule={editingSchedule}
        title={editScheduleTitle}
        setTitle={setEditScheduleTitle}
        topic={editScheduleTopic}
        setTopic={setEditScheduleTopic}
        cohortId={editScheduleCohortId}
        setCohortId={setEditScheduleCohortId}
        startTime={editScheduleStartTime}
        setStartTime={setEditScheduleStartTime}
        endTime={editScheduleEndTime}
        setEndTime={setEditScheduleEndTime}
        meetLink={editScheduleMeetLink}
        setMeetLink={setEditScheduleMeetLink}
        notes={editScheduleNotes}
        setNotes={setEditScheduleNotes}
        isSubmitting={isSubmitting}
      />

      <ClassDetailModal
        selectedClass={selectedClass}
        onClose={() => setSelectedClass(null)}
        onAction={handleClassAction}
        onEdit={(cls) => {
          setSelectedClass(null);
          handleOpenEditModal(cls);
        }}
        onDelete={handleDeleteClass}
      />
    </div>
  );
};

export default AdminSchedulesPage;

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
  EditClassModal,
  EditScheduleModal,
} from '../../features/live-classes';

export const AdminLiveClassesPage: React.FC = () => {
  const {
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
    handleCreateCohort,
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
          schedules={schedules}
          onClassAction={handleClassAction}
          onEditClass={handleOpenEditModal}
          onDeleteClass={handleDeleteClass}
          onEditSchedule={handleOpenEditSchedule}
          onDeleteSchedule={handleDeleteSchedule}
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

export default AdminLiveClassesPage;

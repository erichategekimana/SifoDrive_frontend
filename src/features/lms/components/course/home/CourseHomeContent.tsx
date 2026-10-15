import React from 'react';
import type { Course } from '../../../../../core/models/Course';
import { RenderCourseHomepage } from './RenderCourseHomepage';
import { DefaultHomeSyllabus } from './DefaultHomeSyllabus';

export interface CourseHomeContentProps {
  course: Course;
  onNavigateTab: (tab: any, targetId?: string) => void;
  onOpenLesson?: (lessonId: string) => void;
}

export const CourseHomeContent: React.FC<CourseHomeContentProps> = ({
  course,
  onNavigateTab,
  onOpenLesson,
}) => {
  const homeData = course.homepageData || (course as any).homepage_data;

  if (homeData?.blocks && homeData.blocks.length > 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <h1
          style={{
            fontSize: '2.35rem',
            fontWeight: 700,
            color: '#133873',
            margin: '0 0 20px 0',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
          }}
        >
          {course.title}
        </h1>
        <RenderCourseHomepage
          course={course}
          homepageData={homeData}
          onNavigateTab={onNavigateTab}
          onOpenLesson={onOpenLesson}
          isPreview={false}
        />
      </div>
    );
  }

  return (
    <DefaultHomeSyllabus
      course={course}
      onNavigateTab={onNavigateTab}
    />
  );
};

export default CourseHomeContent;

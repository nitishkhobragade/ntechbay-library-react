import React from 'react';
import { CourseType } from '../types';
import { COURSES } from '../data/mockResources';

interface CourseSelectorProps {
  selectedCourse: CourseType;
  onSelectCourse: (course: CourseType) => void;
}

export const CourseSelector: React.FC<CourseSelectorProps> = ({
  selectedCourse,
  onSelectCourse,
}) => {
  return (
    <div className="w-full flex justify-center items-center">
      {/* Centered container with a light background and rounded-full pill design */}
      <div
        id="course-category-container"
        className="bg-slate-200 p-1.5 rounded-full flex flex-wrap sm:flex-nowrap gap-1 shadow-inner max-w-2xl justify-center"
      >
        {COURSES.map((course) => {
          const isActive = selectedCourse === course;
          return (
            <button
              key={course}
              id={`course-tab-${course.toLowerCase().replace('.', '')}`}
              type="button"
              onClick={() => onSelectCourse(course)}
              className={`px-5 sm:px-6 py-2 rounded-full font-medium text-sm transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/60'
              }`}
            >
              {course}
            </button>
          );
        })}
      </div>
    </div>
  );
};

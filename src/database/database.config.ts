import mongoose from 'mongoose';
import {
  AcademicYear,
  AcademicYearSchema,
} from 'src/obe/academicYear/schemas/academicYear.schema';
import { Course, CourseSchema } from 'src/obe/course/schemas/course.schema';
import {
  CourseManagement,
  CourseManagementSchema,
} from 'src/obe/courseManagement/schemas/courseManagement.schema';
import { Faculty, FacultySchema } from 'src/obe/faculty/schemas/faculty.schema';
import {
  LogEvent,
  LogEventSchema,
} from 'src/obe/logEvent/schemas/logEvent.schema';
import { PLO, PLOSchema } from 'src/obe/plo/schemas/plo.schema';
import { Section, SectionSchema } from 'src/obe/section/schemas/section.schema';
import { TQF3, TQF3Schema } from 'src/obe/tqf3/schemas/tqf3.schema';
import { TQF5, TQF5Schema } from 'src/obe/tqf5/schemas/tqf5.schema';
import { User, UserSchema } from 'src/obe/user/schemas/user.schema';

export const registerModels = () => {
  mongoose.model(User.name, UserSchema);
  mongoose.model(Faculty.name, FacultySchema);
  mongoose.model(LogEvent.name, LogEventSchema);
  mongoose.model(AcademicYear.name, AcademicYearSchema);
  mongoose.model(PLO.name, PLOSchema);
  mongoose.model(CourseManagement.name, CourseManagementSchema);
  mongoose.model(Course.name, CourseSchema);
  mongoose.model(Section.name, SectionSchema);
  mongoose.model(TQF3.name, TQF3Schema);
  mongoose.model(TQF5.name, TQF5Schema);
};

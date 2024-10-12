// export enum LOG_EVENT_TYPE {
//   FILE = 'File',
//   COURSE_MANAGEMENT = 'Course Management',
//   ASSIGNMENT = 'Assignment',
//   SCORE = 'Score',
//   CO_INS = 'Co-Instructor',
//   TQF = 'TQF',
//   ADMIN = 'Admin',
// }

export enum COURSE_TYPE {
  GENERAL = 'General Education',
  SPECIAL = 'Field of Specialization',
  SEL_TOPIC = 'Selected Topics',
  FREE = 'Free Elective',
}

export enum TEACHING_METHOD {
  LEC = 'Lecture',
  LAB = 'Laboratory',
  PRAC = 'Practice',
  COOP = 'Co-operative',
}

export enum EVALUATE_TYPE {
  A_F = 'A-F',
  S_U = 'S/U',
  P = 'P',
}

export enum TQF_TYPE {
  TQF3 = 'TQF3',
  TQF5 = 'TQF5',
}

export enum TQF_STATUS {
  NO_DATA = 'No Data',
  IN_PROGRESS = 'In Progress',
  DONE = 'Done',
}

export enum OWNER_REF {
  COURSE = 'Course',
  SECTION = 'Section',
}

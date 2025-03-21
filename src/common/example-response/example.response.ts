import { PLO } from 'src/obe/plo/schemas/plo.schema';
import { ROLE } from '../enum/role.enum';

export const exampleAcademicYearList = [
  {
      "year": 2567,
      "semester": 2,
      "isActive": true,
      "id": "xxxxxxxxxxxxxxxx810e"
  },
  {
      "year": 2567,
      "semester": 1,
      "isActive": false,
      "id": "xxxxxxxxxxxxxxxxa45c"
  }
]

export const exampleStudent = {
  id: 'xxxxxxxxxxxxxxxx34cc',
  studentId: '640610xxx',
  firstNameTH: 'พัชรินทร์',
  lastNameTH: 'ทวีสุข',
  firstNameEN: 'Patcharin',
  lastNameEN: 'Taveesuk',
  email: 'patcharin_t@cmu.ac.th',
  facultyCode: '06',
  role: ROLE.STUDENT,
  termsOfService: true,
  enrollCourses: [
    {
      year: 2567,
      semester: 1,
      courses: [
        {
          course: 'xxxxxxxxxxxxxxxx4438',
          section: 3,
        },
      ],
    },
    {
      year: 2567,
      semester: 2,
      courses: [
        {
          course: 'xxxxxxxxxxxxxxxxc948',
          section: 1,
        },
        {
          course: 'xxxxxxxxxxxxxxxx2d70',
          section: 8,
        },
      ],
    },
  ],
};

export const exampleInstructor = {
  id: 'xxxxxxxxxxxxxxxx34cd',
  firstNameTH: 'สมชาย',
  lastNameTH: 'ใจดี',
  firstNameEN: 'Somchai',
  lastNameEN: 'Jaidee',
  email: 'somchai_j@cmu.ac.th',
  facultyCode: '06',
  role: ROLE.INSTRUCTOR,
  termsOfService: true,
};

export const exampleCurriculumAdmin = {
  id: 'xxxxxxxxxxxxxxxx34ce',
  firstNameTH: 'มานะ',
  lastNameTH: 'ปิติ',
  firstNameEN: 'Mana',
  lastNameEN: 'Piti',
  email: 'mana_p@cmu.ac.th',
  facultyCode: '06',
  role: ROLE.CURRICULUM_ADMIN,
  curriculums: ['CPE-2563', 'ISNE-2566'],
  termsOfService: true,
};

export const exampleAdmin = {
  id: 'xxxxxxxxxxxxxxxx34cf',
  firstNameTH: 'วิชาญ',
  lastNameTH: 'ทวีผล',
  firstNameEN: 'Wichan',
  lastNameEN: 'Thaveepol',
  email: 'wichan_t@cmu.ac.th',
  facultyCode: '06',
  role: ROLE.ADMIN,
  termsOfService: true,
};

export const exampleInstructorList = [
  exampleInstructor,
  exampleCurriculumAdmin,
  exampleAdmin,
];

const exampleEnrollCourse = {
  id: 'xxxxxxxxxxxxxxxx2d70',
  year: 2567,
  semester: 2,
  courseNo: '261999',
  courseName: 'Course CPE Mock',
  type: 'General Education',
  curriculum: 'CPE-2563',
  section: {
    sectionNo: 640,
    curriculum: 'CPE-2563',
    instructor: {
      firstNameTH: 'เทส',
      lastNameTH: 'เทส',
      firstNameEN: 'Test',
      lastNameEN: 'Test',
      email: 'test_t@cmu.ac.th',
      id: 'xxxxxxxxxxxxxxxx34cf',
    },
    coInstructors: [],
    id: 'xxxxxxxxxxxxxxxx2d76',
    assignments: [
      {
        name: 'Midterm',
        isPublish: true,
        weight: 1,
        questions: [
          {
            name: '1',
            desc: 'Security',
            fullScore: 2,
            scores: [0.5, 1, 1.5, 1.5, 2],
          },
          {
            name: '2',
            desc: 'Page Replacement',
            fullScore: 5,
            scores: [3, 3, 4.5, 5, 5],
          },
        ],
        createdAt: '2025-01-12T08:50:37.239Z',
        scores: [4.5, 5, 5.5, 6, 6],
      },
    ],
  },
  scores: [
    {
      assignmentName: 'Midterm',
      questions: [
        { name: '1', score: 2 },
        { name: '2', score: 3 },
      ],
    },
  ],
  clos: [
    {
      clo: {
        no: 1,
        descTH: 'CLO 1',
        descEN: 'CLO 1',
        learningMethod: ['บรรยาย (Lecture)'],
        id: 'xxxxxxxxxxxxxxxx6f73',
      },
      score: 4,
    },
    {
      clo: {
        no: 2,
        descTH: 'CLO 2',
        descEN: 'CLO 2',
        learningMethod: ['บรรยาย (Lecture)'],
        id: 'xxxxxxxxxxxxxxxx6f74',
      },
      score: 3,
    },
  ],
  plo: PLO,
  plos: [
    {
      no: 1,
      descTH: 'PLO 1',
      descEN: 'PLO 1',
      id: 'xxxxxxxxxxxxxxxx6b4d',
      name: 'PLO 1',
      score: 2,
    },
    {
      no: 2,
      descTH: 'PLO 2',
      descEN: 'PLO 2',
      id: 'xxxxxxxxxxxxxxxx6b4e',
      name: 'PLO 2',
      score: 0,
      notMap: true,
    },
    {
      no: 3,
      descTH: 'PLO 3',
      descEN: 'PLO 3',
      id: 'xxxxxxxxxxxxxxxx6b4f',
      name: 'PLO 3',
      score: 3,
    },
  ],
  requirePlo: ['xxxxxxxxxxxxxxxx6b4e', 'xxxxxxxxxxxxxxxx6b4f'],
};

export const exampleEnrollCourses = {
  year: 2567,
  semester: 2,
  courses: [{ course: exampleEnrollCourse }],
};

export const exampleAllEnrollCourses = {
  courses: [exampleEnrollCourse],
  curriculums: [
    {
      curriculum: 'CPE-2563',
      plo: PLO,
      plos: [
        {
          no: 1,
          descTH: 'PLO 1',
          descEN: 'PLO 1',
          id: 'xxxxxxxxxxxxxxxx6b4d',
          name: 'PLO 1',
          score: 2,
          courses: [
            {
              courseNo: '261999',
              courseName: 'Course CPE Mock',
            },
          ],
        },
        {
          no: 2,
          descTH: 'PLO 2',
          descEN: 'PLO 2',
          id: 'xxxxxxxxxxxxxxxx6b4e',
          name: 'PLO 2',
          score: 0,
          courses: [],
        },
        {
          no: 3,
          descTH: 'PLO 3',
          descEN: 'PLO 3',
          id: 'xxxxxxxxxxxxxxxx6b4f',
          name: 'PLO 3',
          score: 3,
          courses: [
            {
              courseNo: '261999',
              courseName: 'Course CPE Mock',
            },
          ],
        },
      ],
    },
  ],
};

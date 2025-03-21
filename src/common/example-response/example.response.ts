import { ROLE } from '../enum/role.enum';

export const exampleEnrollCourses = [
  {
    course: {
      id: 'xxxxxxxxxxxxxxx2d70',
      year: 2567,
      semester: 2,
      courseNo: '261999',
      courseName: 'Course CPE Mock',
      type: 'General Education',
      curriculum: 'CPE-2563',
      section: {
        sectionNo: 640,
        curriculum: 'CPE-2563',
        addFirstTime: true,
        instructor: {
          firstNameTH: 'เทส',
          lastNameTH: 'เทส',
          firstNameEN: 'Test',
          lastNameEN: 'Test',
          email: 'test_t@cmu.ac.th',
          id: 'xxxxxxxxxxxxxxxxxxxxxxxx',
        },
        coInstructors: [],
        id: 'xxxxxxxxxxxxxxx2d76',
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
            id: 'xxxxxxxxxxxxxxx6f73',
          },
          score: 4,
        },
        {
          clo: {
            no: 2,
            descTH: 'CLO 2',
            descEN: 'CLO 2',
            learningMethod: ['บรรยาย (Lecture)'],
            id: 'xxxxxxxxxxxxxxx6f74',
          },
          score: 3,
        },
      ],
      plo: {
        name: 'PLO 1/67',
        facultyCode: '06',
        criteriaEN: 'ABET Criteria',
        criteriaTH: 'เกณฑ์ของ ABET',
        data: [
          {
            no: 1,
            descTH: 'PLO 1',
            descEN: 'PLO 1',
            id: 'xxxxxxxxxxxxxxx6b4d',
          },
          {
            no: 2,
            descTH: 'PLO 2',
            descEN: 'PLO 2',
            id: 'xxxxxxxxxxxxxxx6b4e',
          },
          {
            no: 3,
            descTH: 'PLO 3',
            descEN: 'PLO 3',
            id: 'xxxxxxxxxxxxxxx6b4f',
          },
        ],
        curriculum: ['CPE-2563'],
        id: 'xxxxxxxxxxxxxxxbde6',
      },
      plos: [
        {
          no: 1,
          descTH: 'PLO 1',
          descEN: 'PLO 1',
          id: 'xxxxxxxxxxxxxxx6b4d',
        },
        {
          no: 2,
          descTH: 'PLO 2',
          descEN: 'PLO 2',
          id: 'xxxxxxxxxxxxxxx6b4e',
        },
        {
          no: 3,
          descTH: 'PLO 3',
          descEN: 'PLO 3',
          id: 'xxxxxxxxxxxxxxx6b4f',
        },
      ],
      requirePlo: ['xxxxxxxxxxxxxxx6b4e', 'xxxxxxxxxxxxxxx6b4f'],
    },
    section: 1,
  },
];

export const exampleStudent = {
  id: 'xxxxxxxxxxxxxxxx34cd',
  studentId: '640610xxx',
  firstNameTH: 'สมชาย',
  lastNameTH: 'ใจดี',
  firstNameEN: 'Somchai',
  lastNameEN: 'Jaidee',
  email: 'somchai_j@cmu.ac.th',
  facultyCode: '06',
  role: ROLE.STUDENT,
  termsOfService: true,
  enrollCourses: exampleEnrollCourses,
};

export const exampleCurriculumAdmin = {
  id: 'xxxxxxxxxxxxxxxx34ce',
  firstNameTH: 'สมชาย',
  lastNameTH: 'ใจดี',
  firstNameEN: 'Somchai',
  lastNameEN: 'Jaidee',
  email: 'somchai_j@cmu.ac.th',
  facultyCode: '06',
  role: ROLE.CURRICULUM_ADMIN,
  curriculums: ['CPE-2563', 'ISNE-2566'],
  termsOfService: true,
};

export const exampleAdmin = {
  id: 'xxxxxxxxxxxxxxxx34cf',
  firstNameTH: 'เทส',
  lastNameTH: 'เทส',
  firstNameEN: 'Test',
  lastNameEN: 'Test',
  email: 'test_t@cmu.ac.th',
  facultyCode: '06',
  role: ROLE.ADMIN,
  termsOfService: true,
};

export const exampleInstructorList = [
  {
    id: 'xxxxxxxxxxxxxxxxx34ce',
    firstNameTH: 'สมชาย',
    lastNameTH: 'ใจดี',
    firstNameEN: 'Somchai',
    lastNameEN: 'Jaidee',
    email: 'somchai_j@cmu.ac.th',
    facultyCode: '06',
    role: ROLE.CURRICULUM_ADMIN,
    curriculums: ['CPE-2563', 'ISNE-2566'],
    termsOfService: true,
  },
  {
    id: 'xxxxxxxxxxxxxxxxx34ce',
    firstNameTH: 'เทส',
    lastNameTH: 'เทส',
    firstNameEN: 'Test',
    lastNameEN: 'Test',
    email: 'test_t@cmu.ac.th',
    facultyCode: '06',
    role: ROLE.ADMIN,
    termsOfService: true,
  },
];

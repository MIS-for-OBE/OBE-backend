import { PLO } from 'src/obe/plo/schemas/plo.schema';
import { ROLE } from '../enum/role.enum';

export const exampleAcademicYearList = [
  {
    year: 2567,
    semester: 2,
    isActive: true,
    id: 'xxxxxxxxxxxxxxxx810e',
  },
  {
    year: 2567,
    semester: 1,
    isActive: false,
    id: 'xxxxxxxxxxxxxxxxa45c',
  },
];

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

export const exampleCourseReuseTQF3 = [
  {
    courseNo: '261336',
    courseName: 'Computer Network Laboratory',
    type: 'Field of Specialization',
    sections: [
      {
        sectionNo: 1,
        instructor: 'xxxxxxxxxxxxxxxx34ce',
        coInstructors: ['xxxxxxxxxxxxxxxx34d5', 'xxxxxxxxxxxxxxxx5366'],
        isActive: true,
        students: [],
        assignments: [],
        id: 'xxxxxxxxxxxxxxxxfae7',
      },
      {
        sectionNo: 701,
        isActive: true,
        instructor: 'xxxxxxxxxxxxxxxx34ce',
        coInstructors: ['xxxxxxxxxxxxxxxx34d5', 'xxxxxxxxxxxxxxxx0b50'],
        students: [],
        assignments: [],
        id: 'xxxxxxxxxxxxxxxxa16d',
      },
      {
        sectionNo: 801,
        instructor: 'xxxxxxxxxxxxxxxx34ce',
        coInstructors: ['xxxxxxxxxxxxxxxx34d5', 'xxxxxxxxxxxxxxxx4180'],
        isActive: true,
        students: [],
        assignments: [],
        id: '66759f6a085c193c41dcfae8',
      },
    ],
    TQF3: {
      status: 'Done',
      id: 'xxxxxxxxxxxxxxxx2133',
    },
    semester: 1,
    year: 2567,
    id: 'xxxxxxxxxxxxxxxx6082',
  },
  {
    courseNo: '261999',
    courseName: 'test 11111',
    type: 'General Education',
    sections: [
      {
        sectionNo: 1,
        isActive: true,
        instructor: 'xxxxxxxxxxxxxxxx5366',
        coInstructors: ['xxxxxxxxxxxxxxxx0b50', 'xxxxxxxxxxxxxxxx4180'],
        students: [],
        assignments: [],
        id: 'xxxxxxxxxxxxxxxx4383',
      },
      {
        sectionNo: 4,
        isActive: true,
        instructor: 'xxxxxxxxxxxxxxxx0b50',
        coInstructors: ['xxxxxxxxxxxxxxxx34ce'],
        students: [],
        assignments: [],
        id: 'xxxxxxxxxxxxxxxxa8a1',
      },
    ],
    TQF3: {
      status: 'Done',
      id: 'xxxxxxxxxxxxxxxx492d',
    },
    semester: 1,
    year: 2567,
    id: 'xxxxxxxxxxxxxxxxa8a4',
  },
];

export const exampleTqf3P1 = {
  curriculum: 'สำหรับหลายหลักสูตร',
  courseType: ['General Education'],
  studentYear: [3, 4, 5, 6],
  mainInstructor: 'สมชาย ใจดี',
  instructors: ['สมชาย ใจดี', 'มานะ ปิติ'],
  teachingLocation: { in: '' },
  consultHoursWk: 1,
  updatedAt: '2025-01-13T21:02:56.724Z',
};
export const exampleTqf3P2 = {
  teachingMethod: ['Lecture'],
  clo: [
    {
      no: 1,
      descTH: 'CLO 1',
      descEN: 'CLO 1',
      learningMethod: ['บรรยาย (Lecture)'],
      id: '67857fcc432717f4e5036f73',
    },
    {
      no: 2,
      descTH: 'CLO 2',
      descEN: 'CLO 2',
      learningMethod: ['บรรยาย (Lecture)'],
      id: '67857fcc432717f4e5036f74',
    },
    {
      no: 3,
      descTH: 'CLO 3',
      descEN: 'CLO 3',
      learningMethod: ['บรรยาย (Lecture)'],
      id: '67857fcc432717f4e5036f75',
    },
    {
      no: 4,
      descTH: 'CLO 4',
      descEN: 'CLO 4',
      learningMethod: ['บรรยาย (Lecture)'],
      id: '67857fcc432717f4e5036f76',
    },
  ],
  schedule: [
    {
      weekNo: 1,
      topic: 'content 1',
      lecHour: 3,
      labHour: 0,
      id: '67c8230842bec769db7da62c',
    },
    {
      weekNo: 2,
      topic: 'content 2',
      lecHour: 3,
      labHour: 0,
      id: '67c8230842bec769db7da62d',
    },
    {
      weekNo: 3,
      topic: 'content 3',
      lecHour: 3,
      labHour: 0,
      id: '67c8230842bec769db7da62e',
    },
    {
      weekNo: 4,
      topic: 'content 4',
      lecHour: 3,
      labHour: 0,
      id: '67c8230842bec769db7da62f',
    },
    {
      weekNo: 5,
      topic: 'content 5',
      lecHour: 3,
      labHour: 0,
      id: '67c8230842bec769db7da630',
    },
  ],
  evaluate: 'A-F',
  updatedAt: '2025-03-05T10:10:16.032Z',
};
export const exampleTqf3P3 = {
  eval: [
    {
      no: 1,
      topicTH: 'สอบกาลางภาค',
      topicEN: 'midterm',
      desc: '',
      percent: 50,
      id: '67858041432717f4e5036f83',
    },
    {
      no: 2,
      topicTH: 'สอบปลายภาค',
      topicEN: 'final',
      desc: '',
      percent: 50,
      id: '67858041432717f4e5036f84',
    },
  ],
  gradingPolicy:
    'แบบอิงเกณฑ์และอิงกลุ่ม (Criterion and Norm-Referenced Grading)',
  updatedAt: '2025-01-13T21:10:52.569Z',
};
export const exampleTqf3P4 = {
  data: [
    {
      clo: '67857fcc432717f4e5036f73',
      percent: 20,
      evals: [
        {
          eval: '67858041432717f4e5036f84',
          evalWeek: ['1'],
          percent: 20,
          id: '67d6bf8f995077c787ad9add',
        },
      ],
    },
    {
      clo: '67857fcc432717f4e5036f74',
      percent: 15,
      evals: [
        {
          eval: '67858041432717f4e5036f83',
          evalWeek: ['1', '2'],
          percent: 15,
          id: '67d6bf8f995077c787ad9ade',
        },
      ],
    },
    {
      clo: '67857fcc432717f4e5036f75',
      percent: 40,
      evals: [
        {
          eval: '67858041432717f4e5036f84',
          evalWeek: ['3'],
          percent: 5,
          id: '67d6bf8f995077c787ad9adf',
        },
        {
          eval: '67858041432717f4e5036f83',
          evalWeek: ['3', '4'],
          percent: 35,
          id: '67d6bf8f995077c787ad9ae0',
        },
      ],
    },
    {
      clo: '67857fcc432717f4e5036f76',
      percent: 25,
      evals: [
        {
          eval: '67858041432717f4e5036f84',
          evalWeek: ['5'],
          percent: 25,
          id: '67d6bf8f995077c787ad9ae1',
        },
      ],
    },
  ],
  updatedAt: '2025-03-16T12:09:51.092Z',
};
export const exampleTqf3P5 = {
  mainRef: '',
  recDoc: '',
  updatedAt: '2025-01-13T21:07:13.706Z',
};
export const exampleTqf3P6 = {
  data: [
    {
      topic: 'กลยุทธ์การประเมินประสิทธิผลของกระบวนวิชาโดยนักศึกษา',
      detail: ['ไม่มี (None)'],
      other: '',
    },
    {
      topic: 'กลยุทธ์การประเมินการสอน',
      detail: ['ไม่มี (None)'],
      other: '',
    },
    {
      topic: 'กลไกการปรับปรับปรุงการสอบ',
      detail: ['ไม่มี (None)'],
      other: '',
    },
    {
      topic: 'กระบวนการทวนสอบมาตรฐานผลสัมฤทธิ์กระบวนวิชาของนักศึกษา',
      detail: ['ไม่มี (None)'],
      other: '',
    },
    {
      topic: 'การดำเนินการทบทวนและการวางแผนปรับปรุงประสิทธิผลของกระบวนวิชา',
      detail: ['ไม่มี (None)'],
      other: '',
    },
  ],
  updatedAt: '2025-01-13T21:07:26.742Z',
};
export const exampleTqf3P7 = {
  list: [
    {
      curriculum: 'CPE-2563',
      data: [
        {
          clo: '67857fcc432717f4e5036f73',
          plos: ['xxxxxxxxxxxxxxxx6b4e', 'xxxxxxxxxxxxxxxx6b50'],
        },
        {
          clo: '67857fcc432717f4e5036f74',
          plos: ['xxxxxxxxxxxxxxxx6b4f', 'xxxxxxxxxxxxxxxx6b53'],
        },
        {
          clo: '67857fcc432717f4e5036f75',
          plos: ['xxxxxxxxxxxxxxxx6b4e'],
        },
        {
          clo: '67857fcc432717f4e5036f76',
          plos: ['xxxxxxxxxxxxxxxx6b52'],
        },
      ],
    },
  ],
  updatedAt: '2025-03-05T10:10:41.909Z',
};

export const exampleTqf5P1 = {
  list: [
    {
      curriculum: null,
      courseEval: [
        {
          sectionNo: 1,
          A: 0,
          Bplus: 0,
          B: 0,
          Cplus: 0,
          C: 0,
          Dplus: 0,
          D: 0,
          F: 0,
          W: 0,
          S: 333,
          U: 0,
          P: 0,
        },
        {
          sectionNo: 2,
          A: 0,
          Bplus: 0,
          B: 0,
          Cplus: 0,
          C: 0,
          Dplus: 0,
          D: 0,
          F: 0,
          W: 0,
          S: 211,
          U: 0,
          P: 0,
        },
        {
          sectionNo: 3,
          A: 0,
          Bplus: 0,
          B: 0,
          Cplus: 0,
          C: 0,
          Dplus: 0,
          D: 0,
          F: 0,
          W: 0,
          S: 10,
          U: 0,
          P: 0,
        },
        {
          sectionNo: 801,
          A: 0,
          Bplus: 0,
          B: 0,
          Cplus: 0,
          C: 0,
          Dplus: 0,
          D: 0,
          F: 0,
          W: 0,
          S: 116,
          U: 0,
          P: 0,
        },
        {
          sectionNo: 802,
          A: 0,
          Bplus: 0,
          B: 0,
          Cplus: 0,
          C: 0,
          Dplus: 0,
          D: 0,
          F: 0,
          W: 0,
          S: 2,
          U: 0,
          P: 0,
        },
      ],
      gradingCriteria: {
        A: '',
        Bplus: '',
        B: '',
        Cplus: '',
        C: '',
        Dplus: '',
        D: '',
        F: '',
        W: '-',
        S: '64',
        U: '63.99',
      },
      abnormalScoreFactor: '',
      reviewingSLO: '',
    },
  ],
  updatedAt: '2025-03-16T04:13:26.579Z',
};
export const exampleAssignmentsMap = [
  {
    eval: 'Module 1: Skill Development through Experiences',
    assignment: ['Module1'],
  },
  {
    eval: 'Module 2: Shaping Your Professional Profile Through Continuous Learning',
    assignment: ['Module2'],
  },
  {
    eval: '03. Mapping Your Engineering Career Path  ',
    assignment: ['Module3'],
  },
];
export const exampleTqf5P2 = {
  data: [
    {
      clo: '67d589dd44027b2c162f37da',
      assignments: [
        {
          eval: '67d58a8f44027b2c162f37f1',
          questions: ['Module1-Module#1'],
        },
      ],
    },
    {
      clo: '67d589dd44027b2c162f37db',
      assignments: [
        {
          eval: '67d58a8f44027b2c162f37f2',
          questions: [
            'Module2-1',
            'Module2-2',
            'Module2-3',
            'Module2-4',
            'Module2-5',
            'Module2-6',
          ],
        },
      ],
    },
    {
      clo: '67d589dd44027b2c162f37dc',
      assignments: [
        {
          eval: '67d58a8f44027b2c162f37f3',
          questions: ['Module3-1'],
        },
      ],
    },
  ],
  updatedAt: '2025-03-16T05:05:28.225Z',
};
export const exampleTqf5P3 = {
  data: [
    {
      clo: '67d589dd44027b2c162f37da',
      assess: [
        {
          eval: '67d58a8f44027b2c162f37f1',
          sheet: ['Module1'],
          percent: 30,
          fullScore: 31,
          range0: 6.4,
          range1: 12,
          range2: 18,
          range3: 24,
          _id: '67de3da2b692599ecd9e0a1b',
        },
      ],
      sections: [
        {
          sectionNo: 1,
          score0: 87,
          score1: 162,
          score2: 59,
          score3: 18,
          score4: 7,
        },
        {
          sectionNo: 2,
          score0: 61,
          score1: 107,
          score2: 38,
          score3: 2,
          score4: 3,
        },
        {
          sectionNo: 3,
          score0: 10,
          score1: 0,
          score2: 0,
          score3: 0,
          score4: 0,
        },
        {
          sectionNo: 801,
          score0: 38,
          score1: 49,
          score2: 21,
          score3: 3,
          score4: 5,
        },
        {
          sectionNo: 802,
          score0: 2,
          score1: 0,
          score2: 0,
          score3: 0,
          score4: 0,
        },
      ],
      score: 1.02,
    },
    {
      clo: '67d589dd44027b2c162f37db',
      assess: [
        {
          eval: '67d58a8f44027b2c162f37f2',
          sheet: [
            'Module2',
            'Module2',
            'Module2',
            'Module2',
            'Module2',
            'Module2',
          ],
          percent: 40,
          fullScore: 32,
          range0: 6.4,
          range1: 12.8,
          range2: 19.200000000000003,
          range3: 25.6,
          _id: '67de3da2b692599ecd9e0a1c',
        },
      ],
      sections: [
        {
          sectionNo: 1,
          score0: 13,
          score1: 2,
          score2: 1,
          score3: 6,
          score4: 311,
        },
        {
          sectionNo: 2,
          score0: 15,
          score1: 0,
          score2: 0,
          score3: 6,
          score4: 190,
        },
        {
          sectionNo: 3,
          score0: 10,
          score1: 0,
          score2: 0,
          score3: 0,
          score4: 0,
        },
        {
          sectionNo: 801,
          score0: 2,
          score1: 3,
          score2: 2,
          score3: 7,
          score4: 102,
        },
        {
          sectionNo: 802,
          score0: 2,
          score1: 0,
          score2: 0,
          score3: 0,
          score4: 0,
        },
      ],
      score: 3.69,
    },
    {
      clo: '67d589dd44027b2c162f37dc',
      assess: [
        {
          eval: '67d58a8f44027b2c162f37f3',
          sheet: ['Module3'],
          percent: 30,
          fullScore: 30,
          range0: 6,
          range1: 12,
          range2: 18,
          range3: 24,
          _id: '67de3da2b692599ecd9e0a1d',
        },
      ],
      sections: [
        {
          sectionNo: 1,
          score0: 8,
          score1: 2,
          score2: 0,
          score3: 12,
          score4: 311,
        },
        {
          sectionNo: 2,
          score0: 10,
          score1: 3,
          score2: 0,
          score3: 13,
          score4: 185,
        },
        {
          sectionNo: 3,
          score0: 10,
          score1: 0,
          score2: 0,
          score3: 0,
          score4: 0,
        },
        {
          sectionNo: 801,
          score0: 1,
          score1: 2,
          score2: 0,
          score3: 7,
          score4: 106,
        },
        {
          sectionNo: 802,
          score0: 2,
          score1: 0,
          score2: 0,
          score3: 0,
          score4: 0,
        },
      ],
      score: 3.74,
    },
  ],
  updatedAt: '2025-03-22T04:33:38.349Z',
};

export const examplePLONo1 = {
  no: 1,
  descTH: 'คำอธิบายภาษาไทย',
  descEN: 'Description in English',
  id: 'xxxxxxxxxxxxxxxx6b4d',
};
export const examplePLONo2 = {
  no: 2,
  descTH: 'คำอธิบายภาษาไทย 2',
  descEN: 'Description in English 2',
  id: 'xxxxxxxxxxxxxxxx6b4e',
};
export const exampleDataPLO = [examplePLONo1, examplePLONo2];
export const exampleAddPlo = {
  name: 'PLO ISNE 1/67',
  facultyCode: '06',
  curriculum: ['ISNE-2566'],
  criteriaTH: 'เกณฑ์ภาษาไทย',
  criteriaEN: 'Criteria in English',
  data: exampleDataPLO,
  id: 'xxxxxxxxxxxxxxxxbde6',
};

export const exampleUploadScore = {
  year: 2567,
  semester: 2,
  course: 'xxxxxxxxxxxxxxxxd58f',
  sections: [
    {
      sectionNo: 1,
      students: [
        {
          student: 'xxxxxxxxxxxxxxxx6a80',
          studentId: 640610001,
          firstNameEN: 'พัชรินทร์',
          lastNameEN: 'ทวีสุข',
          scores: [
            {
              assignmentName: 'Final',
              questions: [
                { name: '1', score: 0.32 },
                { name: '2', score: 1.61 },
              ],
            },
          ],
        },
      ],
      assignments: [
        {
          name: 'Final',
          questions: [
            { name: '1', desc: 'Security', fullScore: 10 },
            { name: '2', fullScore: 5 },
          ],
        },
      ],
    },
  ],
};
const exampleAssign = (name: string, publish: boolean = false) => ({
  name: name,
  isPublish: publish,
  questions: [
    { name: '1', desc: 'Security', fullScore: 10 },
    { name: '2', fullScore: 5 },
  ],
  createdAt: '2025-03-22T07:20:00.285Z',
});
const exampleScore = (name: string, questions?: any[]) => ({
  assignmentName: name,
  questions: questions ?? [
    { name: '1', score: 0.32 },
    { name: '2', score: 1.61 },
  ],
});

export const exampleResUploadScore = (
  name: string,
  publish: boolean = false,
  del: boolean = false,
  questions?: any[],
) => [
  {
    sectionNo: 1,
    ...(!publish && {
      addFirstTime: true,
      isActive: true,
      instructor: 'xxxxxxxxxxxxxxxx5366',
      coInstructors: [],
      students: [
        {
          student: {
            id: 'xxxxxxxxxxxxxxxx34cc',
            studentId: '640610001',
            firstNameTH: 'พัชรินทร์',
            lastNameTH: 'ทวีสุข',
            firstNameEN: 'Patcharin',
            lastNameEN: 'Taveesuk',
            email: 'patcharin_t@cmu.ac.th',
          },
          scores: del ? [] : [exampleScore(name, questions)],
        },
      ],
    }),
    assignments: del ? [] : [exampleAssign(name, publish)],
    id: 'xxxxxxxxxxxxxxxx522a',
  },
];

export const exampleResSectionAssign = (
  name: string,
  publish: boolean = false,
  del: boolean = false,
  questions?: any[],
) => ({
  sections: exampleResUploadScore(name, publish, del, questions),
  id: 'xxxxxxxxxxxxxxxx6483',
});

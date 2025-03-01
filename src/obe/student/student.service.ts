import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course } from '../course/schemas/course.schema';
import { User } from '../user/schemas/user.schema';
import { EnrollCourseSearchDTO } from './dto/search.dto';
import { CLO, TQF3 } from '../tqf3/schemas/tqf3.schema';
import { TQF5 } from '../tqf5/schemas/tqf5.schema';
import { sortData } from 'src/common/function/function';
import { CourseManagement } from '../courseManagement/schemas/courseManagement.schema';
import { PLO } from '../plo/schemas/plo.schema';

@Injectable()
export class StudentService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    @InjectModel(CourseManagement.name)
    private readonly courseManagementModel: Model<CourseManagement>,
    @InjectModel(PLO.name) private readonly ploModel: Model<PLO>,
  ) {}

  async getEnrollCourses(
    authUser: any,
    searchDTO: EnrollCourseSearchDTO,
  ): Promise<any> {
    try {
      const enrollCourses = await this.userModel
        .findById(authUser.id)
        .select('enrollCourses')
        .populate({
          path: 'enrollCourses.courses.course',
          select: 'courseNo courseName type sections TQF3 TQF5',
          populate: [
            {
              path: 'sections',
              select:
                'sectionNo topic instructor coInstructors assignments students',
              populate: [
                {
                  path: 'instructor',
                  select: 'firstNameEN lastNameEN firstNameTH lastNameTH email',
                },
                {
                  path: 'coInstructors',
                  select: 'firstNameEN lastNameEN firstNameTH lastNameTH email',
                },
                { path: 'TQF3' },
                { path: 'TQF5' },
              ],
            },
            { path: 'TQF3' },
            { path: 'TQF5' },
          ],
        });
      const selectTerm = enrollCourses.enrollCourses?.find(
        (term) =>
          term.year == searchDTO.year && term.semester == searchDTO.semester,
      )?.courses;

      const ploRequire = await this.courseManagementModel
        .find({
          courseNo: { $in: selectTerm?.map(({ course }) => course.courseNo) },
        })
        .select(
          'courseNo ploRequire sections.sectionNo sections.topic sections.ploRequire',
        )
        .lean();
      const ploRequireMap = new Map(
        ploRequire.map((item) => [
          item.courseNo,
          {
            ploRequire:
              item.ploRequire ??
              item.sections.find(
                ({ sectionNo }) =>
                  sectionNo ==
                  selectTerm.find(
                    ({ course }) => course.courseNo == item.courseNo,
                  ).section,
              ).ploRequire,
          },
        ]),
      );
      const ploList = await this.ploModel.find();

      const formattedCourses = selectTerm?.map((item: any) => {
        const { course } = item;
        const { sections } = course;
        const sectionData = sections?.find(
          ({ sectionNo }) => sectionNo === item.section,
        )?._doc;

        if (!sectionData) {
          return {
            id: course.id,
            courseNo: course.courseNo,
            courseName: course.courseName,
            type: course.type,
            scores: [],
          };
        }

        let tqf3: TQF3 = course.TQF3;
        let tqf5: TQF5 = course.TQF5;

        const {
          assignments,
          students,
          _id,
          isActive,
          TQF3,
          TQF5,
          ...restSectionData
        } = sectionData;

        if (TQF3) {
          tqf3 = TQF3;
        }
        if (TQF5) {
          tqf5 = TQF5;
        }

        const allStudents = sections.map((sec) => sec.students).flat();
        const section = {
          ...restSectionData,
          id: _id,
          assignments: this.formatAssignments(assignments, allStudents),
        };

        const assignmentPublish = section.assignments.map(({ name }) => name);
        const userScores =
          students
            .find(({ student }) => student == authUser.id)
            ?.scores.filter(({ assignmentName }) =>
              assignmentPublish.includes(assignmentName),
            ) || [];

        const coursePloRequire = ploRequireMap.get(course.courseNo).ploRequire;
        let plo = {};
        const plos = [];
        const clos = [];
        tqf3.part4?.data.forEach((item) => {
          const clo: any =
            tqf3.part2.clo.find((c: any) => c.id == item.clo) ?? {};
          const score = this.calCloStudentScore(
            tqf5.part2?.data.find((e: any) => e.clo == clo.id) || {},
            userScores,
            tqf5.part3?.data.find((itemA) => itemA.clo == clo.id)?.assess || [],
          );
          clos.push({ clo, score });
        });
        // tqf3.part7?.list
        //   .find(({ curriculum }) => curriculum == section.curriculum)
        //   ?.data.forEach(() => {
        //     //   const clos = tqf3.part7?.list
        //     //   ?.find((e) => e.curriculum == curriculum)
        //     //   ?.data.filter(({ plos }) => (plos as string[]).includes(plo))
        //     //   .map(({ clo }) => clo);
        //     // const sum = clos?.length
        //     //   ? tqf5.part3?.data
        //     //       .filter(({ clo }) => clos?.includes(clo))
        //     //       .reduce((a, b) => a + b.score, 0)
        //     //   : undefined;
        //     // return sum ? (sum / (clos?.length ?? 1)).toFixed(2) : dash ? "-" : "N/A";
        //   });

        return {
          id: course.id,
          courseNo: course.courseNo,
          courseName: course.courseName,
          type: course.type,
          section,
          scores: userScores,
          clos,
          plo,
          plos,
        };
      });

      const data = {
        year: searchDTO.year,
        semester: searchDTO.semester,
        courses: formattedCourses || [],
      };

      return data;
    } catch (error) {
      throw error;
    }
  }

  private formatAssignments(assignments, students) {
    return assignments
      .filter((assignment) => assignment.isPublish)
      .map((assignment) => {
        const assignmentScores: number[] = [];
        const questions = assignment.questions.map((question) => {
          const questionScores = students
            .map((student) => {
              const scores =
                student.scores.find(
                  (scoreItem) => scoreItem.assignmentName === assignment.name,
                )?.questions || [];
              return scores.find((q) => q.name === question.name)?.score;
            })
            .filter((score) => score >= 0 && score !== undefined);
          questionScores.sort((a, b) => a - b);
          return {
            ...question._doc,
            scores: questionScores,
          };
        });
        students.forEach((student) => {
          const totalScore = student.scores
            .find((scoreItem) => scoreItem.assignmentName === assignment.name)
            ?.questions.filter(({ score }) => score >= 0)
            .reduce((sum, { score }) => sum + score, 0);
          if (totalScore != undefined) {
            assignmentScores.push(totalScore);
          }
        });
        assignmentScores.sort((a, b) => a - b);
        return {
          ...assignment._doc,
          scores: assignmentScores,
          questions,
        };
      });
  }

  private calCloStudentScore(tqf5Part2: any, scores: any[], assess: any[]) {
    const assigns = scores
      .filter(({ assignmentName }) =>
        tqf5Part2?.assignments.map((e) =>
          e.questions
            .flatMap((s) => s.substring(0, s.lastIndexOf('-')))
            .includes(assignmentName),
        ),
      )
      .flatMap((e) =>
        e.questions.map((question) => ({
          sheet: e.assignmentName,
          ...question._doc,
        })),
      )
      .filter((e) =>
        tqf5Part2?.assignments
          .flatMap((s) => s.questions)
          .includes(`${e.sheet}-${e.name}`),
      );
    console.log('assigns === ', assigns);

    const cloScores: { score: number; percent: number }[] = [];
    assess.forEach((e) => {
      const score = assigns
        .filter((as) => e.sheet.includes(as.sheet))
        .reduce((a, b) => a + b.score, 0);
      if (0 <= score && score < e.range0) {
        cloScores.push({ score: 0, percent: e.percent! });
      } else if (e.range0 <= score && score <= e.range1) {
        cloScores.push({ score: 1, percent: e.percent! });
      } else if (e.range1 < score && score <= e.range2) {
        cloScores.push({ score: 2, percent: e.percent! });
      } else if (e.range2 < score && score <= e.range3) {
        cloScores.push({ score: 3, percent: e.percent! });
      } else {
        cloScores.push({ score: 4, percent: e.percent! });
      }
    });
    const avgCloScore =
      cloScores.reduce((a: number, b) => a + b.score * b.percent, 0) /
      cloScores.reduce((a: number, b) => a + b.percent, 0);
    if (0 <= avgCloScore && avgCloScore < 1) return 0;
    else if (1 <= avgCloScore && avgCloScore < 2) return 1;
    else if (2 <= avgCloScore && avgCloScore < 3) return 2;
    else if (3 <= avgCloScore && avgCloScore < 4) return 3;
    else if (4 <= avgCloScore) return 4;
    else return '-';
  }
}

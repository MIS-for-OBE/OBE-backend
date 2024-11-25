import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course } from '../course/schemas/course.schema';
import { User } from '../user/schemas/user.schema';
import { EnrollCourseSearchDTO } from './dto/search.dto';
import { TQF3 } from '../tqf3/schemas/tqf3.schema';
import { TQF5 } from '../tqf5/schemas/tqf5.schema';
import { sortData } from 'src/common/function/function';

@Injectable()
export class StudentService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
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

        const clos = [];
        tqf3.part4?.data.forEach((item) => {
          const clo: any =
            tqf3.part2.clo.find((c: any) => c.id == item.clo) ?? {};
          const evals = [];
          item.evals.forEach((itemE) => {
            const evalItem = tqf3.part3.eval.find(
              (e: any) => e.id == itemE.eval,
            );
            if (evalItem) {
              evals.push(evalItem);
            }
          });
          sortData(evals, 'no');
          const plos = tqf3.part7?.data.find((c) => c.clo == clo.id)?.plos;
          clos.push({ clo, evals, plos });
        });

        const section = {
          ...restSectionData,
          id: _id,
          assignments: this.formatAssignments(assignments, students),
        };

        const assignmentPublish = section.assignments.map(({ name }) => name);
        const userScores =
          students
            .find(({ student }) => student == authUser.id)
            ?.scores.filter(({ assignmentName }) =>
              assignmentPublish.includes(assignmentName),
            ) || [];

        return {
          id: course.id,
          courseNo: course.courseNo,
          courseName: course.courseName,
          type: course.type,
          section,
          scores: userScores,
          clos,
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
          const questionScores = students.map((student) => {
            const scores =
              student.scores.find(
                (scoreItem) => scoreItem.assignmentName === assignment.name,
              )?.questions || [];
            return scores.find((q) => q.name === question.name)?.score || 0;
          });
          questionScores.sort((a, b) => a - b);
          return {
            ...question._doc,
            scores: questionScores,
          };
        });
        students.forEach((student) => {
          const totalScore = student.scores
            .find((scoreItem) => scoreItem.assignmentName === assignment.name)
            ?.questions.reduce((sum, { score }) => sum + score, 0);
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
}

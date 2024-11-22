import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course } from '../course/schemas/course.schema';
import { User } from '../user/schemas/user.schema';
import { EnrollCourseSearchDTO } from './dto/search.dto';

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
          select: 'courseNo courseName type sections',
          populate: {
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
            ],
          },
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

        const {
          assignments,
          students,
          _id,
          isActive,
          TQF3,
          TQF5,
          ...restSectionData
        } = sectionData;

        const section = {
          ...restSectionData,
          id: _id,
          assignments: this.formatAssignments(assignments, students),
        };

        const userScores =
          students.find(({ student }) => student === authUser.id)?.scores || [];

        return {
          id: course.id,
          courseNo: course.courseNo,
          courseName: course.courseName,
          type: course.type,
          section,
          scores: userScores,
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
    return assignments.map((assignment) => {
      const assignmentScores: number[] = [];
      const questions = assignment.questions.map((question) => {
        const questionScores = students.map((student) => {
          const scores =
            student.scores.find(
              (scoreItem) => scoreItem.assignmentName === assignment.name,
            )?.questions || [];
          return scores.find((q) => q.name === question.name)?.score || 0;
        });

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

      return {
        ...assignment._doc,
        scores: assignmentScores,
        questions,
      };
    });
  }
}

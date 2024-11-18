import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, Section } from '../course/schemas/course.schema';
import { User } from '../user/schemas/user.schema';
import { TQF3 } from '../tqf3/schemas/tqf3.schema';
import { TQF5 } from '../tqf5/schemas/tqf5.schema';
import { ROLE } from 'src/common/enum/role.enum';

@Injectable()
export class ScoreService {
  constructor(
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(TQF3.name) private readonly tqf3Model: Model<TQF3>,
    @InjectModel(TQF5.name) private readonly tqf5Model: Model<TQF5>,
  ) {}

  async uploadScore(requestDTO: any): Promise<any> {
    try {
      const { year, semester, course, sections } = requestDTO;
      let updateCourse = await this.courseModel.findById(course);
      const updatePromises = sections.map(async (section: any) => {
        for (const student of section.students) {
          let existsUser = await this.userModel.findOne({
            studentId: student.studentId,
          });
          if (!existsUser) {
            existsUser = await this.userModel.create({
              ...student,
              role: ROLE.STUDENT,
              enrollCourses: [
                {
                  year,
                  semester,
                  courses: [{ course, section: section.sectionNo }],
                },
              ],
            });
          } else {
            if (!existsUser.email && student.email?.includes('@cmu.ac.th')) {
              existsUser.email = student.email;
            }
            if (!existsUser.firstNameEN && student.firstNameEN) {
              existsUser.firstNameEN = student.firstNameEN;
              existsUser.lastNameEN = student.lastNameEN;
            }
            const existsTerm = existsUser.enrollCourses.find(
              (item) => item.year == year && item.semester == semester,
            );
            if (existsTerm) {
              const existsCourse = existsTerm.courses.find(
                (item) => item.course == course,
              );
              if (existsCourse) {
                existsCourse.section = section.sectionNo;
              } else {
                existsTerm.courses.push({
                  course,
                  section: section.sectionNo,
                });
              }
            } else {
              existsUser.enrollCourses.push({
                year,
                semester,
                courses: [{ course, section: section.sectionNo }],
              });
            }
            await existsUser.save();
          }
          if (!student.student) {
            student.student = existsUser.id;
          }
        }
        const courseSection = updateCourse.sections.find(
          (sec) => sec.sectionNo == section.sectionNo,
        );
        if (courseSection) {
          courseSection.students = section.students.map((student) => {
            const existStd = courseSection.students.find(
              (std) => student.student == std.student,
            ) || { scores: [] };
            student.scores.forEach((score) => {
              const existsAssignIndex = existStd.scores.findIndex(
                ({ assignmentName }) => assignmentName === score.assignmentName,
              );
              if (existsAssignIndex > -1) {
                existStd.scores[existsAssignIndex] = score;
              } else {
                existStd.scores.push(score);
              }
            });
            return {
              student: student.student,
              scores: existStd.scores,
            };
          });
          if (courseSection.assignments.length) {
            section.assignments.forEach((assign) => {
              const existsAssignIndex = courseSection.assignments.findIndex(
                ({ name }) => name === assign.name,
              );
              if (existsAssignIndex > -1) {
                courseSection.assignments[existsAssignIndex] = assign;
              } else {
                courseSection.assignments.push(assign);
              }
            });
          } else {
            courseSection.assignments = section.assignments;
          }
        }
      });
      await Promise.all(updatePromises);
      await updateCourse.save();
      return updateCourse.sections;
    } catch (error) {
      throw error;
    }
  }

  async publishScore(requestDTO: any): Promise<any> {
    try {
      const updateAssignments = await this.courseModel.findByIdAndUpdate(
        requestDTO.course,
        {
          $set: {
            'sections.$[section].assignments.$[assignment].isPublish':
              requestDTO.isPublish,
          },
        },
        {
          arrayFilters: [
            { 'section.sectionNo': { $in: requestDTO.sections } },
            { 'assignment.name': { $in: requestDTO.assignments } },
          ],
          fields: ['sections.sectionNo', 'sections.assignments'],
          new: true,
        },
      );
      return updateAssignments;
    } catch (error) {
      throw error;
    }
  }
}

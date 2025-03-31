import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, Section } from '../course/schemas/course.schema';
import { User } from '../user/schemas/user.schema';
import { ROLE } from 'src/common/enum/role.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ScoreService {
  constructor(
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    // private readonly eventEmitter: EventEmitter2,
  ) {}

  async uploadScore(requestDTO: any): Promise<Section[]> {
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
          section.students.forEach((student) => {
            const existStd = courseSection.students.find(
              (std) => student.student == std.student,
            );
            if (existStd) {
              student.scores.forEach((score) => {
                const existsAssignIndex = existStd.scores.findIndex(
                  ({ assignmentName }) =>
                    assignmentName === score.assignmentName,
                );
                if (existsAssignIndex > -1) {
                  existStd.scores[existsAssignIndex] = score;
                } else {
                  existStd.scores.push(score);
                }
              });
            } else {
              courseSection.students.push({
                student: student.student,
                scores: student.scores,
              });
            }
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

  // async uploadScore(requestDTO: any, jobId: string): Promise<any> {
  //   try {
  //     const { year, semester, course, sections } = requestDTO;
  //     let updateCourse = await this.courseModel.findById(course);

  //     let totalStudents = sections.reduce(
  //       (sum, sec) => sum + sec.students.length,
  //       0,
  //     );
  //     let processed = 0;

  //     for (const section of sections) {
  //       for (const student of section.students) {
  //         let existsUser = await this.userModel.findOne({
  //           studentId: student.studentId,
  //         });

  //         if (!existsUser) {
  //           existsUser = await this.userModel.create({
  //             ...student,
  //             role: ROLE.STUDENT,
  //             enrollCourses: [
  //               {
  //                 year,
  //                 semester,
  //                 courses: [{ course, section: section.sectionNo }],
  //               },
  //             ],
  //           });
  //         }

  //         processed++;
  //         const progress = Math.round((processed / totalStudents) * 100);

  //         // Emit progress event
  //         this.eventEmitter.emit(`progress.${jobId}`, { jobId, progress });
  //       }
  //     }

  //     await updateCourse.save();
  //     return updateCourse.sections;
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  async updateAssignment(requestDTO: {
    course: string;
    topic: string;
    sectionNo: number;
    oldName: string;
    name: string;
  }): Promise<any> {
    try {
      const arrayFilters: any[] = [];
      if (requestDTO.sectionNo) {
        arrayFilters.push({ 'section.sectionNo': requestDTO.sectionNo });
      } else if (requestDTO.topic) {
        arrayFilters.push({ 'section.topic': requestDTO.topic });
      } else {
        arrayFilters.push({ 'section.assignments.name': requestDTO.oldName });
      }
      arrayFilters.push(
        { 'assignment.name': requestDTO.oldName },
        { 'score.assignmentName': requestDTO.oldName },
      );

      const updateAssignments = await this.courseModel
        .findByIdAndUpdate(
          requestDTO.course,
          {
            $set: {
              'sections.$[section].assignments.$[assignment].name':
                requestDTO.name,
              'sections.$[section].students.$[].scores.$[score].assignmentName':
                requestDTO.name,
            },
          },
          {
            arrayFilters,
            fields: [
              'sections.sectionNo',
              'sections.assignments',
              'sections.students',
            ],
            new: true,
          },
        )
        .populate({
          path: 'sections.students.student',
          select:
            'studentId firstNameEN lastNameEN firstNameTH lastNameTH email termsOfService',
        });
      updateAssignments?.sections.forEach((section) => {
        section.students.sort(
          (a, b) =>
            parseInt(a.student.studentId) - parseInt(b.student.studentId),
        );
      });
      return updateAssignments;
    } catch (error) {
      throw error;
    }
  }

  async deleteAssignment(requestDTO: any): Promise<any> {
    try {
      const course = await this.courseModel.findById(requestDTO.course);

      course?.sections.forEach((section) => {
        if (
          (requestDTO.sectionNo && section.sectionNo != requestDTO.sectionNo) ||
          (requestDTO.topic && section.topic != requestDTO.topic)
        ) {
          return;
        }
        section.assignments = section.assignments.filter(
          (assignment) => assignment.name !== requestDTO.name,
        );
        section.students.forEach((student) => {
          student.scores = student.scores.filter(
            (score) => score.assignmentName !== requestDTO.name,
          );
        });
      });
      await course.save();
      const updateAssignments = await this.getUpdateStudentList(
        requestDTO,
        'sections.sectionNo sections.students sections.assignments',
      );
      return updateAssignments;
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

  async updateStudentScore(requestDTO: any): Promise<any> {
    try {
      await this.courseModel.findByIdAndUpdate(
        requestDTO.course,
        {
          $set: {
            'sections.$[section].students.$[student].scores.$[assignment].questions':
              requestDTO.questions,
          },
        },
        {
          arrayFilters: [
            { 'section.sectionNo': requestDTO.sectionNo },
            { 'student.student': requestDTO.student },
            { 'assignment.assignmentName': requestDTO.assignmentName },
          ],
        },
      );
      const updateStudentList = await this.getUpdateStudentList(
        requestDTO,
        'sections._id sections.students',
      );
      return updateStudentList?.sections;
    } catch (error) {
      throw error;
    }
  }

  private async getUpdateStudentList(
    requestDTO: any,
    fields: string,
  ): Promise<Course> {
    try {
      const updateStudentList = await this.courseModel
        .findById(requestDTO.course)
        .populate({
          path: 'sections.students.student',
          select:
            'studentId firstNameEN lastNameEN firstNameTH lastNameTH email termsOfService',
        })
        .select(fields);
      updateStudentList?.sections.forEach((section) => {
        section.students.sort(
          (a, b) =>
            parseInt(a.student.studentId) - parseInt(b.student.studentId),
        );
      });
      return updateStudentList;
    } catch (error) {
      throw error;
    }
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CourseManagement } from '../courseManagement/schemas/courseManagement.schema';
import { Course, Section } from '../course/schemas/course.schema';
import { User } from '../user/schemas/user.schema';
import { ROLE } from 'src/common/enum/role.enum';
import { COURSE_TYPE } from 'src/common/enum/type.enum';
import { TQF3 } from '../tqf3/schemas/tqf3.schema';
import { TQF5 } from '../tqf5/schemas/tqf5.schema';

@Injectable()
export class SectionService {
  constructor(
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    @InjectModel(CourseManagement.name)
    private readonly courseManagementModel: Model<CourseManagement>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(TQF3.name) private readonly tqf3Model: Model<TQF3>,
    @InjectModel(TQF5.name) private readonly tqf5Model: Model<TQF5>,
  ) {}

  async updateSection(id: string, requestDTO: any): Promise<any> {
    try {
      const check = await this.courseManagementModel.findOne({
        courseNo: requestDTO.courseNo,
      });
      const sectionExists = check.sections.find(
        (sec) =>
          sec.sectionNo == requestDTO.data.sectionNo &&
          sec.sectionNo !== requestDTO.oldSectionNo,
      );
      if (sectionExists) {
        throw new BadRequestException(
          `Section No ${('000' + requestDTO.data.sectionNo).slice(-3)} already exists`,
        );
      }
      const oldSection = check.sections.find(
        (sec: any) => sec.sectionNo === requestDTO.oldSectionNo,
      );
      const oldTopic = oldSection?.topic;
      const newTopic = requestDTO.data.topic;

      const updateFields = {};
      const unsetFields: any = {};
      for (const key in requestDTO.data) {
        if (requestDTO.data[key] === null) {
          unsetFields[`sections.$[sec].${key}`] = 1;
        } else {
          updateFields[`sections.$[sec].${key}`] = requestDTO.data[key];
        }
      }
      await this.courseManagementModel.findOneAndUpdate(
        {
          courseNo: requestDTO.courseNo,
          'sections.sectionNo': requestDTO.oldSectionNo,
        },
        { $set: updateFields, $unset: unsetFields },
        {
          arrayFilters: [{ 'sec.sectionNo': requestDTO.oldSectionNo }],
          new: true,
        },
      );

      if (oldTopic && newTopic && oldTopic !== newTopic) {
        await Promise.all([
          this.courseManagementModel.findOneAndUpdate(
            { courseNo: requestDTO.courseNo },
            { $set: { 'sections.$[sec].topic': newTopic } },
            { arrayFilters: [{ 'sec.topic': oldTopic }] },
          ),
          this.courseModel.findOneAndUpdate(
            {
              year: requestDTO.year,
              semester: requestDTO.semester,
              courseNo: requestDTO.courseNo,
            },
            { $set: { 'sections.$[sec].topic': newTopic } },
            { arrayFilters: [{ 'sec.topic': oldTopic }] },
          ),
        ]);
      }
      const course = await this.courseModel.findOneAndUpdate(
        {
          year: requestDTO.year,
          semester: requestDTO.semester,
          courseNo: requestDTO.courseNo,
        },
        { $set: updateFields, $unset: unsetFields },
        {
          arrayFilters: [{ 'sec._id': id }],
          new: true,
        },
      );
      return course;
    } catch (error) {
      throw error;
    }
  }

  async updateSectionActive(requestDTO: any): Promise<any> {
    try {
      await this.courseModel.updateOne(
        {
          _id: requestDTO.courseId,
          'sections.sectionNo': requestDTO.sectionNo,
        },
        { $set: { 'sections.$.isActive': requestDTO.isActive } },
        { new: true },
      );
      return { message: 'ok' };
    } catch (error) {
      throw error;
    }
  }

  async deleteSection(id: string, requestDTO: any): Promise<any> {
    try {
      const updateCourse = await this.courseManagementModel.findOneAndUpdate(
        { courseNo: requestDTO.courseNo },
        { $pull: { sections: { sectionNo: requestDTO.sectionNo } } },
        { new: true },
      );
      if (!updateCourse) {
        throw new NotFoundException('Course not found');
      }
      const update = await this.courseModel.findByIdAndUpdate(
        requestDTO.courseId,
        {
          $pull: { sections: { _id: id } },
        },
      );

      if (update.type == COURSE_TYPE.SEL_TOPIC) {
        const delSec = update.sections.find((sec: any) => sec.id == id);
        const existTopic = update.sections.find(
          (sec: any) => sec.topic == delSec.topic && sec.id != id,
        );
        if (!existTopic) {
          await Promise.all([
            this.tqf3Model.findByIdAndDelete(delSec.TQF3),
            this.tqf5Model.findByIdAndDelete(delSec.TQF5),
          ]);
        }
      }
      return { message: 'ok' };
    } catch (error) {
      throw error;
    }
  }

  async uploadStudentList(requestDTO: any): Promise<Section[]> {
    try {
      const { year, semester, course, sections } = requestDTO;
      let updateCourse = await this.courseModel.findById(course);
      const oldStudentIds = new Set<string>();
      updateCourse.sections.forEach((sec) => {
        sec.students.forEach((student: any) =>
          oldStudentIds.add(student.student._id),
        );
        sec.students = [];
      });
      await updateCourse.save();
      const updatePromises = sections.map(async (section: any) => {
        const { sectionNo, studentList } = section;
        const studentPromises = studentList.map(async (student: any) => {
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
                  courses: [{ course, section: sectionNo }],
                },
              ],
            });
          } else {
            const existsTerm = existsUser.enrollCourses.find(
              (item) => item.year == year && item.semester == semester,
            );
            if (existsTerm) {
              const existsCourse = existsTerm.courses.find(
                (item) => item.course == course,
              );
              if (existsCourse) {
                existsCourse.section = sectionNo;
              } else {
                existsTerm.courses.push({ course, section: sectionNo });
              }
            } else {
              existsUser.enrollCourses.push({
                year,
                semester,
                courses: [{ course, section: sectionNo }],
              });
            }
            await existsUser.save();
          }
          oldStudentIds.delete(existsUser.id);
          return existsUser._id;
        });
        const studentIds = await Promise.all(studentPromises);
        const courseSection = updateCourse.sections.find(
          (sec) => sec.sectionNo == sectionNo,
        );
        if (courseSection) {
          courseSection.students = studentIds.map((std) => {
            const existStd = courseSection.students.find(
              (std) => std.student == std.student,
            );
            return { student: std, scores: existStd?.scores || [] };
          });
        }
      });
      await Promise.all(updatePromises);
      await updateCourse.save();
      await this.userModel.updateMany(
        { _id: { $in: [...oldStudentIds] } },
        { $pull: { 'enrollCourses.$[].courses': { course: updateCourse.id } } },
      );
      const updateStudentList = await this.getUpdateStudentList(requestDTO);
      return updateStudentList;
    } catch (error) {
      throw error;
    }
  }

  async addStudent(requestDTO: any): Promise<Section[]> {
    try {
      const student = await this.userModel.findOneAndUpdate(
        { studentId: requestDTO.studentId },
        {
          $setOnInsert: {
            ...requestDTO,
            role: ROLE.STUDENT,
          },
          $addToSet: {
            enrollCourses: {
              year: requestDTO.year,
              semester: requestDTO.semester,
              courses: [],
            },
          },
        },
        { new: true, upsert: true },
      );
      await Promise.all([
        this.courseModel.findByIdAndUpdate(
          requestDTO.course,
          {
            $addToSet: {
              'sections.$[section].students': { student: student.id },
            },
          },
          {
            arrayFilters: [{ 'section.sectionNo': requestDTO.sectionNo }],
          },
        ),
        this.userModel.findByIdAndUpdate(
          student.id,
          {
            $addToSet: {
              'enrollCourses.$[enrollCourse].courses': {
                course: requestDTO.course,
                section: requestDTO.sectionNo,
              },
            },
          },
          {
            arrayFilters: [
              {
                'enrollCourse.year': requestDTO.year,
                'enrollCourse.semester': requestDTO.semester,
              },
            ],
          },
        ),
      ]);
      const updateStudentList = await this.getUpdateStudentList(requestDTO);
      return updateStudentList;
    } catch (error) {
      throw error;
    }
  }

  async updateStudent(requestDTO: any): Promise<Section[]> {
    try {
      const updateStudent = await this.userModel.findById(requestDTO.student);
      if (updateStudent) {
        if (requestDTO.studentId)
          updateStudent.studentId = requestDTO.studentId;
        if (requestDTO.email) updateStudent.email = requestDTO.email;
        if (requestDTO.firstNameTH) {
          updateStudent.firstNameTH = requestDTO.firstNameTH;
          updateStudent.lastNameTH = requestDTO.lastNameTH;
        } else if (requestDTO.firstNameEN) {
          updateStudent.firstNameEN = requestDTO.firstNameEN;
          updateStudent.lastNameEN = requestDTO.lastNameEN;
        }
        await updateStudent.save();
      }
      const updateData: Partial<User> = {};
      if (requestDTO.oldSectionNo !== requestDTO.sectionNo) {
        updateData['enrollCourses.$[enrollCourse].courses.$[course].section'] =
          requestDTO.sectionNo;
      }
      const dataStudent = (
        await this.courseModel.findById(requestDTO.course)
      ).sections
        .find(({ sectionNo }) => sectionNo == requestDTO.oldSectionNo)
        .students.find(({ student }) => student == requestDTO.student);

      await Promise.all([
        this.userModel.findByIdAndUpdate(
          requestDTO.student,
          { $set: updateData },
          {
            arrayFilters: [
              {
                'enrollCourse.year': requestDTO.year,
                'enrollCourse.semester': requestDTO.semester,
              },
              { 'course.course': requestDTO.course },
            ],
          },
        ),
        requestDTO.oldSectionNo !== requestDTO.sectionNo &&
          this.courseModel.findByIdAndUpdate(
            requestDTO.course,
            {
              $pull: {
                'sections.$[oldSection].students': {
                  student: requestDTO.student,
                },
              },
              $push: {
                'sections.$[newSection].students': dataStudent,
              },
            },
            {
              arrayFilters: [
                { 'oldSection.sectionNo': requestDTO.oldSectionNo },
                { 'newSection.sectionNo': requestDTO.sectionNo },
              ],
            },
          ),
      ]);
      const updateStudentList = await this.getUpdateStudentList(requestDTO);
      return updateStudentList;
    } catch (error) {
      throw error;
    }
  }

  async deleteStudent(requestDTO: any): Promise<Section[]> {
    try {
      await Promise.all([
        this.courseModel.findByIdAndUpdate(
          requestDTO.course,
          {
            $pull: {
              'sections.$[section].students': { student: requestDTO.student },
            },
          },
          {
            arrayFilters: [{ 'section.sectionNo': requestDTO.sectionNo }],
          },
        ),
        this.userModel.findByIdAndUpdate(
          requestDTO.student,
          {
            $pull: {
              'enrollCourses.$[enrollCourse].courses': {
                course: requestDTO.course,
              },
            },
          },
          {
            arrayFilters: [
              {
                'enrollCourse.year': requestDTO.year,
                'enrollCourse.semester': requestDTO.semester,
              },
            ],
          },
        ),
      ]);

      const updateStudentList = await this.getUpdateStudentList(requestDTO);
      return updateStudentList;
    } catch (error) {
      throw error;
    }
  }

  private async getUpdateStudentList(requestDTO: any): Promise<Section[]> {
    try {
      const updateStudentList = await this.courseModel
        .findById(requestDTO.course)
        .populate({
          path: 'sections.students.student',
          select:
            'studentId firstNameEN lastNameEN firstNameTH lastNameTH email termsOfService',
        })
        .select('sections._id sections.students');
      updateStudentList?.sections.forEach((section) => {
        section.students.sort(
          (a, b) =>
            parseInt(a.student.studentId) - parseInt(b.student.studentId),
        );
      });
      return updateStudentList?.sections;
    } catch (error) {
      throw error;
    }
  }
}

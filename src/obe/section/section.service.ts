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
      for (const key in requestDTO.data) {
        updateFields[`sections.$[sec].${key}`] = requestDTO.data[key];
      }
      await this.courseManagementModel.findOneAndUpdate(
        {
          courseNo: requestDTO.courseNo,
          'sections.sectionNo': requestDTO.oldSectionNo,
        },
        { $set: updateFields },
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
        { $set: updateFields },
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
      const updatePromises = sections.map(async (section: any) => {
        const { sectionId, studentList } = section;
        const studentPromises = studentList.map(async (student: any) => {
          let existsUser = await this.userModel.findOne({
            studentId: student.studentId,
          });
          if (!existsUser) {
            existsUser = await this.userModel.create({
              studentId: student.studentId,
              firstNameTH: student.firstName,
              lastNameTH: student.lastName,
              role: ROLE.STUDENT,
              enrollCourses: [
                {
                  year,
                  semester,
                  courses: [{ course, section: sectionId }],
                },
              ],
            });
          } else {
            const existsTerm = existsUser.enrollCourses.find(
              (item) => item.year == year && item.semester == semester,
            );
            if (existsTerm) {
              existsTerm.courses.push({ course, section: sectionId });
            } else {
              existsUser.enrollCourses.push({
                year,
                semester,
                courses: [{ course, section: sectionId }],
              });
            }
            await existsUser.save();
          }
          return existsUser._id;
        });
        const studentIds = await Promise.all(studentPromises);
        updateCourse.sections.find((sec: any) => sec.id == sectionId).students =
          studentIds;
        // return this.model.updateOne(
        //   { _id: sectionId },
        //   { $set: { students: studentIds } },
        // );
      });

      await Promise.all([updatePromises, updateCourse.save()]);

      // const updatedSections = await this.model
      //   .find({
      //     _id: { $in: sections.map((section: any) => section.sectionId) },
      //   })
      //   .populate(
      //     'students',
      //     'studentId firstNameTH lastNameTH firstNameEN lastNameEN',
      //   );
      return updateCourse.sections;
    } catch (error) {
      throw error;
    }
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AcademicYear } from './schemas/academicYear.schema';
import { AcademicYearSearchDTO } from './dto/search.dto';
import { Course } from '../course/schemas/course.schema';
import { CourseManagement } from '../courseManagement/schemas/courseManagement.schema';
import { COURSE_TYPE, TQF_STATUS } from 'src/common/enum/type.enum';
import { TQF5 } from '../tqf5/schemas/tqf5.schema';
import { TQF3 } from '../tqf3/schemas/tqf3.schema';
import { PLO } from '../plo/schemas/plo.schema';

@Injectable()
export class AcademicYearService {
  constructor(
    @InjectModel(AcademicYear.name) private readonly model: Model<AcademicYear>,
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    @InjectModel(CourseManagement.name)
    private readonly courseManagementModel: Model<CourseManagement>,
    @InjectModel(TQF3.name) private readonly tqf3Model: Model<TQF3>,
    @InjectModel(TQF5.name) private readonly tqf5Model: Model<TQF5>,
    @InjectModel(PLO.name) private readonly ploModel: Model<PLO>,
  ) {}

  async searchAcademicYear(
    searchDTO: AcademicYearSearchDTO,
  ): Promise<AcademicYear[]> {
    try {
      if (searchDTO.manage) {
        return await this.model.find().sort({
          [searchDTO.orderBy]: searchDTO.orderType,
          semester: searchDTO.orderType,
        });
      } else {
        const academicYear = await this.model
          .find()
          .sort({ year: 'desc', semester: 'desc' });
        const index = academicYear.findIndex((e) => e.isActive);
        if (index >= 0) return academicYear.slice(index, index + 15);
        else return [];
      }
    } catch (error) {
      throw error;
    }
  }

  async createAcademicYear(requestDTO: AcademicYear): Promise<any> {
    try {
      const res = await this.model.create({
        year: requestDTO.year,
        semester: requestDTO.semester,
      });
      return res;
    } catch (error) {
      throw error;
    }
  }

  async activeAcademicYear(academicYearId: string): Promise<AcademicYear> {
    try {
      await this.model.findOneAndUpdate(
        { isActive: true },
        { isActive: false },
      );
      const academic = await this.model.findByIdAndUpdate(
        academicYearId,
        { isActive: true },
        { new: true },
      );
      const activePlo = await this.ploModel.find({ isActive: true });
      await this.ploModel.updateMany(
        { year: academic.year, semester: academic.semester },
        { isActive: true },
        { new: true },
      );
      const updatedPlo = await this.ploModel.find({
        year: academic.year,
        semester: academic.semester,
        isActive: true,
      });
      const departmentCode = updatedPlo
        .map(({ departmentCode }) => departmentCode)
        .flat();
      const updatePromises = activePlo.map((plo) => {
        if (plo.departmentCode.some((item) => departmentCode.includes(item))) {
          plo.isActive = false;
          return plo.save();
        }
      });
      await Promise.all(updatePromises);

      const courseManagements = await this.courseManagementModel.find({
        sections: {
          $elemMatch: { semester: academic.semester },
        },
      });

      const newCourses: Course[] = [];
      for (const course of courseManagements) {
        for (const section of course.sections) {
          const isCreate = section.semester.includes(academic.semester);
          const dataSection: any = { ...(section as any)._doc };
          let existingCourse = newCourses.find(
            (item) => item.courseNo == course.courseNo,
          );
          if (!existingCourse && isCreate) {
            const newCourse: Partial<Course> = {
              year: academic.year,
              semester: academic.semester,
              courseNo: course.courseNo,
              courseName: course.courseName,
              type: course.type,
              sections: [],
            };
            if (course.type != COURSE_TYPE.SEL_TOPIC) {
              const [tqf3, tqf5] = await Promise.all([
                this.tqf3Model.create({ status: TQF_STATUS.NO_DATA }),
                this.tqf5Model.create({ status: TQF_STATUS.NO_DATA }),
              ]);
              newCourse.TQF3 = tqf3.id;
              newCourse.TQF5 = tqf5.id;
            } else {
              dataSection.TQF3 = (
                await this.tqf3Model.create({ status: TQF_STATUS.NO_DATA })
              ).id;
              dataSection.TQF5 = (
                await this.tqf5Model.create({ status: TQF_STATUS.NO_DATA })
              ).id;
            }
            newCourse.sections.push(dataSection);
            newCourses.push(newCourse as Course);
            existingCourse = newCourse as Course;
          } else if (isCreate && existingCourse) {
            if (course.type == COURSE_TYPE.SEL_TOPIC) {
              const existTopicSection = existingCourse.sections.find(
                (item) => item.topic === section.topic,
              );
              if (existTopicSection) {
                dataSection.TQF3 = existTopicSection.TQF3;
                dataSection.TQF5 = existTopicSection.TQF5;
              } else {
                dataSection.TQF3 = (
                  await this.tqf3Model.create({ status: TQF_STATUS.NO_DATA })
                ).id;
                dataSection.TQF5 = (
                  await this.tqf5Model.create({ status: TQF_STATUS.NO_DATA })
                ).id;
              }
            }
            existingCourse.sections.push(dataSection);
          }
          console.log('Section Added:', dataSection);
        }
      }

      await this.courseModel.create(newCourses);

      return academic;
    } catch (error) {
      throw error;
    }
  }

  async updateProcessTqf3(
    academicYearId: string,
    requestDTO: any,
  ): Promise<AcademicYear> {
    try {
      const res = await this.model.findByIdAndUpdate(
        academicYearId,
        { isProcessTQF3: requestDTO.isProcessTQF3 },
        { new: true },
      );
      return res;
    } catch (error) {
      throw error;
    }
  }

  async deleteAcademicYear(id: string): Promise<AcademicYear> {
    try {
      const res = await this.model.findByIdAndDelete(id);
      if (!res) {
        throw new NotFoundException('AcademicYear not found.');
      }
      return res;
    } catch (error) {
      throw error;
    }
  }
}

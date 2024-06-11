import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course } from './schemas/course.schema';
import { ConfigService } from '@nestjs/config';
import { User } from '../user/schemas/user.schema';
import { Section } from '../section/schemas/section.schema';
import { CourseManagementService } from '../courseManagement/courseManagement.service';
import { SectionManagement } from '../courseManagement/schemas/courseManagement.schema';
import { COURSE_TYPE } from 'src/common/enum/type.enum';
import { CourseSearchDTO } from './dto/search.dto';
import { isNumeric } from 'validator';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private readonly model: Model<Course>,
    @InjectModel(Section.name) private readonly sectionModel: Model<Section>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly courseManagementService: CourseManagementService,
    private readonly configService: ConfigService,
  ) {}

  async searchCourse(id: string, searchDTO: CourseSearchDTO): Promise<any> {
    if (searchDTO.manage) {
      return await this.model
        .find({ academicYear: searchDTO.academicYear })
        .sort([[searchDTO.orderBy, searchDTO.orderType]])
        .skip((searchDTO.page - 1) * searchDTO.limit)
        .limit(searchDTO.limit);
    } else {
      const sections = await this.sectionModel.find({
        $or: [{ instructor: id }, { coInstructors: id }],
      });
      const where = {
        academicYear: searchDTO.academicYear,
        sections: { $in: sections.map((e) => e.id) },
      };
      if (searchDTO.search.length) {
        if (isNumeric(searchDTO.search)) {
          where['$expr'] = {
            $regexMatch: {
              input: { $toString: '$courseNo' },
              regex: searchDTO.search,
              options: 'i',
            },
          };
        } else {
          where['courseName'] = { $regex: searchDTO.search, $options: 'i' };
        }
      }
      const courses = await this.model
        .find(where)
        .populate({
          path: 'sections',
          populate: [
            { path: 'instructor', select: 'firstNameEN lastNameEN email' },
            { path: 'coInstructors', select: 'firstNameEN lastNameEN email' },
          ],
        })
        .sort([[searchDTO.orderBy, searchDTO.orderType]])
        .skip((searchDTO.page - 1) * searchDTO.limit)
        .limit(searchDTO.limit);
      const filterCourses = courses.map((course) => {
        course.sections = course.sections.filter(
          (section: any) =>
            section.instructor.id == id ||
            section.coInstructors.some((coIns) => coIns.id == id),
        );
        return course;
      });
      if (searchDTO.page == 1 && !searchDTO.search.length) {
        const totalCount = await this.model.countDocuments({
          academicYear: searchDTO.academicYear,
          sections: { $in: sections.map((e) => e.id) },
        });
        return { totalCount, courses: filterCourses };
      }
      return filterCourses;
    }
  }

  async createCourse(id: string, requestDTO: any): Promise<any> {
    // const cpeConfig = this.configService.get('CPE_CONFIG');
    // const courseCPE = await axios.get(`${cpeConfig.url}/course/detail`, {
    //   params: { courseNo: '261' },
    //   headers: { Authorization: 'Bearer ' + cpeConfig.token },
    // });
    // const course = [];
    // courseCPE.data.courseDetails.forEach((e: any) => {
    //   if (e.courseNo.startsWith('261')) {
    //     course.push({
    //       courseNo: e.courseNo,
    //       courseName: e.courseNameEN,
    //       updatedYear: e.updatedYear,
    //       updatedSemester: e.updatedSemester,
    //       type: e.courseNameEN.startsWith('Selected Topics')
    //         ? COURSE_TYPE.SEL_TOPIC
    //         : COURSE_TYPE.GENERAL,
    //       dapartmentCode: DEPARTMENT_CODE.CPE,
    //     });
    //   }
    // });
    // return course

    // const newCourseManagement: any = await this.courseManagementModel.create({
    //   courseNo: requestDTO.courseNo,
    //   courseName: requestDTO.courseName,
    //   updatedYear: requestDTO.updatedYear,
    //   updatedSemester: requestDTO.updatedSemester,
    //   type: requestDTO.type,
    //   sections: requestDTO.sections,
    // });

    const newCourseManagement: any =
      await this.courseManagementService.createCourseManagement(id, requestDTO);
    requestDTO.sections.forEach((e: Section) => {
      e.sectionManage = newCourseManagement.sections.find(
        (c: SectionManagement) => c.sectionNo == e.sectionNo,
      ).id;
      if (requestDTO.type == COURSE_TYPE.SEL_TOPIC) {
        e.isProcessTQF3 = true;
      }
    });

    const newSecion = await this.sectionModel.insertMany(requestDTO.sections);

    let data: Course = {
      ...requestDTO,
      sections: newSecion.map((e) => e.id),
    };
    if (requestDTO.type == COURSE_TYPE.GENERAL) {
      data.isProcessTQF3 = true;
    }
    const newCourse = await this.model.create(data);

    return await newCourse.populate([
      { path: 'academicYear' },
      { path: 'sections' },
    ]);
  }

  // async deleteCourse(id: string): Promise<Course> {
  //   return await this.model.findByIdAndDelete(id);
  // }
}

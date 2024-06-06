import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CourseManagement,
  CourseManagementDocument,
} from './schemas/courseManagement.schema';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { COURSE_TYPE } from 'src/common/enum/type.enum';
import { DEPARTMENT_CODE } from 'src/common/enum/department.enum';

@Injectable()
export class CourseManagementService {
  constructor(
    @InjectModel(CourseManagement.name)
    private readonly model: Model<CourseManagement>,
    private readonly configService: ConfigService,
  ) {}

  async searchCourseManagement(searchDTO: any): Promise<CourseManagement[]> {
    return await this.model
      .find()
      .skip((searchDTO.page - 1) * searchDTO.limit)
      .limit(searchDTO.limit);
  }

  async createCourseManagement(requestDTO: any, user: any): Promise<any> {
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
    // return await this.model.insertMany(course);
    // return await this.model.create({
    //   year: requestDTO.year,
    //   semester: requestDTO.semester,
    //   creator: user.id,
    // });
  }

  // async deleteCourseManagement(id: string): Promise<CourseManagement> {
  //   return await this.model.findByIdAndDelete(id);
  // }
}

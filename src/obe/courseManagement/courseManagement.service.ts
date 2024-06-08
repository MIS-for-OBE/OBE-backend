import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CourseManagement,
  CourseManagementDocument,
} from './schemas/courseManagement.schema';
import { ConfigService } from '@nestjs/config';
import { User } from '../user/schemas/user.schema';

@Injectable()
export class CourseManagementService {
  constructor(
    @InjectModel(CourseManagement.name)
    private readonly model: Model<CourseManagement>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly configService: ConfigService,
  ) {}

  async searchCourseManagement(searchDTO: any): Promise<CourseManagement[]> {
    return await this.model
      .find()
      .skip((searchDTO.page - 1) * searchDTO.limit)
      .limit(searchDTO.limit);
  }

  async createCourseManagement(
    id: string,
    requestDTO: CourseManagementDocument,
  ): Promise<CourseManagement> {
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
    // const user = await this.userModel.findById(id);
    return await this.model.create(requestDTO);
  }

  async deleteCourseManagement(id: string): Promise<CourseManagement> {
    return await this.model.findByIdAndDelete(id);
  }
}

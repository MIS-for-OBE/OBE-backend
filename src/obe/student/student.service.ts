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
        let section = item.course.sections?.find(
          ({ sectionNo }) => sectionNo == item.section,
        )?._doc;
        if (section) {
          section.id = section._id;
          delete section._id;
          delete section.isActive;
          delete section.TQF3;
          delete section.TQF5;
        }
        const scores = section?.students.find(
          ({ student }) => student == authUser.id,
        )?.scores;
        return {
          id: item.course.id,
          courseNo: item.course.courseNo,
          courseName: item.course.courseName,
          type: item.course.type,
          section,
          scores,
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
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { BaseDTO } from 'src/common/dto/base.dto';

export class CourseManagementDTO extends BaseDTO {}

export class DeleteCourseManagementDTO extends BaseDTO {
  @ApiProperty({ description: 'Academic Year that active' })
  year: string;

  @ApiProperty({ description: 'Semester that active' })
  semester: string;

  @ApiProperty({ description: 'Course No to be deleted' })
  courseNo: string;
}

export class DeleteSectionManagementDTO extends BaseDTO {
  @ApiProperty({ description: 'Academic Year that active' })
  year: number;

  @ApiProperty({ description: 'Semester that active' })
  semester: number;

  @ApiProperty({ description: 'Course No of section' })
  courseNo: string;

  @ApiProperty({ description: 'Section No to be deleted' })
  sectionNo: string;
}

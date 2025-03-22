import { ApiProperty } from '@nestjs/swagger';
import { BaseDTO } from 'src/common/dto/base.dto';

export class SectionDTO extends BaseDTO {}

export class DeleteSectionDTO extends BaseDTO {
  @ApiProperty({ description: 'ID of the course' })
  courseId: string;

  @ApiProperty({ description: 'Course No' })
  courseNo: string;

  @ApiProperty({ description: 'Section No to be deleted' })
  sectionNo: number;
}

export class DeleteStudentDTO extends BaseDTO {
  @ApiProperty({ description: 'Academic year of the student' })
  year: string;

  @ApiProperty({ description: 'Semester in which the student is enrolled' })
  semester: string;

  @ApiProperty({ description: 'ID of the course' })
  course: string;

  @ApiProperty({ description: 'Section number of the student' })
  sectionNo: string;

  @ApiProperty({ description: 'ID of the student to be deleted' })
  student: string;
}

import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { BaseDTO } from '../dto/base.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CmuApiTqfCourseSearchDTO extends BaseDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'รหัสกระบวนวิชาที่เป็นตัวเลข',
    type: String,
    example: '261494',
  })
  courseid: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'ปีการศึกษา',
    type: String,
    example: '2567',
  })
  academicyear: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'ภาคการศึกษา',
    type: String,
    example: 1,
  })
  academicterm: number;
}

export class CmuApiTqfCourseDTO extends BaseDTO {
  CourseTemplateID: string;
  FacultyID: string;
  FacultyNameTha: string;
  AcademicYear: string;
  AcademicTerm: number;
  CourseID: string;
  CourseCodeEng: string;
  CourseCodeTha: string;
  CourseTitleEng: string;
  CourseTitleTha: string;
  Abbreviation: string;
  CourseDescriptionEng: string;
  CourseDescriptionTha: string;
  TotalCredit: string;
  LectureHouse: string;
  LabHour: string;
  SelfLearning: string;
  PreText: string;
  Credit: string;
}

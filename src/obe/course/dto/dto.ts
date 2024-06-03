import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { BaseDTO } from 'src/common/dto/base.dto';

export class CourseDTO extends BaseDTO {}

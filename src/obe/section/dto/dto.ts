import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { BaseDTO } from 'src/common/dto/base.dto';

export class SectionDTO extends BaseDTO {}

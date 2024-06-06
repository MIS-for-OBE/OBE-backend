import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { BaseDTO } from 'src/common/dto/base.dto';

export class LogEventDTO extends BaseDTO {}

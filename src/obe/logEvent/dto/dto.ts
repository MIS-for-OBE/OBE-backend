import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { BaseDTO } from 'src/common/dto/base.dto';
import { LOG_EVENT_TYPE } from 'src/common/enum/type.enum';

export class LogEventDTO extends BaseDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'type of log event',
    type: LOG_EVENT_TYPE,
    example: 'File',
  })
  type: LOG_EVENT_TYPE;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'event description',
    type: String,
    example: 'File',
  })
  event: string;

  @IsString()
  @ApiProperty({
    description: 'course id that related event',
    type: String,
    example: 'qwertyuio565sddf',
  })
  course: string = undefined;

  @IsString()
  @ApiProperty({
    description: 'section that related event',
    type: [Number],
    example: [1, 3, 801],
  })
  sectionDetect: number[] = undefined;
}

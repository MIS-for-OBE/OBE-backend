import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsObject } from 'class-validator';
import { TEXT_ENUM } from '../enum/text.enum';

export class ResponseDTO<T> {
  @IsString()
  @ApiProperty({
    description: 'Message of the action',
    type: String,
    example: 'any message such as success',
  })
  message = TEXT_ENUM.Success;

  @IsObject()
  @ApiProperty({
    description: 'Response data',
    type: Object,
  })
  data: T;
}

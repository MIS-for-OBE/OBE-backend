import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsObject, IsNumber } from 'class-validator';
import { TEXT_ENUM } from '../enum/text.enum';

export class ResponseDTO<T> {
  @IsString()
  @ApiProperty({
    description: 'message of actions',
    type: String,
    example: 'any message such as success',
  })
  message = TEXT_ENUM.Success;

  @IsObject()
  @ApiProperty({
    description: 'data list',
    type: Object,
    example: {},
  })
  data: T;

  @IsNumber()
  @ApiProperty({
    description: 'Total items',
    type: Number,
    example: 10,
  })
  totalItems: number;
}

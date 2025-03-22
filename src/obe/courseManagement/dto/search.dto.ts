import { IsArray, IsString } from 'class-validator';
import { SearchDTO } from 'src/common/dto/search.dto';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CourseManagementSearchDTO extends SearchDTO {
  @ApiProperty({
    description: 'Search query string for course management',
    required:false,
    default: '',
  })
  @IsString()
  @Type(() => String)
  search: string = '';

  @ApiProperty({
    description:
      'List of curriculum identifiers for filtering course management',
    type: [String],
    default: [],
  })
  @IsArray()
  @Type(() => String)
  curriculum: string[] = [];
}

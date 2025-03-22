import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { AcademicYearService } from './academicYear.service';
import { AcademicYearSearchDTO } from './dto/search.dto';
import { AcademicYear } from './schemas/academicYear.schema';
import { Public } from 'src/auth/metadata/public.metadata';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  ApiUnauthorizedErrorResponse,
} from 'src/common/decorators/response.decorator';
import { exampleAcademicYearList } from 'src/common/example/example';
import { DESCRIPTION, TEXT_ENUM } from 'src/common/enum/text.enum';
import { ERROR_ENUM } from 'src/common/enum/error.enum';

@ApiTags('Academic Year')
@Controller('/academic-year')
@UsePipes(new ValidationPipe({ transform: true }))
export class AcademicYearController {
  constructor(private service: AcademicYearService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Search for academic years based on management' })
  @ApiSuccessResponse(AcademicYear, exampleAcademicYearList)
  async searchAcademicYear(
    @Query() searchDTO: AcademicYearSearchDTO,
  ): Promise<ResponseDTO<AcademicYear[]>> {
    return this.service.searchAcademicYear(searchDTO).then((result) => {
      const responseDTO = new ResponseDTO<AcademicYear[]>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create a new academic year' })
  @ApiSuccessResponse(AcademicYear)
  @ApiUnauthorizedErrorResponse()
  async createAcademicYear(
    @Body() requestDTO: AcademicYear,
  ): Promise<ResponseDTO<AcademicYear>> {
    return this.service.createAcademicYear(requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<AcademicYear>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Put('/:id')
  @ApiOperation({ summary: 'Activate an academic year by its ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the academic year to be updated',
  })
  @ApiSuccessResponse(AcademicYear)
  @ApiUnauthorizedErrorResponse()
  async activeAcademicYear(
    @Param('id') id: string,
  ): Promise<ResponseDTO<AcademicYear>> {
    return this.service.activeAcademicYear(id).then((result) => {
      const responseDTO = new ResponseDTO<AcademicYear>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete an academic year by its ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the academic year to be deleted',
  })
  @ApiSuccessResponse(null, { message: TEXT_ENUM.Success })
  @ApiUnauthorizedErrorResponse()
  @ApiErrorResponse(
    HttpStatus.NOT_FOUND,
    DESCRIPTION.NOT_FOUND,
    ERROR_ENUM.NOT_FOUND,
    'AcademicYear not found',
  )
  async deleteAcademicYear(@Param('id') id: string): Promise<ResponseDTO<any>> {
    return this.service.deleteAcademicYear(id).then((result) => {
      const responseDTO = new ResponseDTO<any>();
      responseDTO.data = result;
      return responseDTO;
    });
  }
}

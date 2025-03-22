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
  Request,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PLOService } from './plo.service';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { PLO, PLONo } from './schemas/plo.schema';
import { PLOSearchDTO } from './dto/search.dto';
import { Public } from 'src/auth/metadata/public.metadata';
import {
  ApiBody,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  ApiUnauthorizedErrorResponse,
} from 'src/common/decorators/response.decorator';
import { DESCRIPTION, TEXT_ENUM } from 'src/common/enum/text.enum';
import { ERROR_ENUM } from 'src/common/enum/error.enum';
import {
  exampleAddPlo,
  exampleDataPLO,
  examplePLONo2,
} from 'src/common/example/example';

@ApiTags('PLO')
@Controller('/plo')
@ApiExtraModels(PLO)
@UsePipes(new ValidationPipe({ transform: true }))
export class PLOController {
  constructor(private service: PLOService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Get a list of PLOs based on the provided curriculum.',
  })
  @ApiQuery({
    name: 'curriculum',
    description: 'Filter PLOs by curriculum code.',
    isArray: true,
    example: ['CPE-2563'],
  })
  @ApiOkResponse({
    description: DESCRIPTION.SUCCESS,
    schema: {
      properties: {
        message: { example: TEXT_ENUM.Success },
        data: {
          type: 'object',
          properties: {
            totalCount: {
              type: 'number',
              description: 'Total number of PLOs matching the query.',
            },
            plos: {
              type: 'array',
              description: 'List of PLO objects.',
              items: { $ref: getSchemaPath(PLO) },
            },
          },
        },
      },
    },
  })
  async searchPLO(
    @Request() req,
    @Query() searchDTO: { curriculum: string[] },
  ): Promise<ResponseDTO<any>> {
    return this.service
      .searchPLO(req?.user?.facultyCode, searchDTO)
      .then((result) => {
        const responseDTO = new ResponseDTO<any>();
        responseDTO.data = result;
        return responseDTO;
      });
  }

  @Get('one')
  @ApiOperation({ summary: 'Search a single PLO' })
  @ApiQuery({
    name: 'name',
    description: 'Search PLO by name.',
    required: false,
    example: 'PLO 1/67',
  })
  @ApiQuery({
    name: 'curriculum',
    description: 'Search PLO by curriculum code.',
    required: false,
    example: 'CPE-2563',
  })
  @ApiSuccessResponse(PLO)
  @ApiUnauthorizedErrorResponse()
  async seachOnePLO(
    @Request() req,
    @Query() searchDTO: PLOSearchDTO,
  ): Promise<ResponseDTO<any>> {
    return this.service
      .searchOnePLO(req.user.facultyCode, searchDTO)
      .then((result) => {
        const responseDTO = new ResponseDTO<any>();
        responseDTO.data = result;
        return responseDTO;
      });
  }

  @Get('check')
  @ApiOperation({ summary: 'Check if PLO creation is possible' })
  @ApiQuery({
    name: 'name',
    description: 'Name for create new PLO.',
    required: false,
    example: 'PLO 1/67',
  })
  @ApiSuccessResponse(null, { message: TEXT_ENUM.Success })
  @ApiUnauthorizedErrorResponse()
  @ApiErrorResponse(
    HttpStatus.BAD_REQUEST,
    DESCRIPTION.BAD_REQUEST,
    ERROR_ENUM.BAD_REQUEST,
    {
      title: 'PLO name existing',
      message: 'PLO 1/67 already exist.',
    },
  )
  async checkCanCreatePLO(
    @Query() requestDTO: { name: string },
  ): Promise<ResponseDTO<any>> {
    return this.service.checkCanCreatePLO(requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<any>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create a new PLO' })
  @ApiSuccessResponse(PLO)
  @ApiUnauthorizedErrorResponse()
  async createPLO(@Body() requestDTO: PLO): Promise<ResponseDTO<any>> {
    return this.service.createPLO(requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<any>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Put('/:id/no')
  @ApiOperation({ summary: 'Add a new PLONo to an existing PLO' })
  @ApiParam({ name: 'id', description: 'ID of PLO that add PLONo.' })
  @ApiBody({
    description: 'Data PLONo to added.',
    required: true,
    schema: { example: examplePLONo2 },
  })
  @ApiSuccessResponse(PLO, exampleAddPlo)
  @ApiUnauthorizedErrorResponse()
  async createPLONo(
    @Param('id') id: string,
    @Body() requestDTO: PLONo,
  ): Promise<ResponseDTO<PLO>> {
    return this.service.createPLONo(id, requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<PLO>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Put('/:id')
  @ApiOperation({ summary: 'Update an existing PLO' })
  @ApiParam({ name: 'id', description: 'ID of PLO to updated.' })
  @ApiBody({
    schema: {
      properties: {
        data: { type: 'array', items: { $ref: getSchemaPath(PLONo) } },
      },
      example: { data: exampleDataPLO },
    },
  })
  @ApiSuccessResponse(PLO, exampleAddPlo)
  @ApiUnauthorizedErrorResponse()
  async updatePLO(
    @Param('id') id: string,
    @Body() requestDTO: any,
  ): Promise<ResponseDTO<PLO>> {
    return this.service.updatePLO(id, requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<PLO>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete a PLO' })
  @ApiParam({ name: 'id', description: 'ID of PLO to deleted.' })
  @ApiSuccessResponse(null, { message: TEXT_ENUM.Success })
  @ApiUnauthorizedErrorResponse()
  @ApiErrorResponse(
    HttpStatus.NOT_FOUND,
    DESCRIPTION.NOT_FOUND,
    ERROR_ENUM.NOT_FOUND,
    'PLO Collection not found',
  )
  async deletePLO(@Param('id') id: string): Promise<ResponseDTO<any>> {
    return this.service.deletePLO(id).then((result) => {
      const responseDTO = new ResponseDTO<any>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Delete('/:id/no')
  @ApiOperation({ summary: 'Delete a PLONo from a PLO' })
  @ApiParam({ name: 'id', description: 'ID of PLO to deleted.' })
  @ApiQuery({ name: 'id', description: 'ID of PLONo to deleted.' })
  @ApiSuccessResponse(PLO)
  @ApiUnauthorizedErrorResponse()
  @ApiErrorResponse(
    HttpStatus.NOT_FOUND,
    DESCRIPTION.NOT_FOUND,
    ERROR_ENUM.NOT_FOUND,
    'PLO Collection not found',
  )
  async deletePLONo(
    @Param('id') id: string,
    @Query() requestDTO: { id: string },
  ): Promise<ResponseDTO<PLO>> {
    return this.service.deletePLONo(id, requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<PLO>();
      responseDTO.data = result;
      return responseDTO;
    });
  }
}

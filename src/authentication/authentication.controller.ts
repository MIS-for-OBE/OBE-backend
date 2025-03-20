import { Body, Controller, Post } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { LoginDTO, TokenDTO } from './dto/dto';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { Public } from 'src/auth/metadata/public.metadata';
import {
  ApiBadRequestResponse,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { DESCRIPTION, TEXT_ENUM } from 'src/common/enum/text.enum';

@ApiTags('Authentication')
@ApiExtraModels(ResponseDTO, TokenDTO)
@Controller('/authentication')
export class AuthenticationController {
  constructor(private authenticationService: AuthenticationService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'User login using CMU Account' })
  @ApiOkResponse({
    description: DESCRIPTION.SUCCESS,
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDTO) },
        {
          properties: {
            message: { type: 'string', example: TEXT_ENUM.Success },
            data: { $ref: getSchemaPath(TokenDTO) },
          },
        },
      ],
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid authorization code or redirect URI',
  })
  @ApiForbiddenResponse({
    description: 'Your CMU account does not have permission for this website',
  })
  async login(@Body() body: LoginDTO): Promise<ResponseDTO<TokenDTO>> {
    return this.authenticationService.login(body).then((result) => {
      const responseDTO = new ResponseDTO<TokenDTO>();
      responseDTO.data = result;
      return responseDTO;
    });
  }
}

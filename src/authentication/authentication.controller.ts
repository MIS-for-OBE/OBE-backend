import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { LoginDTO, TokenDTO } from './dto/dto';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { Public } from 'src/auth/metadata/public.metadata';
import { ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DESCRIPTION } from 'src/common/enum/text.enum';
import { ERROR_ENUM } from 'src/common/enum/error.enum';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
} from 'src/common/decorators/response.decorator';

@ApiTags('Authentication')
@ApiExtraModels(ResponseDTO, TokenDTO)
@Controller('/authentication')
export class AuthenticationController {
  constructor(private authenticationService: AuthenticationService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'User login using CMU Account' })
  @ApiSuccessResponse(TokenDTO)
  @ApiErrorResponse(
    HttpStatus.BAD_REQUEST,
    DESCRIPTION.BAD_REQUEST,
    ERROR_ENUM.BAD_REQUEST,
    'Cannot get EntraID access token',
  )
  @ApiErrorResponse(
    HttpStatus.FORBIDDEN,
    DESCRIPTION.FORBIDDEN,
    ERROR_ENUM.FORBIDDEN,
    'Your CMU account does not have permission for this website.',
  )
  async login(@Body() body: LoginDTO): Promise<ResponseDTO<TokenDTO>> {
    return this.authenticationService.login(body).then((result) => {
      const responseDTO = new ResponseDTO<TokenDTO>();
      responseDTO.data = result;
      return responseDTO;
    });
  }
}

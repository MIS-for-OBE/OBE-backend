import { Body, Controller, Post } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { LoginDTO, TokenDTO } from './dto/dto';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { Public } from 'src/auth/metadata/public.metadata';
import {
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';

@ApiTags('Authentication')
@ApiExtraModels(ResponseDTO, TokenDTO)
@Controller('/authentication')
export class AuthenticationController {
  constructor(private authenticationService: AuthenticationService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'User login using CMU Account' })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged in',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDTO) },
        {
          properties: {
            data: { $ref: getSchemaPath(TokenDTO) },
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid authorization code or redirect URI',
  })
  @ApiResponse({
    status: 403,
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

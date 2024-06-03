import { Body, Controller, Post } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { LoginDTO, TokenDTO } from './dto/dto';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { Public } from 'src/auth/metadata/public.metadata';

@Controller('/authentication')
export class AuthenticationController {
  constructor(private authenticationService: AuthenticationService) {}

  @Public()
  @Post('login')
  async login(@Body() body: LoginDTO): Promise<ResponseDTO<TokenDTO>> {
    return this.authenticationService.login(body).then((result) => {
      const responseDTO = new ResponseDTO<TokenDTO>();
      responseDTO.data = result;
      return responseDTO;
    });
  }
}

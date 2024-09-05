import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Request,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TQF3Service } from './service';

@Controller('/user')
@UsePipes(new ValidationPipe({ transform: true }))
export class UserController {
  constructor(private service: TQF3Service) {}
}

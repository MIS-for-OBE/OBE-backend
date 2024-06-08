import { Controller, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { SectionService } from './Section.service';
import { ErrorInterceptor } from 'src/common/interceptor/error.interceptor';

@Controller('/sections')
@UsePipes(new ValidationPipe({ transform: true }))
@UseInterceptors(new ErrorInterceptor())
export class SectionController {
  constructor(private service: SectionService) {}
}

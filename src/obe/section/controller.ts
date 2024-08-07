import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { SectionService } from './service';

@Controller('/sections')
@UsePipes(new ValidationPipe({ transform: true }))
export class SectionController {
  constructor(private service: SectionService) {}
}

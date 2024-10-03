import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TQF3, TQF3Schema } from './schemas/tqf3.schema';
import { TQF3Service } from './tqf3.service';
import { TQF3Controller } from './tqf3.controller';
import { GeneratePdfBLL } from './bll/genPdf';
import { PLO, PLOSchema } from '../plo/schemas/plo.schema';
import { PLOService } from '../plo/plo.service';
import { Faculty, FacultySchema } from '../faculty/schemas/faculty.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TQF3.name, schema: TQF3Schema },
      { name: PLO.name, schema: PLOSchema },
      { name: Faculty.name, schema: FacultySchema },
    ]),
  ],
  controllers: [TQF3Controller],
  providers: [TQF3Service, PLOService, GeneratePdfBLL],
})
export class TQF3Module {}

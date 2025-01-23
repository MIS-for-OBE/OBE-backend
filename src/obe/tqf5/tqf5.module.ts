import { Module } from '@nestjs/common';
import { TQF5, TQF5Schema } from './schemas/tqf5.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { TQF5Controller } from './tqf5.controller';
import { TQF5Service } from './tqf5.service';
import { TQF3, TQF3Schema } from '../tqf3/schemas/tqf3.schema';
import { GeneratePdfBLL } from './bll/genPdf';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TQF5.name, schema: TQF5Schema },
      { name: TQF3.name, schema: TQF3Schema },
    ]),
  ],
  controllers: [TQF5Controller],
  providers: [TQF5Service, GeneratePdfBLL],
})
export class TQF5Module {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TQF3, TQF3Schema } from './schemas/tqf3.schema';
import { TQF3Service } from './tqf3.service';
import { TQF3Controller } from './tqf3.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TQF3.name, schema: TQF3Schema }]),
  ],
  controllers: [TQF3Controller],
  providers: [TQF3Service],
})
export class TQF3Module {}

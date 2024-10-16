import { Module } from '@nestjs/common';
import { TQF5, TQF5Schema } from './schemas/tqf5.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { TQF5Controller } from './tqf5.controller';
import { TQF5Service } from './tqf5.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TQF5.name, schema: TQF5Schema }]),
  ],
  controllers: [TQF5Controller],
  providers: [TQF5Service],
})
export class TQF5Module {}

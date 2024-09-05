import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TQF3, TQF3Schema } from './schemas/schema';
import { TQF3Service } from './service';
import { TQF3Controller } from './controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TQF3.name, schema: TQF3Schema }]),
  ],
  controllers: [TQF3Controller],
  providers: [TQF3Service],
})
export class TQF3Module {}

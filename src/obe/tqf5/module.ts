import { Module } from '@nestjs/common';
import { TQF5, TQF5Schema } from './schemas/schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TQF5.name, schema: TQF5Schema }]),
  ],
  controllers: [],
  providers: [],
})
export class TQF5Module {}

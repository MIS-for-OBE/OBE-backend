import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TQF3, TQF3Schema } from './schemas/schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TQF3.name, schema: TQF3Schema }]),
  ],
  controllers: [],
  providers: [],
})
export class TQF3Module {}

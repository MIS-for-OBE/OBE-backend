import { Module } from '@nestjs/common';
import { SectionService } from './service';
import { SectionController } from './controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModel } from '../user/module';
import { Section, SectionSchema } from './schemas/schema';

export const SectionModel = {
  name: Section.name,
  schema: SectionSchema,
};

@Module({
  imports: [MongooseModule.forFeature([SectionModel, UserModel])],
  controllers: [SectionController],
  providers: [SectionService],
})
export class SectionModule {}

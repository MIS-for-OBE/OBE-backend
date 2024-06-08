import { Module } from '@nestjs/common';
import { SectionService } from './Section.service';
import { SectionController } from './Section.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModel } from '../user/user.module';
import { Section, SectionSchema } from './schemas/Section.schema';

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

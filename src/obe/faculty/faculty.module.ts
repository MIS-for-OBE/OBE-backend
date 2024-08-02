import { FacultyService } from './faculty.service';
import { FacultyController } from './faculty.controller';
import { Module } from '@nestjs/common';
import { Faculty, FacultySchema } from './schemas/faculty.schema';
import { MongooseModule } from '@nestjs/mongoose';

export const FacultyModel = {
  name: Faculty.name,
  schema: FacultySchema,
};

@Module({
  imports: [MongooseModule.forFeature([FacultyModel])],
  controllers: [FacultyController],
  providers: [FacultyService],
})
export class FacultyModule {}

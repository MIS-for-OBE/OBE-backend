import { FacultyService } from './service';
import { FacultyController } from './controller';
import { Module } from '@nestjs/common';
import { Faculty, FacultySchema } from './schemas/schema';
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

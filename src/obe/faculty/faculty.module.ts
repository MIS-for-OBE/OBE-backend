import { FacultyService } from './faculty.service';
import { FacultyController } from './faculty.controller';
import { Module } from '@nestjs/common';
import { Faculty, FacultySchema } from './schemas/faculty.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Faculty.name, schema: FacultySchema }]),
  ],
  controllers: [FacultyController],
  providers: [FacultyService],
})
export class FacultyModule {}

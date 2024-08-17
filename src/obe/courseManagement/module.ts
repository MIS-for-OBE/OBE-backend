import { Module } from '@nestjs/common';
import { CourseManagementService } from './service';
import { CourseManagementController } from './controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseManagement, CourseManagementSchema } from './schemas/schema';
import { FacultyService } from '../faculty/service';
import { Faculty, FacultySchema } from '../faculty/schemas/schema';
import { User, UserSchema } from '../user/schemas/schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: CourseManagement.name,
        schema: CourseManagementSchema,
      },
      { name: User.name, schema: UserSchema },
      {
        name: Faculty.name,
        schema: FacultySchema,
      },
    ]),
  ],
  controllers: [CourseManagementController],
  providers: [CourseManagementService, FacultyService],
})
export class CourseManagementModule {}

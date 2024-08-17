import { FacultyService } from './service';
import { FacultyController } from './controller';
import { Module } from '@nestjs/common';
import { Faculty, FacultySchema } from './schemas/schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Faculty.name,
        schema: FacultySchema,
      },
    ]),
  ],
  controllers: [FacultyController],
  providers: [FacultyService],
})
export class FacultyModule {}

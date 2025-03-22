import { Module } from '@nestjs/common';
import { ScoreService } from './score.service';
import { ScoreController } from './score.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Course, CourseSchema } from '../course/schemas/course.schema';
import { User, UserSchema } from '../user/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Course.name, schema: CourseSchema },
    ]),
  ],
  controllers: [ScoreController],
  providers: [ScoreService],
})
export class ScoreModule {}

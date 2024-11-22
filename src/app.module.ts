import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { SwaggerModule } from './swagger/swagger.module';
import { AuthModule } from './auth/auth.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './obe/user/user.module';
import { FacultyModule } from './obe/faculty/faculty.module';
import { AcademicYearModule } from './obe/academicYear/academicYear.module';
import { CourseManagementModule } from './obe/courseManagement/courseManagement.module';
import { CourseModule } from './obe/course/course.module';
import { SectionModule } from './obe/section/section.module';
import { PLOModule } from './obe/plo/plo.module';
import { TQF3Module } from './obe/tqf3/tqf3.module';
import { TQF5Module } from './obe/tqf5/tqf5.module';
import mongoose from 'mongoose';
import { globalTransformPlugin } from './common/plugins/globalTransform.plugin';
import { ScoreModule } from './obe/score/score.module';
import { StudentModule } from './obe/student/student.module';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    AuthModule,
    AuthenticationModule,

    DatabaseModule,
    UserModule,
    FacultyModule,
    AcademicYearModule,
    PLOModule,
    CourseManagementModule,
    CourseModule,
    SectionModule,
    ScoreModule,
    TQF3Module,
    TQF5Module,
    StudentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor() {
    mongoose.plugin(globalTransformPlugin);
  }
}

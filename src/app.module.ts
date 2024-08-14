import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { SwaggerModule } from './swagger/module';
import { AuthModule } from './auth/auth.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './obe/user/module';
import { FacultyModule } from './obe/faculty/module';
import { AcademicYearModule } from './obe/academicYear/module';
import { CourseManagementModule } from './obe/courseManagement/module';
import { LogEventModule } from './obe/logEvent/module';
import { CourseModule } from './obe/course/module';
import { SectionModule } from './obe/section/module';
import { PLOModule } from './obe/plo/module';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    AuthModule,
    AuthenticationModule,
    // DB
    DatabaseModule,
    UserModule,
    FacultyModule,
    PLOModule,
    LogEventModule,
    CourseManagementModule,
    AcademicYearModule,
    CourseModule,
    SectionModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { SwaggerModule } from './swagger/swagger.module';
import { AuthModule } from './auth/auth.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './obe/user/user.module';
import { AcademicYearModule } from './obe/academicYear/academicYear.module';
import { CourseManagementModule } from './obe/courseManagement/courseManagement.module';
import { LogEventModule } from './obe/logEvent/logEvent.module';
import { CourseModule } from './obe/course/course.module';
import { SectionModule } from './obe/section/section.module';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    AuthModule,
    AuthenticationModule,
    // DB
    DatabaseModule,
    UserModule,
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

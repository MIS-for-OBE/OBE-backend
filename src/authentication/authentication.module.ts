import { Module } from '@nestjs/common';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Faculty, FacultySchema } from 'src/obe/faculty/schemas/faculty.schema';
import { User, UserSchema } from 'src/obe/user/schemas/user.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Faculty.name, schema: FacultySchema },
    ]),
    AuthModule,
  ],
  controllers: [AuthenticationController],
  providers: [AuthenticationService],
})
export class AuthenticationModule {}

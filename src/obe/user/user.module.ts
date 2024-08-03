import { UserService } from './user.service';
import { UserController } from './user.controller';
import { Module } from '@nestjs/common';
import { User, UserSchema } from './schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { LogEventService } from '../logEvent/logEvent.service';
import { LogEventModel } from '../logEvent/logEvent.module';

export const UserModel = { name: User.name, schema: UserSchema };

@Module({
  imports: [MongooseModule.forFeature([UserModel, LogEventModel])],
  controllers: [UserController],
  providers: [UserService, LogEventService],
})
export class UserModule {}

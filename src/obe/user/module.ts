import { UserService } from './service';
import { UserController } from './controller';
import { Module } from '@nestjs/common';
import { User, UserSchema } from './schemas/schema';
import { MongooseModule } from '@nestjs/mongoose';
import { LogEventService } from '../logEvent/service';
import { LogEventModel } from '../logEvent/module';

export const UserModel = { name: User.name, schema: UserSchema };

@Module({
  imports: [MongooseModule.forFeature([UserModel, LogEventModel])],
  controllers: [UserController],
  providers: [UserService, LogEventService],
})
export class UserModule {}

import { UserService } from './user.service';
import { UserController } from './user.controller';
import { Module } from '@nestjs/common';
import { User, UserSchema } from './schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { LogEventService } from '../logEvent/logEvent.service';
import { LogEvent, LogEventSchema } from '../logEvent/schemas/logEvent.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      {
        name: LogEvent.name,
        schema: LogEventSchema,
      },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, LogEventService],
})
export class UserModule {}

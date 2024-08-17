import { UserService } from './service';
import { UserController } from './controller';
import { Module } from '@nestjs/common';
import { User, UserSchema } from './schemas/schema';
import { MongooseModule } from '@nestjs/mongoose';
import { LogEventService } from '../logEvent/service';
import { LogEvent, LogEventSchema } from '../logEvent/schemas/schema';

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

import { Module } from '@nestjs/common';
import { PLOController } from './controller';
import { PLOService } from './service';
import { MongooseModule } from '@nestjs/mongoose';
import { PLO, PLOSchema } from './schemas/schema';
import { LogEventService } from '../logEvent/service';
import { User, UserSchema } from '../user/schemas/schema';
import { LogEvent, LogEventSchema } from '../logEvent/schemas/schema';
import { Faculty, FacultySchema } from '../faculty/schemas/schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: PLO.name,
        schema: PLOSchema,
      },
      {
        name: Faculty.name,
        schema: FacultySchema,
      },
      { name: User.name, schema: UserSchema },
      {
        name: LogEvent.name,
        schema: LogEventSchema,
      },
    ]),
  ],
  controllers: [PLOController],
  providers: [PLOService, LogEventService],
})
export class PLOModule {}

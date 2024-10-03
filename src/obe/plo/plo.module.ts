import { Module } from '@nestjs/common';
import { PLOController } from './plo.controller';
import { PLOService } from './plo.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PLO, PLOSchema } from './schemas/plo.schema';
import { LogEventService } from '../logEvent/logEvent.service';
import { User, UserSchema } from '../user/schemas/user.schema';
import { LogEvent, LogEventSchema } from '../logEvent/schemas/logEvent.schema';
import { Faculty, FacultySchema } from '../faculty/schemas/faculty.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PLO.name, schema: PLOSchema },
      { name: Faculty.name, schema: FacultySchema },
      { name: User.name, schema: UserSchema },
      { name: LogEvent.name, schema: LogEventSchema },
    ]),
  ],
  controllers: [PLOController],
  providers: [PLOService, LogEventService],
})
export class PLOModule {}

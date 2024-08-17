import { Module } from '@nestjs/common';
import { LogEventService } from './service';
import { LogEventController } from './controller';
import { MongooseModule } from '@nestjs/mongoose';
import { LogEvent, LogEventSchema } from './schemas/schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: LogEvent.name,
        schema: LogEventSchema,
      },
    ]),
  ],
  controllers: [LogEventController],
  providers: [LogEventService],
})
export class LogEventModule {}

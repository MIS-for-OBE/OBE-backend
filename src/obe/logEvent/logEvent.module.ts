import { Module } from '@nestjs/common';
import { LogEventService } from './logEvent.service';
import { LogEventController } from './logEvent.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { LogEvent, LogEventSchema } from './schemas/logEvent.schema';

export const LogEventModel = {
  name: LogEvent.name,
  schema: LogEventSchema,
};

@Module({
  imports: [MongooseModule.forFeature([LogEventModel])],
  controllers: [LogEventController],
  providers: [LogEventService],
})
export class LogEventModule {}

import { Module } from '@nestjs/common';
import { LogEventService } from './service';
import { LogEventController } from './controller';
import { MongooseModule } from '@nestjs/mongoose';
import { LogEvent, LogEventSchema } from './schemas/schema';

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

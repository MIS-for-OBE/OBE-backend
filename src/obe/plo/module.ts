import { Module } from '@nestjs/common';
import { PLOController } from './controller';
import { PLOService } from './service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModel } from '../user/module';
import { PLO, PLOSchema } from './schemas/schema';
import { LogEventModel } from '../logEvent/module';
import { LogEventService } from '../logEvent/service';
import { FacultyModel } from '../faculty/module';

export const PLOModel = {
  name: PLO.name,
  schema: PLOSchema,
};

@Module({
  imports: [
    MongooseModule.forFeature([
      PLOModel,
      FacultyModel,
      UserModel,
      // CourseModel,
      // CourseManagementModel,
      LogEventModel,
    ]),
  ],
  controllers: [PLOController],
  providers: [PLOService, LogEventService],
})
export class PLOModule {}

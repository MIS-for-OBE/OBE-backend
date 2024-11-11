import { Module } from '@nestjs/common';
import { PLOController } from './plo.controller';
import { PLOService } from './plo.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PLO, PLOSchema } from './schemas/plo.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { Faculty, FacultySchema } from '../faculty/schemas/faculty.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PLO.name, schema: PLOSchema },
      { name: Faculty.name, schema: FacultySchema },
    ]),
  ],
  controllers: [PLOController],
  providers: [PLOService],
})
export class PLOModule {}

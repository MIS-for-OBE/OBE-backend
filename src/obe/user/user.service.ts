import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { ROLE } from 'src/common/enum/role.enum';
import { LogEventService } from '../logEvent/logEvent.service';
import { LogEventDTO } from '../logEvent/dto/dto';
import { LOG_EVENT_TYPE } from 'src/common/enum/type.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly model: Model<User>,
    private readonly logEventService: LogEventService,
  ) {}

  async getUserInfo(id: string): Promise<User> {
    return await this.model.findById(id);
  }

  async getInstructor(): Promise<User[]> {
    return await this.model
      .find({ role: { $ne: ROLE.STUDENT } })
      .sort([['firstNameEN', 'asc']]);
  }

  async updateUser(id: string, data: any): Promise<User> {
    return await this.model.findByIdAndUpdate(id, { ...data }, { new: true });
  }

  async updateAdmin(id: string, data: any): Promise<User> {
    const res = await this.model.findByIdAndUpdate(
      data.id,
      { role: data.role },
      { new: true },
    );
    const logEventDTO = new LogEventDTO();
    this.setLogEvent(
      logEventDTO,
      res.role == ROLE.ADMIN ? 'Add' : 'Delete',
      `${res.firstNameEN} ${res.lastNameEN}`,
    );
    await this.logEventService.createLogEvent(id, logEventDTO);
    return res;
  }

  async updateSAdmin(id: string, data: any): Promise<any> {
    const user = await this.model.findByIdAndUpdate(
      id,
      { role: ROLE.ADMIN },
      { new: true },
    );
    const newSAdmin = await this.model.findByIdAndUpdate(
      data.id,
      { role: ROLE.SUPREME_ADMIN },
      { new: true },
    );
    const logEventDTO = new LogEventDTO();
    this.setLogEvent(
      logEventDTO,
      'Change',
      `${newSAdmin.firstNameEN} ${newSAdmin.lastNameEN}`,
      'to S. Admin',
    );
    await this.logEventService.createLogEvent(id, logEventDTO);
    return { user, newSAdmin };
  }

  private setLogEvent(
    logEventDTO: LogEventDTO,
    action: string,
    user: string,
    explain?: string,
  ) {
    logEventDTO.type = LOG_EVENT_TYPE.ADMIN;
    logEventDTO.event = `${action} ${user}`;
    if (explain) logEventDTO.event += ` ${explain}`;
  }
}

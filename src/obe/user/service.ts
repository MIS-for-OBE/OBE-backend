import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/schema';
import { Model } from 'mongoose';
import { ROLE } from 'src/common/enum/role.enum';
import { LogEventService } from '../logEvent/service';
import { LogEventDTO } from '../logEvent/dto/dto';
import { LOG_EVENT_TYPE } from 'src/common/enum/type.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly model: Model<User>,
    private readonly logEventService: LogEventService,
  ) {}

  async getUserInfo(id: string): Promise<User> {
    try {
      return await this.model.findById(id);
    } catch (error) {
      throw error;
    }
  }

  async getInstructor(): Promise<User[]> {
    try {
      return await this.model
        .find({ role: { $ne: ROLE.STUDENT } })
        .sort([['firstNameEN', 'asc']]);
    } catch (error) {
      throw error;
    }
  }

  async updateUser(id: string, data: any): Promise<User> {
    try {
      return await this.model.findByIdAndUpdate(id, { ...data }, { new: true });
    } catch (error) {
      throw error;
    }
  }

  async updateAdmin(id: string, data: any): Promise<User> {
    try {
      let res;
      if (data.id) {
        res = await this.updateUserRoleById(data.id, data.role);
      } else {
        res = await this.updateOrCreateUserByEmail(data.email, data.role);
      }
      const logEventDTO = new LogEventDTO();
      this.setLogEvent(
        logEventDTO,
        res.role == ROLE.ADMIN ? 'Add' : 'Delete',
        res.firstNameEN
          ? `${res.firstNameEN} ${res.lastNameEN}`
          : `${res.email}`,
      );
      // await this.logEventService.createLogEvent(id, logEventDTO);
      return res;
    } catch (error) {
      throw error;
    }
  }

  async updateSAdmin(id: string, data: any): Promise<any> {
    try {
      const user = await this.updateUserRoleById(id, ROLE.ADMIN);
      const newSAdmin = await this.updateUserRoleById(
        data.id,
        ROLE.SUPREME_ADMIN,
      );
      const logEventDTO = new LogEventDTO();
      this.setLogEvent(
        logEventDTO,
        'Change',
        `${newSAdmin.firstNameEN} ${newSAdmin.lastNameEN}`,
        'to S. Admin',
      );
      // await this.logEventService.createLogEvent(id, logEventDTO);
      return { user, newSAdmin };
    } catch (error) {
      throw error;
    }
  }

  private async updateUserRoleById(
    userId: string,
    role: string,
  ): Promise<User> {
    try {
      return this.model.findByIdAndUpdate(userId, { role }, { new: true });
    } catch (error) {
      throw error;
    }
  }

  private async updateOrCreateUserByEmail(
    email: string,
    role: string,
  ): Promise<User> {
    try {
      let user = await this.model.findOne({ email });
      if (user) {
        if (user.role == role) {
          throw new BadRequestException(
            `${user.firstNameEN ? `${user.firstNameEN} ${user.lastNameEN}` : `${email}`} is already an admin`,
          );
        }
        user = await this.model.findOneAndUpdate(
          { email },
          { role },
          { new: true },
        );
      } else {
        user = await this.model.create({ email, role });
      }
      return user;
    } catch (error) {
      throw error;
    }
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

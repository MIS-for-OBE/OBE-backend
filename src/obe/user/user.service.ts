import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { ROLE } from 'src/common/enum/role.enum';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly model: Model<User>,
    private readonly authService: AuthService,
  ) {}

  async getUserInfo(id: string): Promise<User> {
    try {
      return await this.model.findById(id);
    } catch (error) {
      throw error;
    }
  }

  async termsOfService(id: string, body: { agree: boolean }): Promise<any> {
    try {
      if (!body.agree) {
        const user = await this.model.findById(id);
        if (user.role !== ROLE.STUDENT || !user.studentId) {
          await this.model.findByIdAndDelete(id);
        }
      } else {
        const user = await this.model.findByIdAndUpdate(
          id,
          { termsOfService: true },
          { new: true },
        );
        const dataRs = await this.authService.generateJWTToken(user);
        dataRs.user = user;
        return dataRs;
      }
      return { message: 'ok' };
    } catch (error) {
      throw error;
    }
  }

  async getInstructor(): Promise<User[]> {
    try {
      return await this.model
        .find({ role: { $ne: ROLE.STUDENT } })
        .sort({ firstNameEN: 'asc' });
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

  async updateCurrAdmin(data: any): Promise<User> {
    try {
      let res;
      if (data.id) {
        res = await this.updateUserById(data.id, data.role, data.curriculums);
      } else {
        res = await this.updateOrCreateUserByEmail(
          data.email,
          data.role,
          data.curriculums,
        );
      }

      return res;
    } catch (error) {
      throw error;
    }
  }

  async updateAdmin(id: string, data: any): Promise<any> {
    try {
      const user = await this.updateUserById(
        id,
        ROLE.CURRICULUM_ADMIN,
        data.curriculums,
      );
      const newAdmin = await this.updateUserById(data.id, ROLE.ADMIN, []);

      return { user, newAdmin };
    } catch (error) {
      throw error;
    }
  }

  private async updateUserById(
    userId: string,
    role: string,
    curriculums: string[] | undefined,
  ): Promise<User> {
    try {
      const update: any = { role };
      const unset: any = {};
      if (curriculums?.length) {
        update.curriculums = curriculums;
      } else {
        unset.curriculums = 1;
      }
      return await this.model.findByIdAndUpdate(
        userId,
        { $set: update, $unset: unset },
        { new: true },
      );
    } catch (error) {
      throw error;
    }
  }

  private async updateOrCreateUserByEmail(
    email: string,
    role: string,
    curriculums: string[],
  ): Promise<User> {
    try {
      let user = await this.model.findOne({ email });
      if (user) {
        if (user.role == ROLE.ADMIN) {
          throw new BadRequestException(
            `Cannot change the role of ${user.firstNameEN ? `${user.firstNameEN} ${user.lastNameEN}` : `${email}`}`,
          );
        }
        user = await this.model.findOneAndUpdate(
          { email },
          { role, curriculums },
          { new: true },
        );
      } else {
        user = await this.model.create({ email, role, curriculums });
      }
      return user;
    } catch (error) {
      throw error;
    }
  }
}

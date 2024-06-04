import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private readonly model: Model<User>) {}

  async getUserInfo(id: string): Promise<User> {
    return await this.model.findById(id);
  }

  async updateUser(id: string, data: any): Promise<User> {
    return await this.model.findByIdAndUpdate(id, { ...data }, { new: true });
  }
}

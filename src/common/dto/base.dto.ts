import { Document } from 'mongoose';

export class BaseDTO {
  constructor(data?: any) {
    if (!data) {
      return;
    }
    if (data instanceof Document) {
      Object.assign(this, data.toObject());
      return;
    }

    Object.assign(this, data);
  }
}

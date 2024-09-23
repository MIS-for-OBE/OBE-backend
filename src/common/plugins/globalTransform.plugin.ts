import { Schema } from 'mongoose';

export const globalTransformPlugin = (schema: Schema) => {
  schema.set('versionKey', false);
  // Apply the transform function to the schema
  schema.set('toJSON', {
    transform(doc, ret) {
      // Convert _id to id
      ret.id = ret._id;
      delete ret._id;

      // Check if there's a schedule field and convert _id to id inside it
      if (ret.schedule && Array.isArray(ret.schedule)) {
        ret.schedule = ret.schedule.map((item) => {
          if (item._id) {
            item.id = item._id;
            delete item._id;
          }
          return item;
        });
      }
    },
  });
};

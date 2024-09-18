import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { COURSE_TYPE, TQF_STATUS } from 'src/common/enum/type.enum';
import { Course } from '../course/schemas/course.schema';
import { Section } from '../section/schemas/section.schema';
import { TQF3 } from '../tqf3/schemas/tqf3.schema';
import { TQF5 } from '../tqf5/schemas/tqf5.schema';

@Injectable()
export class TQFReferenceMiddleware implements NestMiddleware {
  constructor(
    @InjectModel(TQF3.name) private tqf3Model: Model<TQF3>,
    @InjectModel(TQF5.name) private tqf5Model: Model<TQF5>,
    @InjectModel(Course.name) private courseModel: Model<Course>,
    @InjectModel(Section.name) private sectionModel: Model<Section>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const { body } = req;
      const { sections, type } = body as Course;

      if (type !== COURSE_TYPE.SEL_TOPIC) {
        const tqf3 = await this.tqf3Model.create({
          status: TQF_STATUS.NO_DATA,
        });
        const tqf5 = await this.tqf5Model.create({
          status: TQF_STATUS.NO_DATA,
        });
        body.TQF5 = tqf3.id;
        body.TQF5 = tqf5.id;
      } else {
        const tqf3List = await this.tqf3Model.insertMany(
          sections.map(() => ({ status: TQF_STATUS.NO_DATA })),
        );
        const tqf5List = await this.tqf5Model.insertMany(
          sections.map(() => ({ status: TQF_STATUS.NO_DATA })),
        );
        sections.forEach((section, index) => {
          section.TQF3 = tqf3List[index].id;
          section.TQF5 = tqf5List[index].id;
        });
      }

      next();
    } catch (error) {
      next(error);
      // res
      //   .status(500)
      //   .json({ message: 'Failed to process TQF references', error });
    }
  }

  async removeReferences(sectionId: string) {
    try {
      const section = await this.sectionModel.findById(sectionId);
      if (section) {
        await this.tqf3Model.findByIdAndDelete(section.TQF3);
        await this.tqf5Model.findByIdAndDelete(section.TQF5);
      }
    } catch (error) {
      throw error;
    }
  }
}

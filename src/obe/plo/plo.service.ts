import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PLO, PLONo } from './schemas/plo.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { TEXT_ENUM } from 'src/common/enum/text.enum';
import { Course } from '../course/schemas/course.schema';
import { CourseManagement } from '../courseManagement/schemas/courseManagement.schema';
import { PLOSearchDTO } from './dto/search.dto';

@Injectable()
export class PLOService {
  constructor(
    @InjectModel(PLO.name) private readonly model: Model<PLO>,
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    @InjectModel(CourseManagement.name)
    private readonly courseManagementModel: Model<CourseManagement>,
  ) {}

  async searchPLO(
    facultyCode: string,
    searchDTO: { curriculum: string[] },
  ): Promise<any> {
    try {
      const where: any = {};
      if (facultyCode) {
        where.facultyCode = facultyCode;
      }
      if (searchDTO.curriculum) {
        where.curriculum = { $in: searchDTO.curriculum };
      }
      const totalCount = await this.model.countDocuments(where);
      const data: any = await this.model.find(where).sort({ name: 'asc' });
      if (data && data.length) {
        for (const plo of data) {
          plo.data.sort((a, b) => a.no - b.no);
          const [course, courseManagement] = await Promise.all([
            this.courseModel
              .find({ ['sections.curriculum']: { $in: plo.curriculum } })
              .select('sections.curriculum'),
            this.courseManagementModel
              .find({ ['sections.curriculum']: { $in: plo.curriculum } })
              .select('sections.curriculum'),
          ]);
          const allCurriculumCodes = new Set([
            ...course.flatMap(({ sections }) =>
              sections.flatMap((section) => section.curriculum).filter(Boolean),
            ),
            ...courseManagement.flatMap(({ sections }) =>
              sections.flatMap((section) => section.curriculum).filter(Boolean),
            ),
          ]);
          if (!plo.curriculum.length) plo._doc.canEdit = true;
          plo.curriculum.forEach((cur) => {
            plo._doc.canEdit = allCurriculumCodes.has(cur);
          });
        }
      }

      return { totalCount, plos: data };
    } catch (error) {
      throw error;
    }
  }

  async searchOnePLO(facultyCode: string, searchDTO: any): Promise<any> {
    try {
      const where: any = { facultyCode };
      if (searchDTO.name) {
        where.name = searchDTO.name;
      } else if (searchDTO.curriculum) {
        where.curriculum = searchDTO.curriculum;
      }
      const plo: any = await this.model.findOne(where);
      if (plo && plo.data) {
        plo.data.sort((a, b) => a.no - b.no);
        const [course, courseManagement] = await Promise.all([
          this.courseModel
            .find({ ['sections.curriculum']: { $in: plo.curriculum } })
            .select('sections.curriculum'),
          this.courseManagementModel
            .find({ ['sections.curriculum']: { $in: plo.curriculum } })
            .select('sections.curriculum'),
        ]);
        const allCurriculumCodes = new Set([
          ...course.flatMap(({ sections }) =>
            sections.flatMap((section) => section.curriculum).filter(Boolean),
          ),
          ...courseManagement.flatMap(({ sections }) =>
            sections.flatMap((section) => section.curriculum).filter(Boolean),
          ),
        ]);
        if (!plo.curriculum.length) plo._doc.canEdit = true;
        plo.curriculum.forEach((cur) => {
          plo._doc.canEdit = allCurriculumCodes.has(cur);
        });
      }
      return plo || {};
    } catch (error) {
      throw error;
    }
  }

  async checkCanCreatePLO(requestDTO: { name: string }): Promise<any> {
    try {
      const existPLO = await this.model.findOne({ name: requestDTO.name });
      if (existPLO) {
        throw new BadRequestException({
          title: 'PLO name existing',
          message: `${existPLO.name} already exist.`,
        });
      }
      return { massage: TEXT_ENUM.Success };
    } catch (error) {
      throw error;
    }
  }

  async createPLO(requestDTO: any): Promise<PLO> {
    try {
      return await this.model.create(requestDTO);
    } catch (error) {
      throw error;
    }
  }

  async createPLONo(id: string, requestDTO: PLONo): Promise<PLO> {
    try {
      const updatePLO: any = await this.model.findByIdAndUpdate(
        id,
        { $push: { data: requestDTO } },
        { new: true },
      );
      updatePLO._doc.canEdit = true;
      return updatePLO;
    } catch (error) {
      throw error;
    }
  }

  async updatePLO(id: string, requestDTO: any): Promise<PLO> {
    try {
      const updateFields: any = {};
      const arrayFilters: any[] = [];

      requestDTO.data.forEach((item: any, index: number) => {
        updateFields[`data.$[elem${index}].no`] = item.no;
        updateFields[`data.$[elem${index}].descTH`] = item.descTH;
        updateFields[`data.$[elem${index}].descEN`] = item.descEN;
        arrayFilters.push({ [`elem${index}._id`]: item.id });
      });

      const updatePLO: any = await this.model.findOneAndUpdate(
        { _id: id },
        { $set: updateFields },
        { arrayFilters, new: true },
      );
      if (updatePLO && updatePLO.data) {
        updatePLO.data.sort((a, b) => a.no - b.no);
      }
      updatePLO._doc.canEdit = true;
      return updatePLO;
    } catch (error) {
      throw error;
    }
  }

  async deletePLO(id: string): Promise<any> {
    try {
      const deletePLO = await this.model.findByIdAndDelete(id);
      if (!deletePLO) {
        throw new NotFoundException('PLO Collection not found');
      }
      return { massage: TEXT_ENUM.Success };
    } catch (error) {
      throw error;
    }
  }

  async deletePLONo(id: string, requestDTO: { id: string }): Promise<PLO> {
    try {
      const updatePLO: any = await this.model.findByIdAndUpdate(
        id,
        { $pull: { data: { _id: requestDTO.id } } },
        { new: true },
      );
      if (!updatePLO) {
        throw new NotFoundException('PLO Collection not found');
      }
      updatePLO._doc.canEdit = true;
      return updatePLO;
    } catch (error) {
      throw error;
    }
  }
}

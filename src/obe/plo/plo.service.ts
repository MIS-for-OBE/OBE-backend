import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PLO } from './schemas/plo.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ROLE } from 'src/common/enum/role.enum';
import { Faculty } from '../faculty/schemas/faculty.schema';
import { sortData } from 'src/common/function/function';
import { TEXT_ENUM } from 'src/common/enum/text.enum';

@Injectable()
export class PLOService {
  constructor(
    @InjectModel(PLO.name) private readonly model: Model<PLO>,
    @InjectModel(Faculty.name) private readonly facultyModel: Model<Faculty>,
  ) {}
  async searchPLO(facultyCode: string, searchDTO: any): Promise<any> {
    try {
      const isSAdmin = searchDTO.role == ROLE.SUPREME_ADMIN;
      const where: any = { facultyCode };
      if (!isSAdmin) {
        where.curriculum = { $in: searchDTO.curriculum };
      }
      if (searchDTO.manage) {
        where.isActive = true;
      }
      const faculty = await this.facultyModel.findOne({ facultyCode });
      const totalCount = await this.model.countDocuments(where);
      const data = await this.model
        .find(where)
        .sort({ year: 'desc', semester: 'desc' });
      if (data && data.length) {
        data.forEach((plo) => {
          plo.data.sort((a, b) => a.no - b.no);
        });
      }
      if (searchDTO.manage || searchDTO.all) {
        return { totalCount, plos: data };
      }
      const curCodes = isSAdmin
        ? faculty.curriculum.map(({ code }) => code)
        : searchDTO.curriculum;
      const plos = curCodes.map((cur) => {
        return {
          ...faculty.curriculum.find(({ code }) => code == cur),
          collections: [],
        };
      });
      plos.forEach((plo: any) => {
        data.forEach((collection) => {
          if (collection.curriculum.includes(plo.code)) {
            plo.collections.push(collection);
          }
        });
      });
      const filteredPLOs = plos.filter((plo) => plo.collections.length > 0);
      sortData(filteredPLOs, 'curriculumEN', 'string');
      return { totalCount, plos: filteredPLOs };
    } catch (error) {
      throw error;
    }
  }

  async searchOnePLO(facultyCode: string, searchDTO: any): Promise<any> {
    try {
      const filter: any = {};
      if (searchDTO.name) {
        filter.name = searchDTO.name;
      } else {
        filter.year = { $lte: searchDTO.year };
        filter.semester = { $lte: searchDTO.semester };
        if (searchDTO.curriculum) {
          filter.curriculum = searchDTO.curriculum;
        }
      }
      const plosMatch = await this.model
        .find(filter)
        .sort({ year: 'desc', semester: 'desc' });
      const plo = searchDTO.name
        ? plosMatch[0]
        : plosMatch.find(
            (item) =>
              item.year <= searchDTO.year &&
              item.semester <= searchDTO.semester,
          );
      if (plo && plo.data) {
        plo.data.sort((a, b) => a.no - b.no);
      }
      return plo || {};
    } catch (error) {
      throw error;
    }
  }

  async checkCanCreatePLO(requestDTO: any): Promise<any> {
    try {
      const existPLO = await this.model.findOne({ name: requestDTO.name });
      if (existPLO) {
        throw new BadRequestException({
          title: 'PLO name existing',
          message: `${existPLO.name} already exist.`,
        });
      }
      return TEXT_ENUM.Success;
    } catch (error) {
      throw error;
    }
  }

  async createPLO(requestDTO: any): Promise<PLO> {
    try {
      const existPloWithCur = await this.model.find({
        semester: requestDTO.semester,
        year: requestDTO.year,
      });
      if (existPloWithCur) {
        const existCur = [];
        existPloWithCur.forEach((plo) => {
          requestDTO.curriculum.forEach((cur) => {
            if (plo.curriculum.includes(cur) && !existCur.includes(cur))
              existCur.push(cur);
          });
        });
        if (existCur.length) {
          throw new BadRequestException({
            title: `Curriculum PLO Conflict`,
            message: `${existCur.join(', ')} already exist PLO for semester ${requestDTO.semester}/${requestDTO.year}.`,
          });
        }
      }
      const newPLO = await this.model.create(requestDTO);
      return newPLO;
    } catch (error) {
      throw error;
    }
  }

  async createPLONo(id: string, requestDTO: any): Promise<PLO> {
    try {
      const updatePLO = await this.model.findByIdAndUpdate(
        id,
        { $push: { data: requestDTO } },
        { new: true },
      );
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

      const updatePLO = await this.model.findOneAndUpdate(
        { _id: id },
        { $set: updateFields },
        { arrayFilters, new: true },
      );
      if (updatePLO && updatePLO.data) {
        updatePLO.data.sort((a, b) => a.no - b.no);
      }

      return updatePLO;
    } catch (error) {
      throw error;
    }
  }

  async deletePLO(id: string): Promise<PLO> {
    try {
      const deletePLO = await this.model.findByIdAndDelete(id);
      if (!deletePLO) {
        throw new NotFoundException('PLO Collection not found');
      }
      return deletePLO;
    } catch (error) {
      throw error;
    }
  }

  async deletePLONo(id: string, requestDTO: any): Promise<PLO> {
    try {
      const updatePLO = await this.model.findByIdAndUpdate(
        id,
        { $pull: { data: { _id: requestDTO.id } } },
        { new: true },
      );
      if (!updatePLO) {
        throw new NotFoundException('PLO Collection not found');
      }
      return updatePLO;
    } catch (error) {
      throw error;
    }
  }
}

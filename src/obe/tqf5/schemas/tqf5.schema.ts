import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { METHOD_TQF5, TQF_STATUS } from 'src/common/enum/type.enum';
import { CLO, Eval } from 'src/obe/tqf3/schemas/tqf3.schema';

@Schema()
export class Part1TQF5Curriculum {
  @Prop()
  curriculum: string | null;

  @Prop({
    type: [
      {
        sectionNo: Number,
        A: Number,
        Bplus: Number,
        B: Number,
        Cplus: Number,
        C: Number,
        Dplus: Number,
        D: Number,
        F: Number,
        W: Number,
        S: Number,
        U: Number,
        P: Number,
      },
    ],
    _id: false,
  })
  courseEval: {
    sectionNo: number;
    A: number;
    Bplus: number;
    B: number;
    Cplus: number;
    C: number;
    Dplus: number;
    D: number;
    F: number;
    W: number;
    S: number;
    U: number;
    P: number;
  }[];

  @Prop({
    type: {
      A: String,
      Bplus: String,
      B: String,
      Cplus: String,
      C: String,
      Dplus: String,
      D: String,
      F: String,
      W: String,
      S: String,
      U: String,
    },
    _id: false,
  })
  gradingCriteria: {
    A: string;
    Bplus: string;
    B: string;
    Cplus: string;
    C: string;
    Dplus: string;
    D: string;
    F: string;
    W: string;
    S: string;
    U: string;
  };

  @Prop()
  abnormalScoreFactor: string;

  @Prop()
  reviewingSLO: string;
}

export const Part1TQF5CurriculumSchema =
  SchemaFactory.createForClass(Part1TQF5Curriculum);

export type Part1TQF5 = Part1;
@Schema({
  timestamps: { createdAt: false, updatedAt: true },
})
class Part1 {
  @Prop({ type: [Part1TQF5Curriculum], _id: false })
  list: Part1TQF5Curriculum[];
}
const Part1Schema = SchemaFactory.createForClass(Part1);

export type Part2TQF5 = Part2;
@Schema({
  timestamps: { createdAt: false, updatedAt: true },
})
class Part2 {
  @Prop({
    type: [
      {
        clo: { type: mongoose.Schema.Types.ObjectId, ref: 'CLO' },
        assignments: {
          type: [
            {
              eval: { type: mongoose.Schema.Types.ObjectId, ref: 'Eval' },
              questions: { type: [String] },
            },
          ],
          _id: false,
        },
      },
    ],
    _id: false,
  })
  data: {
    clo: CLO;
    assignments: { eval: Eval; questions: string[] }[];
  }[];
}
const Part2Schema = SchemaFactory.createForClass(Part2);

export type Part3TQF5 = Part3;
@Schema({
  timestamps: { createdAt: false, updatedAt: true },
})
class Part3 {
  @Prop({
    type: [
      {
        clo: { type: mongoose.Schema.Types.ObjectId, ref: 'CLO' },
        assess: {
          type: [
            {
              eval: String,
              sheet: [String],
              percent: Number,
              fullScore: Number,
              range0: Number,
              range1: Number,
              range2: Number,
              range3: Number,
            },
          ],
        },
        sections: {
          type: [
            {
              sectionNo: Number,
              score0: Number,
              score1: Number,
              score2: Number,
              score3: Number,
              score4: Number,
            },
          ],
          _id: false,
        },
        score: { type: Number },
      },
    ],
    _id: false,
  })
  data: {
    clo: CLO;
    assess: {
      eval: string;
      sheet: string[];
      percent: number;
      fullScore: number;
      range0: number;
      range1: number;
      range2: number;
      range3: number;
    }[];
    sections: {
      sectionNo: number;
      score0: number;
      score1: number;
      score2: number;
      score3: number;
      score4: number;
    }[];
    score: number;
  }[];
}
const Part3Schema = SchemaFactory.createForClass(Part3);

export type TQF5Document = HydratedDocument<TQF5>;
@Schema({
  timestamps: { createdAt: false, updatedAt: true },
})
export class TQF5 {
  @Prop({ required: true, enum: TQF_STATUS })
  status: TQF_STATUS;

  @Prop({ enum: TQF_STATUS })
  method?: METHOD_TQF5;

  @Prop({
    type: [
      {
        eval: { type: String },
        assignment: { type: [String] },
      },
    ],
    _id: false,
  })
  assignmentsMap?: { eval: string; assignment: string[] }[];

  @Prop({ type: Part1Schema, _id: false })
  part1?: Part1;

  @Prop({ type: Part2Schema, _id: false })
  part2?: Part2;

  @Prop({ type: Part3Schema, _id: false })
  part3?: Part3;
}

export const TQF5Schema = SchemaFactory.createForClass(TQF5);

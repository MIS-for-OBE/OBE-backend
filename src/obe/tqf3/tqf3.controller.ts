import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Request,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TQF3Service } from './tqf3.service';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { TQF3 } from './schemas/tqf3.schema';
import * as fs from 'fs';

@Controller('/tqf3')
@UsePipes(new ValidationPipe({ transform: true }))
export class TQF3Controller {
  constructor(private service: TQF3Service) {}

  @Put('/:id/:part')
  async updateCourse(
    @Param() params: { id: string; part: string },
    @Body() requestDTO: any,
  ): Promise<ResponseDTO<TQF3>> {
    return this.service.saveEachPart(params, requestDTO).then((result) => {
      const responseDTO = new ResponseDTO<TQF3>();
      responseDTO.data = result;
      return responseDTO;
    });
  }

  @Get('pdf')
  async downloadPDF(@Res() res): Promise<void> {
    try {
      const filePath = await this.service.generatePDF();

      // Check if the file path is valid and file exists
      if (!filePath || !fs.existsSync(filePath)) {
        return res
          .status(400)
          .json({ message: 'File not found or path is invalid' });
      }

      // Set headers and send the file
      res.setHeader('Content-disposition', 'attachment; filename=output.pdf');
      res.setHeader('Content-type', 'application/pdf');

      // Send the PDF file
      res.sendFile(filePath, { root: process.cwd() }, (err) => {
        if (err) {
          console.error('Error while sending file:', err);
          return res.status(500).send('Error sending the file.');
        }

        // Optionally remove the file after sending
        fs.unlinkSync(filePath);
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      res
        .status(500)
        .json({ message: 'Error generating PDF', error: error.message });
    }
  }
}

import { ApiOkResponse, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { DESCRIPTION, TEXT_ENUM } from '../enum/text.enum';
import { applyDecorators } from '@nestjs/common';
import { ResponseDTO } from '../dto/response.dto';

/**
 * Custom decorator for success responses.
 * @param model The DTO model for the `data` field.
 * @param exampleMessage An optional example message.
 */
export function ApiSuccessResponse(
  model: any,
  exampleMessage = TEXT_ENUM.Success,
) {
  return applyDecorators(
    ApiOkResponse({
      description: DESCRIPTION.SUCCESS,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ResponseDTO) },
          {
            properties: {
              message: { type: 'string', example: exampleMessage },
              data: { $ref: getSchemaPath(model) },
            },
          },
        ],
      },
    }),
  );
}

/**
 * Custom decorator for error responses.
 * @param statusCode HTTP status code
 * @param description Description of the error response
 * @param errorType Type of error
 * @param exampleMessage Example error message
 */
export function ApiErrorResponse(
  statusCode: number,
  description: string,
  errorType: string,
  exampleMessage: string,
) {
  return ApiResponse({
    status: statusCode,
    description,
    schema: {
      properties: {
        message: {
          description:
            'The error message providing additional details about the error.',
          type: 'string',
          example: exampleMessage,
        },
        error: {
          description:
            'The error type or category (e.g., Bad Request, Forbidden).',
          type: 'string',
          example: errorType,
        },
        statusCode: {
          description: 'The HTTP status code associated with the error.',
          type: 'number',
          example: statusCode,
        },
      },
    },
  });
}

import { ApiOkResponse, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { DESCRIPTION, TEXT_ENUM } from '../enum/text.enum';
import { applyDecorators } from '@nestjs/common';

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
        properties: {
          message: { type: 'string', example: exampleMessage },
          data: { $ref: getSchemaPath(model) },
        },
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
  exampleMessages: string[],
) {
  return ApiResponse({
    status: statusCode,
    description,
    // schema: {
    //   properties: {
    //     message: {
    //       description:
    //         'The error message providing additional details about the error.',
    //       type: 'string',
    //     },
    //     error: {
    //       description:
    //         'The error type or category (e.g., Bad Request, Forbidden).',
    //       type: 'string',
    //     },
    //     statusCode: {
    //       description: 'The HTTP status code associated with the error.',
    //       type: 'number',
    //     },
    //   },
    // },
    content: {
      'application/json': {
        examples: exampleMessages.reduce((acc, msg, index) => {
          acc[`example${index + 1}`] = {
            summary: `Example ${index + 1}`,
            value: {
              message: msg,
              error: errorType,
              statusCode: statusCode,
            },
          };
          return acc;
        }, {}),
      },
    },
  });
}

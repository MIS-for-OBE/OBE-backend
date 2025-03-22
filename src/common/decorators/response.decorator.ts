import { ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { DESCRIPTION, TEXT_ENUM } from '../enum/text.enum';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ERROR_ENUM } from '../enum/error.enum';
import { isObject } from 'lodash';

/**
 * Custom decorator for success responses.
 * @param model The DTO model for the `data` field.
 * @param exampleMessage An optional example message.
 */
export function ApiSuccessResponse(
  model: string | Function | null,
  examples?: any[] | Object,
  exampleMessage = TEXT_ENUM.Success,
) {
  return ApiResponse({
    status: HttpStatus.OK,
    description: DESCRIPTION.SUCCESS,
    content: {
      'application/json': {
        ...(model && {
          schema: {
            properties: {
              message: { type: 'string', example: exampleMessage },
              data: { $ref: getSchemaPath(model) },
            },
          },
        }),
        ...(examples &&
          ((examples as any[])?.length && (examples as any[])?.[0].option
            ? {
                examples: (examples as any[])?.reduce((acc, msg) => {
                  acc[`${msg.option}`] = {
                    summary: msg.option,
                    value: {
                      message: exampleMessage,
                      data: msg.data,
                    },
                  };
                  return acc;
                }, {}),
              }
            : { example: { message: exampleMessage, data: examples } })),
      },
    },
  });
}

type ErrorRes = { option: string; message: string }[];

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
  exampleMessages: ErrorRes | Object | string,
) {
  return ApiResponse({
    status: statusCode,
    description,
    content: {
      'application/json': {
        ...(!isObject(exampleMessages) && {
          schema: {
            properties: {
              message: {
                description:
                  'The error message providing additional details about the error.',
                type: 'string',
              },
              error: {
                description:
                  'The error type or category (e.g., Bad Request, Forbidden).',
                type: 'string',
              },
              statusCode: {
                description: 'The HTTP status code associated with the error.',
                type: 'number',
              },
            },
          },
        }),
        ...(typeof exampleMessages == 'string'
          ? {
              example: {
                message: exampleMessages,
                error: errorType,
                statusCode: statusCode,
              },
            }
          : isObject(exampleMessages)
            ? { example: exampleMessages }
            : {
                examples: (exampleMessages as ErrorRes).reduce(
                  (acc, { option, message }) => {
                    acc[`${option}`] = {
                      summary: `${option}`,
                      value: {
                        message,
                        error: errorType,
                        statusCode: statusCode,
                      },
                    };
                    return acc;
                  },
                  {},
                ),
              }),
      },
    },
  });
}

export const ApiUnauthorizedErrorResponse = () => {
  return applyDecorators(
    ApiErrorResponse(
      HttpStatus.UNAUTHORIZED,
      DESCRIPTION.UNAUTHORIZED,
      ERROR_ENUM.UNAUTHORIZED,
      ERROR_ENUM.UNAUTHORIZED,
    ),
  );
};

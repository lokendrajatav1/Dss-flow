import type { ZodType } from 'zod';
import type { Resolver, FieldErrors } from 'react-hook-form';

export function zodResolver<T extends Record<string, any> = any>(schema: ZodType<any, any, any>): Resolver<T> {
  return async (values) => {
    const result = schema.safeParse(values);
    if (result.success) {
      return {
        values: result.data as T,
        errors: {},
      };
    }

    const errors: FieldErrors<T> = {};
    for (const issue of result.error.issues) {
      const field = (issue.path[0] as keyof T) || ('root' as keyof T);
      if (!errors[field]) {
        errors[field] = {
          type: issue.code,
          message: issue.message,
        } as any;
      }
    }
    return {
      values: {} as any,
      errors,
    };
  };
}

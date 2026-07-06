import { Prisma } from "@prisma/client";
import { ConflictRequestError } from "./error.response";

const SERIALIZABLE_MAX_ATTEMPTS = 3;
const SERIALIZATION_FAILURE_CODE = "P2034";

export const isSerializableRetryableError = (error: unknown) => {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === SERIALIZATION_FAILURE_CODE
  );
};

export const runSerializableWithRetry = async <T>(
  operation: () => Promise<T>,
): Promise<T> => {
  for (let attempt = 1; attempt <= SERIALIZABLE_MAX_ATTEMPTS; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (
        !isSerializableRetryableError(error) ||
        attempt === SERIALIZABLE_MAX_ATTEMPTS
      ) {
        throw error;
      }
    }
  }

  throw new ConflictRequestError("SERIALIZATION_RETRY_FAILED: Please retry");
};

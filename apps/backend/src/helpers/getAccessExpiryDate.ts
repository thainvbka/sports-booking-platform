import { config } from "../configs";
import ms from "ms";

export const getAccessExpiryDate = (): Date => {
  const duration = ms(config.JWT_ACCESS_EXPIRATION);
  const expiryDate = new Date(
    Date.now() + (typeof duration === "number" ? duration : 0)
  );
  return expiryDate;
};

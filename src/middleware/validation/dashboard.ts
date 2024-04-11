import { query } from "express-validator";

const filterQueryValidation = [
  query("startRange").custom((value) => {
    if (!new Date(value)) {
      throw new Error("start date is required");
    }

    return true;
  }),

  query("endRange").custom((value) => {
    if (!new Date(value)) {
      throw new Error("end date is required");
    }

    return true;
  }),
];

export { filterQueryValidation };

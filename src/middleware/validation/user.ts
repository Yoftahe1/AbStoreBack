import { body, param, query } from "express-validator";

const createUserValidation = [
  body("email").trim().isEmail().withMessage("Email filed is required"),
  body("lastName").trim().notEmpty().withMessage("LastName filed is required"),
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("FirstName filed is required"),
  body("password")
    .trim()
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      "Password should be min of eight characters and should contain lowercase letter,uppercase letter ,a number and a special character"
    ),
  body("location").trim().notEmpty().withMessage("Location filed is required"),
  body("phoneNumber")
    .isInt({ min: 900000000, max: 999999999 })
    .withMessage(
      "Phone number filed is required and must be valid phone number"
    ),
];

const updateUserValidation = [
  body("lastName").trim().notEmpty().withMessage("LastName filed is required"),
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("FirstName filed is required"),
  body("location").trim().notEmpty().withMessage("Location filed is required"),
  body("phoneNumber")
    .isInt({ min: 900000000, max: 999999999 })
    .withMessage(
      "Phone number filed is required and must be valid phone number"
    ),
];

const signInUserValidation = [
  body("email").trim().isEmail().withMessage("Email filed is required"),
  body("password").trim().notEmpty().withMessage("password filed is required"),
];

const changeUserPasswordValidation = [
  body("password")
    .trim()
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      "Password should be min of eight characters and should contain lowercase letter,uppercase letter ,a number and a special character"
    ),
  body("confirmPassword")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Confirm password must be equal to password");
      }
      return true;
    }),
];

const userQueryValidation = [
  query("page")
    .isInt({ min: 1 })
    .withMessage("Page number must be a positive integer"),
  query("banned")
    .isBoolean()
    .withMessage("banned is required and should be boolean"),
];

const banUser = [
  body("banReason")
    .trim()
    .notEmpty()
    .withMessage("Ban reason filed is required"),
  param("id")
    .trim()
    .notEmpty()
    .isString()
    .withMessage("Admin id must be valid mongodb object id"),
];

const userParamValidation = [
  param("id")
    .trim()
    .notEmpty()
    .isString()
    .withMessage("Admin id must be valid mongodb object id"),
];

const forgotPasswordUserValidation = [
  body("email").trim().isEmail().withMessage("Email filed is required"),
];

export {
  banUser,
  userParamValidation,
  userQueryValidation,
  createUserValidation,
  signInUserValidation,
  updateUserValidation,
  forgotPasswordUserValidation,
  changeUserPasswordValidation,
};

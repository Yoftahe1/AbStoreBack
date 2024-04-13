import { body, param, query } from "express-validator";

const createDriverValidation = [
  body("email").trim().isEmail().withMessage("Email filed is required"),
  body("lastName").trim().notEmpty().withMessage("LastName filed is required"),
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("FirstName filed is required"),
];

const driverQueryValidation = [
  query("page")
    .notEmpty()
    .withMessage("Page number is required")
    .isInt({ min: 1 })
    .withMessage("Page number must be a positive integer"),
];

const driverParamValidation = [
  param("id")
    .trim()
    .notEmpty()
    .isString()
    .withMessage("Driver id must be valid mongodb object id"),
];

const updateDriverValidation = [
  body("lastName").trim().notEmpty().withMessage("LastName filed is required"),
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("FirstName filed is required"),
  param("id")
    .trim()
    .notEmpty()
    .isString()
    .withMessage("Driver id must be valid mongodb object id"),
];

const changeDriverPasswordValidation = [
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
  param("id")
    .trim()
    .notEmpty()
    .isString()
    .withMessage("Driver id must be valid mongodb object id"),
];

const signInDriverValidation = [
  body("email").trim().isEmail().withMessage("Email filed is required"),
  body("password").trim().notEmpty().withMessage("password filed is required"),
];

const forgotPasswordDriverValidation = [
  body("email").trim().isEmail().withMessage("Email filed is required"),
];

export {
  driverQueryValidation,
  forgotPasswordDriverValidation,
  driverParamValidation,
  signInDriverValidation,
  updateDriverValidation,
  createDriverValidation,
  changeDriverPasswordValidation,
};

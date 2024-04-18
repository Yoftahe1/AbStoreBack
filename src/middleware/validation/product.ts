import { body, param, query } from "express-validator";
import validator from "validator";
import config from "../../config";
import { catagories } from "../../constant";

const createProductValidation = [
  body("name").trim().notEmpty().withMessage("Name filed is required"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description filed is required"),

  body("category").isIn(catagories).withMessage("Please select valid category"),

  body("price")
    .isFloat({ min: 1 })
    .withMessage("Price must be greater than one"),

  body("types")
    .custom((value) => {
      if (value === undefined || !Array.isArray(value) || value.length < 1) {
        return false;
      }

      if (
        value.every(
          (element: { quantity: string; color: string }) =>
            validator.isInt(element.quantity, { min: 1 }) &&
            validator.isHexColor(element.color)
        )
      ) {
        return true;
      } else {
        return false;
      }
    })
    .withMessage("Please provide at least one type with quantity and color"),

];

const editProductValidation = [
  param("id")
  .trim()
  .notEmpty()
  .isString()
  .withMessage("product id must be valid mongodb object id"),
  body("name").trim().notEmpty().withMessage("Name filed is required"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description filed is required"),

  body("category").isIn(catagories).withMessage("Please select valid category"),

  body("price")
    .isFloat({ min: 1 })
    .withMessage("Price must be greater than one"),

  body("types")
    .custom((value) => {
      if (value === undefined || !Array.isArray(value) || value.length < 1) {
        return false;
      }

      if (
        value.every(
          (element: { quantity: string; color: string }) =>
            validator.isInt(element.quantity, { min: 1 }) &&
            validator.isHexColor(element.color)
        )
      ) {
        return true;
      } else {
        return false;
      }
    })
    .withMessage("Please provide at least one type with quantity and color"),

];

const productQueryValidation = [
  query("page")
    .notEmpty()
    .withMessage("Page number is required")
    .isInt({ min: 1 })
    .withMessage("Page number must be a positive integer"),
];

const reviewProductValidation = [
  body("review").trim().notEmpty().withMessage("review filed is required"),
  param("id")
    .trim()
    .notEmpty()
    .isString()
    .withMessage("product id must be valid mongodb object id"),
];

const ratingProductValidation = [
  body("rating")
    .notEmpty()
    .isFloat({ min: 0, max: 5 })
    .withMessage("rating filed is required"),
  param("id")
    .trim()
    .notEmpty()
    .isString()
    .withMessage("product id must be valid mongodb object id"),
];

const productParamValidation = [
  param("id")
    .trim()
    .notEmpty()
    .isString()
    .withMessage("product id must be valid mongodb object id"),
];

export {
  createProductValidation,
  editProductValidation,
  ratingProductValidation,
  productQueryValidation,
  reviewProductValidation,
  productParamValidation,
};



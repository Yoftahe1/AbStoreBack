import { query, param, body } from "express-validator";

const orderQueryValidation = [
  query("page")
    .notEmpty()
    .withMessage("Page number is required")
    .isInt({ min: 1 })
    .withMessage("Page number must be a positive integer"),
  query("orderStatus")
    .notEmpty()
    .isIn(["Processing", "Delivering", "Delivered"])
    .withMessage('Status must be "Processing" or "Delivering" or "Delivered"'),
];

const orderParamValidation = [
  param("id")
    .trim()
    .notEmpty()
    .isString()
    .withMessage("Order id must be valid mongodb object id"),
];

const orderDriverValidation = [
  param("id")
    .trim()
    .notEmpty()
    .isString()
    .withMessage("Order id must be valid mongodb object id"),
    body("driverId")
    .trim()
    .notEmpty()
    .isString()
    .withMessage("Driver id must be valid mongodb object id"),
];

const orderDeliveriesValidation = [
  query("page")
    .notEmpty()
    .withMessage("Page number is required")
    .isInt({ min: 1 })
    .withMessage("Page number must be a positive integer"),
];

const orderDeliverValidation = [
  param("id")
    .trim()
    .notEmpty()
    .isString()
    .withMessage("Order id must be valid mongodb object id"),
    body("key")
    .trim()
    .notEmpty()
    .isString()
    .withMessage("Key filed is required"), 
];

const orderVerificationValidation = [
  param("id")
    .trim()
    .notEmpty()
    .isString()
    .withMessage("Order id must be valid mongodb object id"),
];
export { orderQueryValidation ,orderParamValidation,orderDriverValidation,orderDeliveriesValidation,orderDeliverValidation,orderVerificationValidation};

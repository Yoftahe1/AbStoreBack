import { v4 as uuidv4 } from "uuid";
import { Request as JWTRequest } from "express-jwt";
import express, { Request, Response } from "express";

import ProductService from "../services/product";
import handleValidationError from "../middleware/validation/handleError";
import {
  createProductValidation,
  productQueryValidation,
  ratingProductValidation,
  productParamValidation,
  reviewProductValidation,
  editProductValidation,
} from "../middleware/validation/product";
import authenticateToken from "../middleware/auth/authenticateToken";
import authorization from "../middleware/auth/authorization";
import multer from "multer";
// const upload = multer({ dest: "uploads/" });

const router = express.Router();

router.get(
  "/",
  productQueryValidation,
  handleValidationError,
  async (req: Request, res: Response) => {
    const { page } = req.query;
    const productService = new ProductService();

    const { status, result } = await productService.getProducts({
      page: Number(page),
      filter: req.query,
    });

    res.status(status).json(result);
  }
);

router.get("/new", async (req: Request, res: Response) => {
  const productService = new ProductService();

  const { status, result } = await productService.newProducts();

  res.status(status).json(result);
});

router.get("/topRated", async (req: Request, res: Response) => {
  const productService = new ProductService();

  const { status, result } = await productService.topRatedProducts();

  res.status(status).json(result);
});

router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  const productService = new ProductService();

  const { status, result } = await productService.findOne({ id });

  res.status(status).json(result);
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + file.originalname);
  },
});

const upload = multer({ storage: storage });
router.post(
  "/create",
  authenticateToken,
  authorization(["Admin", "Owner"]),
  upload.array("files", 4),
  createProductValidation,
  handleValidationError,
  async (req: Request, res: Response) => {
    const productDto = req.body;

    const productService = new ProductService();

    if (req.files === undefined || req.files!.length === 0) {
      return res.status(404).json({
        data: {},
        message: "Image is required to create product",
        error: [],
      });
    }

    const files = req.files as Express.Multer.File[];
    const images = files.map((e) => e.path);

    const { status, result } = await productService.create(productDto, images);

    res.status(status).json(result);
  }
);

router.post(
  "/image",
  upload.array("files", 4),
  (req: Request, res: Response) => {
    if (req.files === undefined || req.files!.length === 0) {
      return res.status(404).json({
        data: {},
        message: "Image is required to create product",
        error: [],
      });
    }

    const files = req.files as Express.Multer.File[];
    const images = files.map((e) => e.path);

    res.status(201).json({
      data: {images},
      message: "Image uploaded successfully",
      error: [],
    });
  }
);

router.patch(
  "/:id/edit",
  authenticateToken,
  authorization(["Admin", "Owner"]),
  upload.array("files", 4),
  editProductValidation,
  handleValidationError,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const productDto = req.body;
    const productService = new ProductService();

    // if (req.files === undefined || req.files!.length === 0) {
    //   return res.status(404).json({
    //     data: {},
    //     message: "Image is required to create product",
    //     error: [],
    //   });
    // }

    const files = req.files as Express.Multer.File[];
    const images = files.map((e) => e.path);

    const { status, result } = await productService.edit(
      { id, ...productDto },
      images
    );

    res.status(status).json(result);
  }
);

router.delete(
  "/:id/delete",
  authenticateToken,
  authorization(["Admin", "Owner"]),
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const productService = new ProductService();

    const { status, result } = await productService.delete({ id });

    res.status(status).json(result);
  }
);

router.patch(
  "/:id/update",
  createProductValidation,
  handleValidationError,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const productDto = req.body;

    const productService = new ProductService();

    const { status, result } = await productService.update({ id }, productDto);

    res.status(status).json(result);
  }
);

router.patch(
  "/:id/review",
  authenticateToken,
  authorization(["User"]),
  reviewProductValidation,
  handleValidationError,
  async (req: JWTRequest, res: Response) => {
    const { id } = req.params;

    const userId = req.auth!.id;
    const reviewDto = req.body;

    const productService = new ProductService();

    const { status, result } = await productService.review(
      { id },
      { review: reviewDto.review, userId }
    );

    res.status(status).json(result);
  }
);

router.get("/:id/review", async (req: Request, res: Response) => {
  const { id } = req.params;

  const productService = new ProductService();

  const { status, result } = await productService.getReviews({ id });

  res.status(status).json(result);
});

router.patch(
  "/:id/rate",
  authenticateToken,
  authorization(["User"]),
  ratingProductValidation,
  handleValidationError,
  async (req: JWTRequest, res: Response) => {
    const { id } = req.params;

    const userId = req.auth!.id;
    const { rating } = req.body;

    const productService = new ProductService();

    const { status, result } = await productService.rate(
      { id },
      { rating: parseFloat(rating), userId }
    );

    res.status(status).json(result);
  }
);

router.get(
  "/:id/related",
  productParamValidation,
  handleValidationError,
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const productService = new ProductService();

    const { status, result } = await productService.relatedProducts({
      id,
    });

    res.status(status).json(result);
  }
);

router.get(
  "/:id/myRating",
  authenticateToken,
  authorization(["User"]),
  productParamValidation,
  handleValidationError,
  async (req: JWTRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.auth!.id;

    const productService = new ProductService();

    const { status, result } = await productService.myRating(
      {
        id,
      },
      { userId }
    );

    res.status(status).json(result);
  }
);

export default router;

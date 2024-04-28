import Product from "../models/product";
import Response from "../utils/response";
import {
  IEditProduct,
  IParams,
  IProduct,
  IProductQuery,
  IRate,
  IRelatedProduct,
  IReview,
  IReviewsQuery,
} from "../types/product";
import config from "../config";
import { Types } from "mongoose";

export default class ProductService {
  async getProducts({ page, filter }: IProductQuery) {
    const { category, rating, search } = filter;

    let filterOption: {
      category?: string;
      rating?: { $gte: number };
      name?: { $regex: string; $options: string };
    } = {};

    if (category) filterOption.category = category;
    if (rating) filterOption.rating = { $gte: Number(rating) };
    if (search) filterOption.name = { $regex: search, $options: "i" };

    try {
      const count = await Product.aggregate([
        {
          $project: {
            name: 1,
            category: 1,
            rating: { $ifNull: [{ $avg: "$ratings.rating" }, 0] },
          },
        },
        {
          $match: filterOption,
        },
        { $count: "totalProducts" },
      ]);
      let totalCount = 0;

      if (count.length > 0) totalCount = count[0].totalProducts;

      const pageSize = config.pageSize;

      const totalPages = Math.ceil(totalCount / pageSize);

      const products = await Product.aggregate([
        {
          $project: {
            name: 1,
            images: 1,
            category: 1,
            description: 1,
            price: 1,
            types: 1,
            rating: { $ifNull: [{ $avg: "$ratings.rating" }, 0] },
          },
        },
        { $match: filterOption },
        { $skip: (page - 1) * pageSize },
        { $limit: pageSize },
      ]);

      const response = new Response();

      return response.success(
        {
          products,
          totalPages,
          currentPage: page,
          pageSize,
          totalCount,
        },
        "Products has been fetched successfully."
      );
    } catch (error) {
      const response = new Response();

      return response.internalError(error);
    }
  }

  async findOne(params: IParams) {
    const { id } = params;
    try {
      const productExists = await Product.findById(id);

      if (!productExists) {
        const response = new Response();

        return response.notFound("Product doesn't exist.");
      }

      const product = await Product.aggregate([
        { $match: { _id: new Types.ObjectId(id) } },
        {
          $project: {
            _id: 1,
            name: 1,
            description: 1,
            images: 1,
            types: 1,
            price: 1,
            category: 1,
            reviewCount: { $size: "$reviews" },
            rating: { $ifNull: [{ $avg: "$ratings.rating" }, 0] },
          },
        },
      ]);

      if (!product) {
        const response = new Response();

        return response.notFound("Product doesn't exist.");
      }

      const response = new Response();

      return response.success(
        { product: product[0] },
        "Product has been fetched successfully."
      );
    } catch (error) {
      const response = new Response();

      return response.internalError(error);
    }
  }

  async create(newProduct: IProduct, images: string[]) {
    const { name, description, price, category, types } = newProduct;

    const today = new Date().toISOString();

    try {
      const product = new Product({
        name,
        description,
        category,
        images,
        price,
        types,
        createdAt: today,
        updatedAt: today,
      });

      const result = await product.save();

      const response = new Response();

      return response.created(
        { id: result._id },
        "Product has been created successfully."
      );
    } catch (error) {
      const response = new Response();

      return response.internalError(error);
    }
  }

  async edit(editProduct: IEditProduct, images: string[]) {
    const { id, name, description, price, category, types } = editProduct;

    try {
      const productExists = await Product.findById(id);

      if (!productExists) {
        const response = new Response();

        return response.notFound("Product doesn't exist.");
      }

      await Product.updateOne(
        { _id: id },
        {
          $push: { images: { $each: images } },
          $set: {
            name,
            description,
            price,
            category,
            types,
          },
        }
      );

      const response = new Response();

      return response.created({ id }, "Product has been edited successfully.");
    } catch (error) {
      const response = new Response();

      return response.internalError(error);
    }
  }

  async delete(params: IParams) {
    const { id } = params;

    try {
      const productExists = await Product.findById(id);

      if (!productExists) {
        const response = new Response();

        return response.notFound("Product doesn't exist.");
      }

      await Product.findByIdAndDelete(id);

      const response = new Response();

      return response.success({ id }, "Product has been deleted successfully");
    } catch (error) {
      const response = new Response();

      return response.internalError(error);
    }
  }

  async update(params: IParams, updateProduct: IProduct) {
    const { id } = params;
    const { name, description, category, images, price, types } = updateProduct;

    try {
      const productExists = await Product.findOne({ _id: id });

      if (!productExists) {
        const response = new Response();

        return response.notFound("Product doesn't exist.");
      }

      await Product.updateOne(
        { _id: id },
        { name, description, category, images, price, types }
      );

      const response = new Response();

      return response.success({ id }, "Product has been updated successfully");
    } catch (error) {
      const response = new Response();

      return response.internalError(error);
    }
  }

  async review(params: IParams, reviewProduct: IReview) {
    const { id } = params;
    const { review, userId } = reviewProduct;

    try {
      const productExists = await Product.findById(id);

      if (!productExists) {
        const response = new Response();

        return response.notFound("Product doesn't exist.");
      }

      await Product.findByIdAndUpdate(id, {
        $push: { reviews: { message: review, userId } },
      });

      const response = new Response();

      return response.success({ id }, "Product has been reviewed successfully");
    } catch (error) {
      const response = new Response();

      return response.internalError(error);
    }
  }

  async getReviews({ id }: IParams) {
    try {
      const product = await Product.findById(id).populate({
        path: "reviews.userId",
        select: ["firstName", "lastName"],
      });

      if (!product) {
        const response = new Response();

        return response.notFound("Product doesn't exist.");
      }

      const response = new Response();

      return response.success(
        {
          reviews: product?.reviews,
        },
        "Reviews has been fetched successfully"
      );
    } catch (error) {
      const response = new Response();

      return response.internalError(error);
    }
  }

  async rate(params: IParams, reviewProduct: IRate) {
    const { id } = params;
    const { rating, userId } = reviewProduct;

    try {
      const productExists = await Product.findById(id);

      if (!productExists) {
        const response = new Response();

        return response.notFound("Product doesn't exist.");
      }

      const alreadyRated = productExists.ratings?.findIndex(
        (r) => r.userId.toString() === userId
      );

      if (typeof alreadyRated === "number" && alreadyRated > -1) {
        await Product.findOneAndUpdate(
          { _id: id, "ratings.userId": userId },
          { $set: { "ratings.$.rating": rating } },
          { new: true }
        );

        const response = new Response();

        return response.success({ id }, "Product rating has been updated");
      }

      await Product.findByIdAndUpdate(id, {
        $push: { ratings: { rating, userId } },
      });

      const response = new Response();

      return response.success({ id }, "Product has been rated successfully");
    } catch (error) {
      const response = new Response();

      return response.internalError(error);
    }
  }

  async myRating(params: IParams, { userId }: { userId: string }) {
    const { id } = params;
    try {
      const productExists = await Product.findById(id);

      if (!productExists) {
        const response = new Response();

        return response.notFound("Product doesn't exist.");
      }

      const alreadyRated = productExists.ratings?.findIndex((r) => {
        return r.userId.toString() === userId;
      });

      let myRating: number;
      typeof alreadyRated === "number" && alreadyRated > -1
        ? (myRating = productExists.ratings![alreadyRated].rating)
        : (myRating = 0);

      const response = new Response();

      return response.success(
        { myRating },
        "your rating have been fetched successfully"
      );
    } catch (error) {
      const response = new Response();

      return response.internalError(error);
    }
  }

  async relatedProducts({ id }: IRelatedProduct) {
    try {
      const product = await Product.findById(id);

      if (!product) {
        const response = new Response();

        return response.notFound("Product doesn't exist.");
      }

      const pageSize = config.pageSize;

      const products = await Product.find({
        _id: { $ne: id },
        category: product.category,
      })
        .select({
          name: 1,
          description: 1,
          images: 1,
          price: 1,
          category: 1,
          rating: { $ifNull: [{ $avg: "$ratings.rating" }, 0] },
        })
        .limit(pageSize);

      const response = new Response();

      return response.success(
        {
          products,
        },
        "Related products has been fetched successfully."
      );
    } catch (error) {
      const response = new Response();

      return response.internalError(error);
    }
  }

  async newProducts() {
    try {
      const pageSize = config.pageSize;

      const products = await Product.find()
        .select({
          name: 1,
          description: 1,
          images: 1,
          price: 1,
          category: 1,
          rating: { $ifNull: [{ $avg: "$ratings.rating" }, 0] },
        }) 
        .sort({ createdAt: -1 })
        .limit(pageSize);

      const response = new Response();

      return response.success(
        { products },
        "New products has been fetched successfully."
      );
    } catch (error) {
      const response = new Response();

      return response.internalError(error);
    }
  }

  async topRatedProducts() {
    try {
      const pageSize = config.pageSize;

      const products = await Product.aggregate([
        {
          $project: {
            _id: 1,
            name: 1,
            description: 1,
            images: 1,
            price: 1,
            category: 1,
            rating: { $ifNull: [{ $avg: "$ratings.rating" }, 0] },
          },
        },
        { $sort: { rating: -1 } },
        { $limit: pageSize },
      ]);

      const response = new Response();

      return response.success(
        { products },
        "Top rated products has been fetched successfully."
      );
    } catch (error) {
      const response = new Response();

      return response.internalError(error);
    }
  }
}

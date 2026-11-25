import {
  applyProductUploads,
  applyProductUploadsForUpdate,
} from "../../helpers/product-upload.helper.js";
import { sendSuccess } from "../../helpers/response.helper.js";
import Product from "../../models/product.model.js";
import ProductService from "../../services/product.service.js";

const parseJson = (v) => (v ? (typeof v === "string" ? JSON.parse(v) : v) : []);
const toBool = (v) => v === true || v === "true";
// multipart/form-data sends empty fields as "" -> treat them as "not provided"
const emptyToUndefined = (v) =>
  v === "" || v === null || v === undefined ? undefined : v;

const pickProductFields = (body) => ({
  name: body.name,
  description: body.description,
  short_description: body.short_description,
  category_id: body.category_id,
  sku: emptyToUndefined(body.sku),
  currency: emptyToUndefined(body.currency),
  costPrice: emptyToUndefined(body.costPrice),
  sellingPrice: emptyToUndefined(body.sellingPrice),
  price: emptyToUndefined(body.price),
  stock: emptyToUndefined(body.stock),
  mainImage: body.mainImage,
  featuredImages: body.featuredImages,
  hasVariants: toBool(body.hasVariants),
  variantTypes: parseJson(body.variantTypes),
  variants: parseJson(body.variants),
  imageGroupTypeId: body.imageGroupTypeId,
  unit: emptyToUndefined(body.unit),
});

export const ProductController = {
  createProduct: async (req, res, next) => {
    try {
      const body = applyProductUploads(req.body, req.files);

      const product = await ProductService.createProduct({
        ...pickProductFields(body),
        user_id: req.user._id,
        role: req.user.role,
      });

      return sendSuccess(res, {
        code: 201,
        message: "Product created successfully",
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },

  getAllProducts: async (req, res, next) => {
    try {
      const { page, limit, search, category_id, status } = req.query;

      const { data, pagination } = await ProductService.getAllProducts({
        page,
        limit,
        search,
        category_id,
        status,
      });

      return sendSuccess(res, {
        message: "Products fetched successfully",
        data,
        pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  getProductById: async (req, res, next) => {
    try {
      const product = await ProductService.getProductById(req.params.id);

      return sendSuccess(res, {
        message: "Product fetched successfully",
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },

  updateProduct: async (req, res, next) => {
    try {
      const { id } = req.params;

      // needed for existing images
      const existing = await Product.findById(id)
        .select("featuredImages mainImage")
        .lean();
      if (!existing) throw new Error("Product not found");

      const body = applyProductUploadsForUpdate(req.body, req.files, existing);

      const updated = await ProductService.updateProduct(
        id,
        pickProductFields(body),
      );

      return sendSuccess(res, {
        message: "Product updated successfully",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  updateProductStatus: async (req, res, next) => {
    try {
      const { status } = req.body;
      if (!status) throw new Error("Status is required");

      const updated = await ProductService.updateProductStatus(
        req.params.id,
        status,
      );

      return sendSuccess(res, {
        message: `Product status updated to ${updated.status} successfully`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  deleteProduct: async (req, res, next) => {
    try {
      await ProductService.deleteProduct(req.params.id);
      return sendSuccess(res, {
        message: "Product deleted successfully",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default ProductController;

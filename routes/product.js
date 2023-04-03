import express from "express"
import formidable from "express-formidable";

const router = express.Router();

//middleware
import {requireSignIn, isAdmin} from "../middleware/auth.js"
//controllers
import { create, 
         list,
         read,
         photo, 
         remove, 
         update,
         filteredProducts,
         productsCount,
         listProducts,
         productsSearch,
         relatedProducts,
         getToken,
         processPayment,
         orderStatus,
        } from "../controllers/product.js";

// router.post("/product",requireSignIn, isAdmin, formidable(), create);
router.post("/product",requireSignIn, isAdmin, formidable(), create);
router.get("/products", list);
router.get("/product/:slug", read)
router.get("/product/photo/:productId", photo);
router.delete("/product/:productId", requireSignIn, isAdmin, remove);
router.put("/product/:productId", requireSignIn, isAdmin, formidable(), update);
router.post("/filtered-products", filteredProducts);
router.get("/products-count", productsCount);
router.get("/list-products/:page", listProducts);
router.get("/products/search/:keyword", productsSearch);
router.get("/related-products/:productId/:categoryId", relatedProducts);
router.get("/braintree/token", getToken);
router.post("/braintree/payment", requireSignIn, processPayment);
router.put("/order-status/:orderId", requireSignIn, isAdmin,orderStatus)

export default router;



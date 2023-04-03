import express from "express"

const router = express.Router();

//middleware
import {requireSignIn, isAdmin} from "../middleware/auth.js"
//controllers
import {create, 
        update, 
        remove, 
        list, 
        read,
        productsByCategory,} 
        from "../controllers/category.js";



router.post("/category",requireSignIn, isAdmin, create);
router.put("/category/:categoryId",requireSignIn, isAdmin, update);
router.delete("/category/:categoryId",requireSignIn, isAdmin, remove);
router.get("/categories", list);
router.get("/category/:slug", read);
router.get("/products-by-category/:slug", productsByCategory);

export default router;

//Create Read Update Delete (CRUD)

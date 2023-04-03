import express from "express"

const router = express.Router();

//middleware
import {requireSignIn, isAdmin} from "../middleware/auth.js"

//controllers
import {
       register,
       login, 
       secret,
       updateProfile,
       getOrders,
       allOrders,
    } 
       from "../controllers/auth.js";

router.post("/register", register);
router.post("/login", login);
router.get("/auth-check", requireSignIn, (req, res) => {
    res.json({ ok: true});
});
router.get("/admin-check", requireSignIn, isAdmin, (req, res) => {
    res.json({ ok: true});
});

router.put("/profile", requireSignIn, isAdmin,updateProfile);


//testing
router.get("/secret", requireSignIn, isAdmin, secret);

//orders
router.get("/orders", requireSignIn, getOrders);
router.get("/all-orders", requireSignIn, isAdmin, allOrders);


export default router;

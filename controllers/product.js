import Product from "../models/product.js";
import fs from "fs";
import slugify from "slugify";
import braintree from "braintree";
import dotenv from "dotenv";
import Order from "../models/Order.js";
//import Mailgun from "mg-js";

dotenv.config();

// const API_KEY = 'e71ae831c1905ab672a2845adb87ce65-d51642fa-ef47f822';
// const DOMAIN = 'sandbox29045ff38d90436e8628c100052c83f6.mailgun.org';

// const formData = require('form-data');
// const mg = require('mg.js');

// const mailgun = new Mailgun(formData);
// const client = mg.client({username: 'Jakir', key: API_KEY});




const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});



export const create = async (req, res) => {
    try{
        const { name, description, price, category, quantity, shipping } = req.fields;
        const { photo } = req.files;

        //validation

        switch(true) {
        case(!name.trim()):
             res.json({error: "Name is required"});
        
        case(!description.trim()):
             res.json({error: "description is required"});
        
        case(!price.trim()):
             res.json({error: "price is required"});
        
        case(!category.trim()):
             res.json({error: "category is required"});
        
        case(!quantity.trim()):
             res.json({error: "quantity is required"});
        
        case(!shipping.trim()):
             res.json({error: "shipping is required"});
        
        case(photo && photo.size > 1000000):
             res.json({error: "Image should be less than 1 mb in size"});
        
    }
    
     // create product
     const product = new Product({ ...req.fields, slug: slugify(name) });

     if (photo) {
       product.photo.data = fs.readFileSync(photo.path);
       product.photo.contentType = photo.type;
     }
 
     await product.save();
     res.json(product);
   } catch (err) {
     console.log(err);
     return res.status(400).json(err.message);
   }
 };
 
 export const list = async (req, res) => {
   try {
     const products = await Product.find({})
       .populate("category")
       .select("-photo")
       .limit(12)
       .sort({ createdAt: -1 });
 
     res.json(products);
   } catch (err) {
     console.log(err);
   }
 };
 
 export const read = async (req, res) => {
   try {
     const product = await Product.findOne({ slug: req.params.slug })
       .select("-photo")
       .populate("category");
 
     res.json(product);
   } catch (err) {
     console.log(err);
   }
 };
 
 export const photo = async (req, res) => {
   try {
     const product = await Product.findById(req.params.productId).select(
       "photo"
     );
     if (product.photo.data) {
       res.set("Content-Type", product.photo.contentType);
       return res.send(product.photo.data);
     }
   } catch (err) {
     console.log(err);
   }
 };
 
 export const remove = async (req, res) => {
   try {
     const product = await Product.findByIdAndDelete(
       req.params.productId
     ).select("-photo");
     res.json(product);
   } catch (err) {
     console.log(err);
   }
 };
 
 export const update = async (req, res) => {
   try {
     // console.log(req.fields);
     // console.log(req.files);
     const { name, description, price, category, quantity, shipping } =
       req.fields;
     const { photo } = req.files;
 
     // validation
     switch (true) {
       case !name.trim():
         return res.json({ error: "Name is required" });
       case !description.trim():
        return res.json({ error: "Description is required" });
       case !price.trim():
        return res.json({ error: "Price is required" });
       case !category.trim():
        return res.json({ error: "Category is required" });
       case !quantity.trim():
        return res.json({ error: "Quantity is required" });
       case !shipping.trim():
        return res.json({ error: "Shipping is required" });
       case photo && photo.size > 1000000:
        return res.json({ error: "Image should be less than 1mb in size" });
     }
 
     // update product
     const product = await Product.findByIdAndUpdate(
       req.params.productId,
       {
         ...req.fields,
         slug: slugify(name),
       },
       { new: true }
     );
 
     if (photo) {
       product.photo.data = fs.readFileSync(photo.path);
       product.photo.contentType = photo.type;
     }
 
     await product.save();
     res.json(product);
   } catch (err) {
     console.log(err);
     return res.status(400).json(err.message);
   }
 };

 export const filteredProducts = async (req, res) => {
  try {
    const {checked, radio} = req.body;

    let args = {};
    if(checked.length > 0) args.categories = checked;
    if(radio.length) args.price = {$gte: radio [0], $lte: radio [1]};
    console.log("args =>", args);

    const products = await Product.find(args);
    console.log(" filtered products query =>", products.length);
    res.json(products);
  } catch (err) {
    console.log(err);
  }
 };

 export const productsCount = async (req, res) => {
  try {
   const total = await Product.find({}).estimatedDocumentCount()
   res.json(total);
  } catch (err) {
    console.log(err);
  }
 };

 export const listProducts = async (req, res) => {
  try {
   const perPage = 4;
   const page = req.params.page ?  req.params.page : 1;

   const products = await Product.find({})
   .select("-photo")
   .skip((page - 1) * perPage)
   .limit(4)
   .sort({ createdAt: -1});

   res.json(products);
  } catch (err) {
    console.log(err);
  }
 };

 export const productsSearch = async (req, res) => {
  try {
   const {keyword} = req.params;
   const results = await Product.find({
    $or: [
      {name: {$regex: keyword, $options: "1"}},
      {description: {$regex: keyword, $options: "1"}},
    ],
   }).select("-photo");

   res.json(results);
   
  } catch (err) {
    console.log(err);
  }
 };

 export const relatedProducts = async (req, res) => {
  try {
   const { productId, categoryId } = req.params;
   const related = await Product.find ({
    category: categoryId,
    _id: {$ne: productId},
   })
   .select("-photo")
   .populate("category")
   .limit(3);

   res.json(related);
   } catch (err) {
    console.log(err);
  }
  };
 

  export const getToken = async (req, res) => {
    try {
    gateway.clientToken.generate ({}, function (err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
    } catch (err) {
      console.log(err);
    }
   };

   export const processPayment = async (req, res) => {
    try {
    //console.log(req.body);
    const {nonce, cart} = req.body;

    let total = 0;
    cart.map((i) => {
     total += i.price;
    });
    console.log("total =>", total);

    
    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function (error, result) {
        if (result) {
          // res.send(result);
          // create order
          const order = new Order({
            products: cart,
            payment: result,
            buyer: req.user._id,
          }).save();
          // decrement quantity
          decrementQuantity(cart);
          // const bulkOps = cart.map((item) => {
          //   return {
          //     updateOne: {
          //       filter: { _id: item._id },
          //       update: { $inc: { quantity: -0, sold: +1 } },
          //     },
          //   };
          // });

          // Product.bulkWrite(bulkOps, {});

          res.json({ ok: true });
        } else {
          res.status(500).send(error);
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
};

const decrementQuantity = async (cart) => {
  try {
    // build mongodb query
    const bulkOps = cart.map((item) => {
      return {
        updateOne: {
          filter: { _id: item._id },
          update: { $inc: { quantity: -0, sold: +1 } },
        },
      };
    });

     const updated = await Product.bulkWrite(bulkOps, {});
     console.log("bulk updated", updated);
    } catch (err) {
      console.log(err);
    }
   };

   export const orderStatus = async (req, res) => {
    try {
    const {orderId} = req.params;
    const {status} = req.body;
    const order = await Order.findByIdAndUpdate(orderId, {status}, {new:true}).populate(
      "buyer",
      "email",
      "name",
    );
    //send email

    //prepare email
//       const emailData= {
//       from: process.env.DOMAIN,
//       to: order.buyer.email,
//       subject: "Order Status",
//       html: `
//         <h1> Hi ${order.buyer.name}, Your order's status is:
//         <span style="color:red;">${order.status}</span></h1>
//         <p> Visit <a href="${process.env.CLIENT_URL}/dashboard/user/orders">your dashboard</a> for more details </p>

//       `,
//     };
    
//   client.messages.create(DOMAIN, emailData)
//  .then((res) => {
//    console.log(res);
//  })
//  .catch((err) => {
//    console.error(err);
//  });

//     try{
//       await mailgun.send(emailData);
//     } catch(err){
//       console.log(err);
//     }

    res.json(order);
    } catch (err) {
      console.log(err);
    }
   };
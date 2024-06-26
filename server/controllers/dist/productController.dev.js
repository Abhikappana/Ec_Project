"use strict";

var productModel = require('../models/productmodel');

var categoryModel = require('../models/categorymodel');

var ObjectId = require('mongoose').Types.ObjectId; // Node.js route handlers


var adminProduct = function adminProduct(req, res) {
  var page, limit, skip, totalProducts, totalPages, products;
  return regeneratorRuntime.async(function adminProduct$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          page = req.query.page || 1; // Get page number from query parameters or default to 1

          limit = 6; // Number of products per page

          skip = (page - 1) * limit; // Calculate the offset

          _context.next = 6;
          return regeneratorRuntime.awrap(productModel.countDocuments({}));

        case 6:
          totalProducts = _context.sent;
          // Get total number of products
          totalPages = Math.ceil(totalProducts / limit); // Calculate total pages

          _context.next = 10;
          return regeneratorRuntime.awrap(productModel.find({}).sort({
            _id: -1,
            name: -1
          }).skip(skip).limit(limit).populate('category'));

        case 10:
          products = _context.sent;
          // Find all products and sort by _id in descending order
          // Render the view with the retrieved products
          res.render("productManagement", {
            Username: req.session.Username,
            products: products,
            error: req.query.error,
            currentPage: page,
            totalPages: totalPages // Pass totalPages to the view

          }); // console.log("Products displayed :", products);

          _context.next = 18;
          break;

        case 14:
          _context.prev = 14;
          _context.t0 = _context["catch"](0);
          console.error("Error occurred:", _context.t0);
          res.render('error'); // Render an error page if there's an error

        case 18:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 14]]);
};

var getproductPage = function getproductPage(req, res) {
  var page, limit, skip, products;
  return regeneratorRuntime.async(function getproductPage$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          page = parseInt(req.query.page) || 1; // Current page number, default to 1 if not provided

          limit = 6; // Number of items per page

          skip = (page - 1) * limit; // Number of items to skip based on the current page

          _context2.next = 6;
          return regeneratorRuntime.awrap(productModel.find({}).skip(skip).limit(limit).sort({
            name: -1
          }));

        case 6:
          products = _context2.sent;
          res.json(products);
          _context2.next = 14;
          break;

        case 10:
          _context2.prev = 10;
          _context2.t0 = _context2["catch"](0);
          console.log("Error fetching products:", _context2.t0);
          res.render('error'); // Render an error page if there's an error

        case 14:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 10]]);
};

var NewProduct = function NewProduct(req, res) {
  var category;
  return regeneratorRuntime.async(function NewProduct$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return regeneratorRuntime.awrap(categoryModel.find({}).sort({
            name: 1
          }));

        case 2:
          category = _context3.sent;

          try {
            console.log("entry 1");
            res.render('PdAddForm', {
              Username: req.session.Username,
              category: category,
              error: req.query.error
            });
            console.log("ADMIN WILL ADD PRODUCT");
          } catch (error) {
            console.error("Error while redirecting the page to add product: ", +error);
            res.render('error'); // Render an error page if there's an error
          }

        case 4:
        case "end":
          return _context3.stop();
      }
    }
  });
};

var AddProduct = function AddProduct(req, res) {
  var _req$body, name, category, rate, description, offer, discountAmount, catOffer, properties, files, images, existingProduct, newProduct;

  return regeneratorRuntime.async(function AddProduct$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          console.log("Check 1 Adding product");
          _req$body = req.body, name = _req$body.name, category = _req$body.category, rate = _req$body.rate, description = _req$body.description, offer = _req$body.offer, discountAmount = _req$body.discountAmount, catOffer = _req$body.catOffer, properties = _req$body.properties;
          console.log("Received Body:", req.body.properties); // Handle file uploads

          if (!(!req.files || !req.files.length)) {
            _context4.next = 7;
            break;
          }

          console.log("No files were uploaded.");
          return _context4.abrupt("return", res.render('error'));

        case 7:
          // Process uploaded files
          files = req.files;
          images = [];
          files.forEach(function (file) {
            var image = file.filename;
            images.push(image);
          }); // Check if product already exists

          _context4.next = 12;
          return regeneratorRuntime.awrap(productModel.findOne({
            name: name
          }));

        case 12:
          existingProduct = _context4.sent;

          if (!existingProduct) {
            _context4.next = 15;
            break;
          }

          return _context4.abrupt("return", res.redirect('/admin/NewProduct?error=Product already exists, please update'));

        case 15:
          // Parse properties from form
          // Create new product instance
          newProduct = new productModel({
            name: name,
            category: category,
            rate: rate,
            description: description,
            image: images,
            offer: offer,
            discountAmount: discountAmount,
            catOffer: catOffer,
            properties: properties // Save properties as an array of objects

          }); // Save the new product

          _context4.next = 18;
          return regeneratorRuntime.awrap(newProduct.save());

        case 18:
          console.log("Check 4 added Product:", newProduct);
          return _context4.abrupt("return", res.redirect("/admin/productmanagement?error=success"));

        case 22:
          _context4.prev = 22;
          _context4.t0 = _context4["catch"](0);
          console.error("Error occurred:", _context4.t0);
          return _context4.abrupt("return", res.render('error'));

        case 26:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 22]]);
};

var ProductStatus = function ProductStatus(req, res) {
  var Productid, _ProductStatus, updatedStatus;

  return regeneratorRuntime.async(function ProductStatus$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          Productid = req.params.id;
          _ProductStatus = req.query.status;
          console.log("ProductStatus check1");

          if (!(_ProductStatus === "true")) {
            _context5.next = 11;
            break;
          }

          console.log("ProductStatus check2=========");
          _context5.next = 8;
          return regeneratorRuntime.awrap(productModel.updateOne({
            _id: new ObjectId(Productid)
          }, {
            $set: {
              status: false
            }
          }));

        case 8:
          updatedStatus = _context5.sent;
          _context5.next = 16;
          break;

        case 11:
          console.log("ProductStatus check3 =========");
          console.log(Productid);
          _context5.next = 15;
          return regeneratorRuntime.awrap(productModel.updateOne({
            _id: new ObjectId(Productid)
          }, {
            $set: {
              status: true
            }
          }));

        case 15:
          updatedStatus = _context5.sent;

        case 16:
          console.log("updatedStatus :", updatedStatus);
          console.log("ProductStatus check4 ========");
          res.redirect('/admin/productmanagement');
          _context5.next = 25;
          break;

        case 21:
          _context5.prev = 21;
          _context5.t0 = _context5["catch"](0);
          console.error("Error updating user status:", _context5.t0);
          res.render('error'); // Render an error page if there's an error

        case 25:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 21]]);
};

var productEdit = function productEdit(req, res) {
  var productId, productData, categoryData;
  return regeneratorRuntime.async(function productEdit$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          console.log("Entered productEdit");
          _context6.prev = 1;
          productId = req.params.id;
          console.log("===========", productId); // Corrected variable name

          _context6.next = 6;
          return regeneratorRuntime.awrap(productModel.findOne({
            _id: productId
          }));

        case 6:
          productData = _context6.sent;
          console.log("Product Data:", productData);
          _context6.next = 10;
          return regeneratorRuntime.awrap(categoryModel.find({}));

        case 10:
          categoryData = _context6.sent;
          res.render('productedit', {
            Username: req.session.Username,
            product: productData,
            category: categoryData
          });
          _context6.next = 18;
          break;

        case 14:
          _context6.prev = 14;
          _context6.t0 = _context6["catch"](1);
          console.error("Error in Product edit:", _context6.t0);
          res.render('error'); // Render an error page if there's an error

        case 18:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[1, 14]]);
};

var productupdate = function productupdate(req, res) {
  var productID, updateData, files, images, dataUpload, imageUpload;
  return regeneratorRuntime.async(function productupdate$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _context7.prev = 0;
          productID = req.params.id;
          updateData = req.body;
          console.log(req.body);
          files = req.files;
          images = [];
          files.forEach(function (files) {
            var image = files.filename;
            images.push(image);
          });
          console.log("=//////////////++", req.body.properties);
          _context7.next = 10;
          return regeneratorRuntime.awrap(productModel.updateOne({
            _id: productID
          }, {
            $set: {
              name: updateData.name,
              category: updateData.category,
              rate: updateData.rate,
              description: updateData.description,
              stock: updateData.stock,
              offer: updateData.offer,
              discountAmount: updateData.discountAmount,
              catOffer: updateData.catOffer,
              properties: updateData.properties
            }
          }));

        case 10:
          dataUpload = _context7.sent;
          _context7.next = 13;
          return regeneratorRuntime.awrap(productModel.updateOne({
            _id: productID
          }, {
            $push: {
              image: {
                $each: images
              }
            }
          }));

        case 13:
          imageUpload = _context7.sent;
          console.log(dataUpload, "----===++===---");
          console.log(imageUpload, "----======---");
          res.redirect("/admin/productmanagement");
          _context7.next = 23;
          break;

        case 19:
          _context7.prev = 19;
          _context7.t0 = _context7["catch"](0);
          console.error("Error updating product:", _context7.t0);
          res.render('error'); // Render an error page if there's an error

        case 23:
        case "end":
          return _context7.stop();
      }
    }
  }, null, null, [[0, 19]]);
};

var productImageDelete = function productImageDelete(req, res) {
  var productID, imagePath, imageDelete;
  return regeneratorRuntime.async(function productImageDelete$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          _context8.prev = 0;
          console.log("dfbvsdbbsfb");
          productID = req.params.id;
          imagePath = req.query.index;
          console.log(imagePath);
          _context8.next = 7;
          return regeneratorRuntime.awrap(productModel.updateOne({
            _id: productID
          }, {
            $pull: {
              image: imagePath
            }
          }));

        case 7:
          imageDelete = _context8.sent;
          console.log(imageDelete);
          res.redirect("/admin/productEdit/".concat(productID));
          _context8.next = 16;
          break;

        case 12:
          _context8.prev = 12;
          _context8.t0 = _context8["catch"](0);
          console.error("Error updating product:", _context8.t0);
          res.render('error'); // Render an error page if there's an error

        case 16:
        case "end":
          return _context8.stop();
      }
    }
  }, null, null, [[0, 12]]);
}; // =====User Side========


var ITEMS_PER_PAGE = 8; // Number of products per page

var product = function product(req, res) {
  var page, totalProducts, totalPages, products, category;
  return regeneratorRuntime.async(function product$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          _context9.prev = 0;
          page = +req.query.page || 1; // Current page, default to 1 if not provided

          _context9.next = 4;
          return regeneratorRuntime.awrap(productModel.countDocuments({
            status: true
          }));

        case 4:
          totalProducts = _context9.sent;
          totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE); // Calculate total pages

          _context9.next = 8;
          return regeneratorRuntime.awrap(productModel.find({
            status: true
          }).populate('category').skip((page - 1) * ITEMS_PER_PAGE) // Skip products based on current page
          .limit(ITEMS_PER_PAGE));

        case 8:
          products = _context9.sent;
          _context9.next = 11;
          return regeneratorRuntime.awrap(categoryModel.find({}));

        case 11:
          category = _context9.sent;
          res.render('product', {
            isUser: req.session.isUser,
            products: products,
            category: category,
            currentPage: page,
            totalPages: totalPages,
            sort: '' // Default sort value

          });
          _context9.next = 19;
          break;

        case 15:
          _context9.prev = 15;
          _context9.t0 = _context9["catch"](0);
          console.error('Error fetching products:', _context9.t0);
          res.status(500).json({
            message: 'Error fetching products.'
          });

        case 19:
        case "end":
          return _context9.stop();
      }
    }
  }, null, null, [[0, 15]]);
};

var categoryProduct = function categoryProduct(req, res) {
  var categoryId, page, totalProducts, totalPages, products, category;
  return regeneratorRuntime.async(function categoryProduct$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          _context10.prev = 0;
          categoryId = req.params.categoryid;
          page = +req.query.page || 1; // Current page, default to 1 if not provided

          _context10.next = 5;
          return regeneratorRuntime.awrap(productModel.countDocuments({
            status: true,
            category: categoryId
          }));

        case 5:
          totalProducts = _context10.sent;
          totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE); // Calculate total pages

          _context10.next = 9;
          return regeneratorRuntime.awrap(productModel.find({
            status: true,
            category: categoryId
          }).populate('category').skip((page - 1) * ITEMS_PER_PAGE) // Skip products based on current page
          .limit(ITEMS_PER_PAGE));

        case 9:
          products = _context10.sent;
          _context10.next = 12;
          return regeneratorRuntime.awrap(categoryModel.find({}));

        case 12:
          category = _context10.sent;
          res.render('product', {
            isUser: req.session.isUser,
            products: products,
            category: category,
            currentPage: page,
            totalPages: totalPages,
            sort: '' // Default sort value

          });
          _context10.next = 20;
          break;

        case 16:
          _context10.prev = 16;
          _context10.t0 = _context10["catch"](0);
          console.error('Error fetching products by category:', _context10.t0);
          res.status(500).json({
            message: 'Error fetching products by category.'
          });

        case 20:
        case "end":
          return _context10.stop();
      }
    }
  }, null, null, [[0, 16]]);
};

var sortProductByPriceLowToHigh = function sortProductByPriceLowToHigh(req, res) {
  var page, totalProducts, totalPages, products, category;
  return regeneratorRuntime.async(function sortProductByPriceLowToHigh$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          _context11.prev = 0;
          page = +req.query.page || 1; // Current page, default to 1 if not provided

          _context11.next = 4;
          return regeneratorRuntime.awrap(productModel.countDocuments({
            status: true
          }));

        case 4:
          totalProducts = _context11.sent;
          totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE); // Calculate total pages

          _context11.next = 8;
          return regeneratorRuntime.awrap(productModel.find({
            status: true
          }).populate('category').sort({
            rate: 1
          }) // Sort by price in ascending order
          .skip((page - 1) * ITEMS_PER_PAGE) // Skip products based on current page
          .limit(ITEMS_PER_PAGE));

        case 8:
          products = _context11.sent;
          _context11.next = 11;
          return regeneratorRuntime.awrap(categoryModel.find({}));

        case 11:
          category = _context11.sent;
          res.render('product', {
            isUser: req.session.isUser,
            products: products,
            category: category,
            currentPage: page,
            totalPages: totalPages,
            sort: 'priceLowToHigh' // Sorting identifier

          });
          _context11.next = 19;
          break;

        case 15:
          _context11.prev = 15;
          _context11.t0 = _context11["catch"](0);
          console.error('Error sorting products by price (low to high):', _context11.t0);
          res.status(500).json({
            message: 'Error sorting products by price (low to high).'
          });

        case 19:
        case "end":
          return _context11.stop();
      }
    }
  }, null, null, [[0, 15]]);
};

var sortProductByPriceHighToLow = function sortProductByPriceHighToLow(req, res) {
  var page, totalProducts, totalPages, products, category;
  return regeneratorRuntime.async(function sortProductByPriceHighToLow$(_context12) {
    while (1) {
      switch (_context12.prev = _context12.next) {
        case 0:
          _context12.prev = 0;
          page = +req.query.page || 1; // Current page, default to 1 if not provided

          _context12.next = 4;
          return regeneratorRuntime.awrap(productModel.countDocuments({
            status: true
          }));

        case 4:
          totalProducts = _context12.sent;
          totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE); // Calculate total pages

          _context12.next = 8;
          return regeneratorRuntime.awrap(productModel.find({
            status: true
          }).populate('category').sort({
            rate: -1
          }) // Sort by price in descending order
          .skip((page - 1) * ITEMS_PER_PAGE) // Skip products based on current page
          .limit(ITEMS_PER_PAGE));

        case 8:
          products = _context12.sent;
          _context12.next = 11;
          return regeneratorRuntime.awrap(categoryModel.find({}));

        case 11:
          category = _context12.sent;
          res.render('product', {
            isUser: req.session.isUser,
            products: products,
            category: category,
            currentPage: page,
            totalPages: totalPages,
            sort: 'priceHighToLow' // Sorting identifier

          });
          _context12.next = 19;
          break;

        case 15:
          _context12.prev = 15;
          _context12.t0 = _context12["catch"](0);
          console.error('Error sorting products by price (high to low):', _context12.t0);
          res.status(500).json({
            message: 'Error sorting products by price (high to low).'
          });

        case 19:
        case "end":
          return _context12.stop();
      }
    }
  }, null, null, [[0, 15]]);
};

var productdetail = function productdetail(req, res) {
  var productId, productData, categoryData, relatedProduct;
  return regeneratorRuntime.async(function productdetail$(_context13) {
    while (1) {
      switch (_context13.prev = _context13.next) {
        case 0:
          _context13.prev = 0;
          productId = req.params.id;
          console.log("Product ID:", productId);
          _context13.next = 5;
          return regeneratorRuntime.awrap(productModel.findOne({
            _id: productId,
            status: true
          }));

        case 5:
          productData = _context13.sent;

          if (productData) {
            _context13.next = 8;
            break;
          }

          return _context13.abrupt("return", res.status(404).send("Product not found or unavailable."));

        case 8:
          _context13.next = 10;
          return regeneratorRuntime.awrap(categoryModel.findById(productData.category));

        case 10:
          categoryData = _context13.sent;

          if (categoryData) {
            _context13.next = 13;
            break;
          }

          return _context13.abrupt("return", res.status(404).send("Category not found or unavailable."));

        case 13:
          _context13.next = 15;
          return regeneratorRuntime.awrap(productModel.find({
            category: productData.category,
            status: true
          }).limit(4));

        case 15:
          relatedProduct = _context13.sent;
          res.render('productDetail', {
            isUser: req.session.isUser,
            products: productData,
            category: categoryData,
            relatedProduct: relatedProduct
          });
          _context13.next = 23;
          break;

        case 19:
          _context13.prev = 19;
          _context13.t0 = _context13["catch"](0);
          console.error("Error in productdetail:", _context13.t0);
          res.render('error'); // Render an error page if there's an error

        case 23:
        case "end":
          return _context13.stop();
      }
    }
  }, null, null, [[0, 19]]);
};

module.exports = {
  // Admin
  adminProduct: adminProduct,
  NewProduct: NewProduct,
  AddProduct: AddProduct,
  ProductStatus: ProductStatus,
  getproductPage: getproductPage,
  productEdit: productEdit,
  productupdate: productupdate,
  productImageDelete: productImageDelete,
  // User
  product: product,
  categoryProduct: categoryProduct,
  productdetail: productdetail,
  sortProductByPriceLowToHigh: sortProductByPriceLowToHigh,
  sortProductByPriceHighToLow: sortProductByPriceHighToLow
};
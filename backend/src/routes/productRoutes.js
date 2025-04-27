const express = require('express');
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes
router.use(authMiddleware.protect);

router
  .route('/')
  .get(
    authMiddleware.restrictTo('admin', 'manager', 'staff'), 
    productController.getAllProducts
  )
  .post(
    authMiddleware.restrictTo('admin', 'manager', 'staff'), 
    productController.createProduct
  );

// Get product by barcode
router
  .route('/barcode/:barcode')
  .get(
    authMiddleware.restrictTo('admin', 'manager', 'staff'),
    productController.getProductByBarcode
  );

router
  .route('/:id')
  .get(
    authMiddleware.restrictTo('admin', 'manager', 'staff'), 
    productController.getProduct
  )
  .patch(
    authMiddleware.restrictTo('admin', 'manager', 'staff'), 
    productController.updateProduct
  )
  .delete(
    authMiddleware.restrictTo('admin', 'manager', 'staff'), 
    productController.deleteProduct
  );

module.exports = router;

const AppError = require('../utils/appError');

// Mock data for refund requests
let refundRequests = [
  { id: 1, productName: 'Product A', status: 'pending' },
  { id: 2, productName: 'Product B', status: 'pending' }
];

exports.getAllRefunds = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: refundRequests
  });
};

exports.approveRefund = (req, res, next) => {
  try {
    const { id } = req.params;
    const request = refundRequests.find(req => req.id === parseInt(id));
    if (!request) throw new AppError('Refund request not found', 404);
    request.status = 'approved';
    res.status(200).json({
      status: 'success',
      data: request
    });
  } catch (err) {
    next(err);
  }
};

exports.rejectRefund = (req, res, next) => {
  try {
    const { id } = req.params;
    const request = refundRequests.find(req => req.id === parseInt(id));
    if (!request) throw new AppError('Refund request not found', 404);
    request.status = 'rejected';
    res.status(200).json({
      status: 'success',
      data: request
    });
  } catch (err) {
    next(err);
  }
};

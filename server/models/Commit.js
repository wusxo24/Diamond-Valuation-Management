const mongoose = require('mongoose');
const { Schema } = mongoose;

const commitSchema = new Schema({
  recordId: {
    type: Schema.Types.ObjectId,
    ref: 'ValuationRecord',
    required: true
  },
  reasonForLoss: { type: String, required: true }, // Why the receipt was lost
  customerName: { type: String, required: true }, // Customer's confirmation
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true },
  dateIssued: { type: Date, default: Date.now },
  status: { type: String, enum: ['Pending by Customer','Pending by Consultant', 'Approved', 'Rejected'], default: 'Pending By Customer' }
  
});

const Commit = mongoose.model('Commit', commitSchema);

module.exports = Commit;

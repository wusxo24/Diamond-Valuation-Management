const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const ort = require('onnxruntime-node');
const { mongoose } = require('mongoose');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const receiptRoutes = require('./routes/receiptRoutes');
const valuationRecordRoutes = require('./routes/valuationRecordRoutes');
const commitRoutes = require('./routes/commitRoutes');
const sealRoutes = require('./routes/sealRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const stripe = require ('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('./models/Booking');
const Transaction = require('./models/Transaction');
const blogRoutes = require('./routes/blogRoutes');
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const historicalPricesRouter = require('./routes/historicalPrices');
const feedbackRoutes = require('./routes/feedbackRoutes');
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log(err));

const app = express();

// Stripe Middleware 
app.post('/api/webhook', express.raw({type: 'application/json'}), async (request, response) => {
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event checkout.session.completed to update paymentStatus to 'Paid'
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      // Update the booking's payment status to "Paid"
      try {
        await Booking.findByIdAndUpdate(session.metadata.bookingId, { paymentStatus: 'Paid', paymentIntentId: session.payment_intent });
        console.log(`Payment status updated for booking ${session.metadata.bookingId}`);
      } catch (error) {
        console.error('Error updating payment status:', error);
      }

      break;
      case 'charge.succeeded':
        const charge = event.data.object;
        // Create a new Transaction object
        try {
          const transaction = new Transaction({
            time: new Date(charge.created * 1000 + 7 * 60 * 60 * 1000).toISOString(),
            amount: charge.amount,
            currency: charge.currency,
            customerEmail: charge.billing_details.email,
            customerName: charge.billing_details.name,
            bookingId: charge.metadata.bookingId, // Assuming bookingId is stored in metadata
            paymentMethod: charge.payment_method_details.type,
            isLiveMode: charge.livemode,
          });
  
          await transaction.save();
          console.log(`Transaction recorded: ${transaction._id}`);
        } catch (error) {
          console.error('Error recording transaction:', error);
        }
        break;
        case 'charge.refunded':
          const refund = event.data.object;
          // Update the booking's payment status to "Refunded"
          try {
            const bookingId = refund.metadata.bookingId;
            await Booking.findByIdAndUpdate(bookingId, { paymentStatus: 'Refunded' });
            await Transaction.findOneAndDelete({ bookingId: refund.metadata.bookingId });
            console.log(`Payment status updated to refunded for booking ${bookingId}`);
          } catch (error) {
            console.error('Error updating refund status:', error);
          }
          break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  response.send();
});





app.use(cors({
  origin: 'https://diamond-valuation-management-nine.vercel.app', 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use('/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api', bookingRoutes);
app.use('/api', receiptRoutes); 
app.use('/api', valuationRecordRoutes)
app.use('/api', commitRoutes);
app.use('/api', sealRoutes);
app.use('/api', serviceRoutes); 
app.use('/api', paymentRoutes);
app.use('/api', transactionRoutes);
app.use('/api', blogRoutes);
app.use('/api', historicalPricesRouter);
app.use('/api', feedbackRoutes);
// const modelPath = 'diamond_price_model.onnx'; // replace with the path to your ONNX model

// // Function to preprocess input data
// function preprocess(data) {
//     const { carat, cut, color, clarity, depth, table, x, y, z } = data;

//     // One-hot encoding for categorical variables
//     const cutEncoded = {
//         Fair: [1, 0, 0],
//         Good: [0, 1, 0],
//         'Very Good': [0, 0, 1]
//     }[cut] || [0, 0, 0];

//     const colorEncoded = {
//         D: [1, 0, 0, 0, 0, 0, 0],
//         E: [0, 1, 0, 0, 0, 0, 0],
//         F: [0, 0, 1, 0, 0, 0, 0],
//         G: [0, 0, 0, 1, 0, 0, 0],
//         H: [0, 0, 0, 0, 1, 0, 0],
//         I: [0, 0, 0, 0, 0, 1, 0],
//         J: [0, 0, 0, 0, 0, 0, 1]
//     }[color] || [0, 0, 0, 0, 0, 0, 0];

//     const clarityEncoded = {
//         I1: [1, 0, 0, 0, 0, 0, 0, 0],
//         IF: [0, 1, 0, 0, 0, 0, 0, 0],
//         SI1: [0, 0, 1, 0, 0, 0, 0, 0],
//         SI2: [0, 0, 0, 1, 0, 0, 0, 0],
//         VS1: [0, 0, 0, 0, 1, 0, 0, 0],
//         VS2: [0, 0, 0, 0, 0, 1, 0, 0],
//         VVS1: [0, 0, 0, 0, 0, 0, 1, 0],
//         VVS2: [0, 0, 0, 0, 0, 0, 0, 1]
//     }[clarity] || [0, 0, 0, 0, 0, 0, 0, 0];

//     // Additional features
   
//     // Combine all features into a single array
//     const features = [
//         carat, depth, table,
//         ...cutEncoded,
//         ...colorEncoded,
//         ...clarityEncoded,
        
//     ];

//     return features;
// }

// // Load the ONNX model
// async function loadModel() {
//     return await ort.InferenceSession.create(modelPath);
// }

// app.post('/predict', async (req, res) => {
//     const input = req.body;
//     const features = preprocess(input);

//     // Ensure the input tensor has the correct shape
//     const tensor = new ort.Tensor('float32', Float32Array.from(features), [1, features.length]);

//     try {
//         const session = await loadModel();
//         const feeds = { input: tensor };
//         const results = await session.run(feeds);
//         const prediction = results.output.data[0]; // Adjust based on your model's output

//         res.json({ price: prediction });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Failed to make prediction' });
//     }
// });






const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

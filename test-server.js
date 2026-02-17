// Test the actual API without MongoDB connection
const express = require('express');
const cors = require('cors');
const healthRoutes = require('./src/routes/health');
const errorHandler = require('./src/middlewares/errorHandler');
const notFound = require('./src/middlewares/notFound');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/health', healthRoutes);
app.use(notFound);
app.use(errorHandler);

const server = app.listen(3000, () => {
  console.log('✓ Server started on http://localhost:3000');
  console.log('✓ Health check endpoint: http://localhost:3000/api/health');
  console.log('\nTest it by opening that URL in your browser or run:');
  console.log('  curl http://localhost:3000/api/health');
  console.log('\nPress Ctrl+C to stop the server');
});

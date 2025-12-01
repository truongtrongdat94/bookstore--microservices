import app from './app';
import config from './config';

const PORT = config.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📡 Proxying to services:`);
  console.log(`   User Service: ${config.USER_SERVICE_URL}`);
  console.log(`   Book Service: ${config.BOOK_SERVICE_URL}`);
  console.log(`   Order Service: ${config.ORDER_SERVICE_URL}`);
  console.log(`   Notification Service: ${config.NOTIFICATION_SERVICE_URL}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 API Gateway shutting down...');
  process.exit(0);
});

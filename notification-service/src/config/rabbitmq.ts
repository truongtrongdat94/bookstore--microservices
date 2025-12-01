import amqp from 'amqplib';

let connection: amqp.ChannelModel | null = null;
let channel: amqp.Channel | null = null;

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';

export async function connectRabbitMQ(): Promise<amqp.Channel> {
  try {
    if (channel) return channel;
    
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    
    console.log('Connected to RabbitMQ');
    
    // Handle connection close
    connection.on('close', () => {
      console.log('RabbitMQ connection closed');
      channel = null;
      connection = null;
    });
    
    connection.on('error', (err) => {
      console.error('RabbitMQ connection error:', err);
      channel = null;
      connection = null;
    });
    
    return channel;
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error);
    throw error;
  }
}

export async function getChannel(): Promise<amqp.Channel> {
  if (!channel) {
    return connectRabbitMQ();
  }
  return channel;
}

export async function closeRabbitMQ(): Promise<void> {
  try {
    if (channel) {
      await channel.close();
      channel = null;
    }
    if (connection) {
      await connection.close();
      connection = null;
    }
    console.log('RabbitMQ connection closed');
  } catch (error) {
    console.error('Error closing RabbitMQ connection:', error);
  }
}

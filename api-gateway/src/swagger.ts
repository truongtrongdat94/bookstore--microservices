import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import fs from 'fs';

export function setupSwagger(app: express.Application): void {
  try {
    // Log the current directory and all files in docs/openapi
    console.log('Current directory:', __dirname);
    console.log('Files in docs/openapi:');
    
    const openApiDir = path.resolve(__dirname, '../docs/openapi');
    console.log('Looking in:', openApiDir);
    
    if (fs.existsSync(openApiDir)) {
      fs.readdirSync(openApiDir).forEach(file => {
        console.log(' -', file, fs.statSync(path.join(openApiDir, file)).size + ' bytes');
      });
    } else {
      console.log('Directory does not exist!');
    }

    // Try to load OpenAPI spec
    const openapiPath = path.resolve(__dirname, '../docs/openapi/openapi.yaml');
    console.log('Loading OpenAPI spec from:', openapiPath);
    
    if (!fs.existsSync(openapiPath)) {
      console.error('OpenAPI spec file not found!');
      return;
    }
    
    const fileStats = fs.statSync(openapiPath);
    console.log('File size:', fileStats.size, 'bytes');
    
    if (fileStats.size === 0) {
      console.error('OpenAPI spec file is empty!');
      return;
    }
    
    // Read file content
    const fileContent = fs.readFileSync(openapiPath, 'utf8');
    console.log('File content sample:', fileContent.substring(0, 100) + '...');
    
    // Load YAML
    const openapiDocument = YAML.load(openapiPath);
    console.log('OpenAPI document loaded successfully');
    
    // Explicitly set JSON endpoint
    app.get('/api-docs.json', (req, res) => {
      console.log('Serving /api-docs.json');
      res.json(openapiDocument);
    });
    
    // Explicitly set YAML endpoint
    app.get('/api-docs.yaml', (req, res) => {
      console.log('Serving /api-docs.yaml');
      res.sendFile(openapiPath);
    });
    
    // Set up Swagger UI
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiDocument, {
      explorer: true,
    }));
    
    console.log('✅ Swagger UI setup complete at /api-docs');
  } catch (error) {
    console.error('❌ Error setting up Swagger:', error);
  }
}

import swaggerAutogen from 'swagger-autogen';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const doc = {
  info: {
    version: 'v1.0.0',
    title: 'ROI API',
    description: 'Investment and referral based platform using the MERN Stack'
  },
  host: `localhost:${process.env.PORT || 8000}`,
  basePath: '/',
  schemes: ['http', 'https'],
};

const outputFile = './src/swagger-output.json';

const endpointFiles = [
  './src/app.ts'
];

swaggerAutogen()(outputFile, endpointFiles, doc);
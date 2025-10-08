const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Personal Finance Tracker API',
            version: '1.0.0',
            description: 'API documentation for Personal Finance Tracker application',
            contact: {
                name: 'API Support',
                email: 'support@financetracker.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        username: { type: 'string' },
                        email: { type: 'string' },
                        role: { type: 'string', enum: ['admin', 'user', 'read-only'] },
                        created_at: { type: 'string', format: 'date-time' }
                    }
                },
                Transaction: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        user_id: { type: 'integer' },
                        type: { type: 'string', enum: ['income', 'expense'] },
                        category: { type: 'string' },
                        amount: { type: 'number' },
                        description: { type: 'string' },
                        date: { type: 'string', format: 'date' },
                        created_at: { type: 'string', format: 'date-time' }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' }
                    }
                }
            }
        },
        tags: [
            { name: 'Auth', description: 'Authentication endpoints' },
            { name: 'Transactions', description: 'Transaction management' },
            { name: 'Analytics', description: 'Analytics and statistics' },
            { name: 'Users', description: 'User management (admin only)' }
        ]
    },
    apis: ['./routes/*.js', './controllers/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }'
    }));
    
    // Serve swagger.json
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
};

module.exports = { setupSwagger };
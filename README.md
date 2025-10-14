```
student-admin-backend/
├── src/
│   ├── config/
│   │   ├── database.js          # Database configuration
│   │   ├── env.js                # Environment variables
│   │   └── constants.js          # App constants
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js    # Authentication middleware
│   │   ├── validate.middleware.js # Validation middleware
│   │   ├── error.middleware.js   # Error handling middleware
│   │   ├── rateLimiter.js        # Rate limiting
│   │   └── upload.middleware.js  # File upload handling
│   │
│   ├── models/
│   │   ├── user.model.js
│   │   ├── student.model.js
│   │   └── admin.model.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── student.controller.js
│   │   └── admin.controller.js
│   │
│   ├── services/
│   │   ├── auth.service.js       # Business logic
│   │   ├── email.service.js
│   │   ├── student.service.js
│   │   └── upload.service.js
│   │
│   ├── routes/
│   │   ├── index.js              # Route aggregator
│   │   ├── auth.routes.js
│   │   ├── student.routes.js
│   │   └── admin.routes.js
│   │
│   ├── utils/
│   │   ├── logger.js             # Winston logger
│   │   ├── ApiError.js           # Custom error class
│   │   ├── ApiResponse.js        # Standard response
│   │   ├── asyncHandler.js       # Async wrapper
│   │   ├── validation.js         # Validation helpers
│   │   └── helpers.js            # Common functions
│   │
│   ├── validators/
│   │   ├── auth.validator.js     # Joi/Zod schemas
│   │   └── student.validator.js
│   │
│   ├── database/
│   │   ├── connection.js
│   │   └── migrations/
│   │
│   └── app.js                    # Express app setup
│
├── tests/
│   ├── unit/
│   └── integration/
│
├── logs/                          # Log files
├── uploads/                       # Uploaded files
├── .env
├── .env.example
├── .gitignore
├── server.js                      # Entry point
├── package.json
└── README.md
```
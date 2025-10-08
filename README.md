live link : https://finance-tracker-snowy-pi.vercel.app/
# 🏦 Professional Finance Tracker

A comprehensive full-stack finance management application with **Role-Based Access Control (RBAC)**, built with React, Node.js, PostgreSQL, and Redis.

## 🚀 Features

### 🔐 Role-Based Access Control (RBAC)
- **Admin**: Full system access, user management, all transactions
- **User**: Manage own transactions, view own analytics
- **Read-Only**: View-only access to own data

### 💰 Transaction Management
- ✅ Create, edit, delete transactions (admin/user only)
- ✅ Categorized transactions (Food, Transport, Entertainment, etc.)
- ✅ Advanced search, filter, and pagination
- ✅ Real-time validation and security

### 📊 Analytics Dashboard
- ✅ Monthly/yearly spending overview
- ✅ Category-wise expense breakdown
- ✅ Income vs Expense trends
- ✅ Interactive charts (Pie, Bar, Line)
- ✅ Redis caching (15-minute analytics cache)

### 🛡️ Security & Performance
- ✅ JWT-based authentication
- ✅ XSS and SQL injection protection
- ✅ Rate limiting per endpoint
- ✅ Redis caching for performance
- ✅ Input validation and sanitization

## 🏗️ Tech Stack

**Frontend:**
- React 18+ with Hooks
- Recharts for data visualization
- Tailwind CSS for styling
- Axios for API calls

**Backend:**
- Node.js + Express.js
- PostgreSQL database
- Redis for caching
- JWT authentication
- Swagger API documentation

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Transactions (RBAC Protected)
- `GET /api/transactions` - Get transactions (all roles)
- `POST /api/transactions` - Create transaction (admin/user only)
- `PUT /api/transactions/:id` - Update transaction (admin/user only)
- `DELETE /api/transactions/:id` - Delete transaction (admin/user only)

### Analytics (RBAC Protected)
- `GET /api/analytics` - Get user analytics (all roles)
- `GET /api/analytics/dashboard` - Dashboard stats (all roles)

### Admin Only
- `GET /api/admin/transactions` - All transactions across users
- `GET /api/admin/stats` - System statistics
- `GET /api/users` - User management
- `PUT /api/users/:id/role` - Update user roles

## 🔑 Demo Credentials

### Admin Access
- **Email:** `admin@finance.com`
- **Password:** `admin123`
- **Permissions:** Full system access

### Regular User
- **Email:** `user@finance.com`
- **Password:** `user123`
- **Permissions:** Own transactions only

### Read-Only User
- **Email:** `readonly@finance.com`
- **Password:** `readonly123`
- **Permissions:** View-only access

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- PostgreSQL 12+
- Redis 6+

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/finance-tracker.git
cd finance-tracker
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Configure your database and Redis URLs in .env
npm run setup-db  # Initialize database
node create-admin.js  # Create admin user
npm run dev
```

3. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

4. **Access the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api-docs

## 🔒 RBAC Implementation

### Backend Middleware
```javascript
// Role-based route protection
router.post('/transactions', 
  authMiddleware,
  roleCheck('admin', 'user'),  // Only admin and user
  readOnlyCheck,               // Prevent read-only modifications
  createTransaction
);

// Admin-only routes
router.get('/admin/users', 
  authMiddleware,
  roleCheck('admin'),          // Admin only
  getAllUsers
);
```

### Frontend Conditional Rendering
```javascript
const { canCreateTransaction, isAdmin, isReadOnly } = useAuth();

// Show create button only if user can create
{canCreateTransaction() && (
  <button onClick={handleCreate}>Add Transaction</button>
)}

// Show admin panel only for admins
{isAdmin() && (
  <AdminPanel />
)}

// Show read-only indicator
{isReadOnly() && (
  <span className="text-orange-600">(View Only)</span>
)}
```

## 📊 Caching Strategy

- **Analytics Data**: 15-minute cache
- **Categories**: 1-hour cache
- **Dashboard Stats**: 15-minute cache
- **Auto-invalidation**: On data modifications

## 🛡️ Security Features

- **Authentication**: JWT tokens with role claims
- **Authorization**: Route-level RBAC enforcement
- **Input Validation**: XSS and SQL injection protection
- **Rate Limiting**: Different limits per endpoint type
- **CORS**: Configured for production deployment

## 📈 Performance Optimizations

- **React**: useCallback, useMemo, lazy loading
- **Backend**: Redis caching, connection pooling
- **Database**: Indexed queries, pagination
- **Frontend**: Code splitting, virtual scrolling

## 🚀 Deployment

### Environment Variables
```env
# Backend (.env)
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=your-secret-key
REDIS_URL=redis://host:port
NODE_ENV=production

# Frontend (.env)
VITE_API_URL=https://your-api-domain.com/api
```

### Production Deployment
- **Frontend**: Vercel, Netlify
- **Backend**: Render, Railway, AWS
- **Database**: PostgreSQL (Render, AWS RDS)
- **Cache**: Redis (Upstash, AWS ElastiCache)

## 📚 API Documentation

Full API documentation available at `/api-docs` when running the server.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Key Achievements

✅ **Complete RBAC Implementation**  
✅ **Professional Security Standards**  
✅ **High-Performance Caching**  
✅ **Comprehensive API Documentation**  
✅ **Production-Ready Architecture**  
✅ **Modern React Best Practices**  

---

**Built with ❤️ for professional finance management**

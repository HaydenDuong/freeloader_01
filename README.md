# Freeloader MVP 🎉

A platform connecting event organizers with students, offering free goods and services at events.

## 🚀 Features

### User Authentication
- **Sign Up**: Register as either an Organizer or Student
- **Login**: Secure authentication with JWT tokens
- **Role-based Access**: Different dashboards for different user types

### For Organizers
- Create and publish events
- Manage event details (title, description, location, date/time)
- Specify goods provided (free pizza, t-shirts, etc.)
- View all created events

### For Students
- Browse all available events
- View event details and free goods offered
- See upcoming vs past events
- Discover events by organizer

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **SQLite** database
- **JWT** authentication
- **bcryptjs** for password hashing

### Frontend
- **React** with TypeScript
- **React Router** for navigation
- **Axios** for API calls
- **CSS3** with responsive design

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd freeloader-mvp
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```
   This installs both backend and frontend dependencies.

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```
   JWT_SECRET=your_secure_jwt_secret_key
   PORT=5000
   NODE_ENV=development
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```
   This starts both the backend server (port 5000) and frontend (port 3000).

### Alternative Start Commands

- **Backend only**: `npm run server`
- **Frontend only**: `npm run client`
- **Production build**: `npm run build`
- **Production start**: `npm start`

## 📱 Usage

### Getting Started

1. **Visit** `http://localhost:3000`
2. **Register** as either an Organizer or Student
3. **Login** with your credentials

### For Organizers

1. Access the Organizer Dashboard after login
2. Click "Create New Event" to add events
3. Fill in event details:
   - Event title and description
   - Location and date/time
   - List of goods provided
4. View all your created events

### For Students

1. Access the Student Dashboard after login
2. Browse all available events
3. View events sorted chronologically
4. See upcoming events highlighted
5. Check out free goods offered at each event

## 🗃️ Database Schema

### Users Table
- `id` (Primary Key)
- `email` (Unique)
- `password` (Hashed)
- `role` (organizer/student)
- `created_at`

### Events Table
- `id` (Primary Key)
- `title`
- `description`
- `location`
- `date_time`
- `goods_provided` (JSON array)
- `organizer_id` (Foreign Key)
- `created_at`

## 🔒 Security Features

- **Password Hashing**: Secure bcrypt hashing
- **JWT Authentication**: Stateless token-based auth
- **Role-based Access Control**: Route protection by user role
- **Input Validation**: Server-side validation for all inputs

## 🎨 Design Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Clean, gradient-based design
- **Intuitive Navigation**: Role-based routing
- **Interactive Elements**: Hover effects and smooth transitions
- **Accessibility**: Proper form labels and semantic HTML

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Events
- `POST /api/events` - Create event (organizers only)
- `GET /api/events` - Get all events (students only)
- `GET /api/events/my-events` - Get organizer's events

## 🧪 Testing the Application

### Test Scenarios

1. **Registration Flow**
   - Register as organizer and student
   - Test role-based redirects

2. **Authentication**
   - Login/logout functionality
   - Protected route access

3. **Event Creation** (Organizer)
   - Create events with various goods
   - Form validation testing

4. **Event Browsing** (Student)
   - View all events
   - Check event details and goods

### Sample Data

Create test events with various goods like:
- Free pizza and drinks
- T-shirts and stickers
- Tech gadgets
- Books and supplies

## 🚀 Deployment

### Local Production Build

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Set environment to production:
   ```bash
   export NODE_ENV=production
   ```

3. Start the server:
   ```bash
   npm start
   ```

### Environment Variables for Production

```
JWT_SECRET=your_very_secure_jwt_secret
PORT=5000
NODE_ENV=production
```

## 🔮 Future Enhancements

- Event RSVP functionality
- Image uploads for events
- Event categories and filtering
- Email notifications
- Real-time chat for events
- Mobile app version
- Social media integration
- Event reviews and ratings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if needed
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the existing issues
2. Create a new issue with detailed description
3. Include steps to reproduce any bugs

---

**Happy Freeloading! 🎉** Find awesome events with free stuff!

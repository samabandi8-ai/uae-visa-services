# UAE Visa Services - Backend API

This is the backend API server for the UAE Visa Services website, built with Node.js, Express, and SQLite.

## Features

- **Visa Application Processing**: Handle visa application submissions with file uploads
- **Contact Management**: Process contact form submissions
- **Feedback System**: Collect and manage user feedback
- **Newsletter Subscriptions**: Manage email newsletter subscriptions
- **File Upload Support**: Handle document uploads (CV, Aadhar, Passport copies, etc.)
- **Email Notifications**: Send confirmation emails to users
- **Rate Limiting**: Protect against spam and abuse
- **Input Validation**: Comprehensive form validation
- **Security**: Helmet.js for security headers, CORS protection

## Prerequisites

- Node.js (version 14 or higher)
- npm (Node Package Manager)

## Installation

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file with your actual configuration:
   - Update SMTP settings for email functionality
   - Change JWT_SECRET to a secure random string
   - Configure other settings as needed

4. **Create uploads directory** (if not exists):
   ```bash
   mkdir uploads
   ```

## Running the Server

### Development Mode
```bash
npm run dev
```
This will start the server with nodemon for automatic restarts on file changes.

### Production Mode
```bash
npm start
```

## API Endpoints

### Health Check
- **GET** `/api/health` - Check if the API is running

### Visa Applications
- **POST** `/api/visa-application` - Submit a new visa application
- **GET** `/api/application-status/:id` - Get application status by ID

### Contact Messages
- **POST** `/api/contact` - Submit a contact message

### Feedback
- **POST** `/api/feedback` - Submit feedback
- **GET** `/api/public-feedback` - Get approved public feedback

### Newsletter
- **POST** `/api/newsletter` - Subscribe to newsletter

## Database Schema

The application uses SQLite with the following tables:

### visa_applications
- Stores all visa application data
- Includes personal information, passport details, employment info
- Special fields for retired security officers
- File upload references

### contact_messages
- Stores contact form submissions
- Includes inquiry type, urgency level, preferred contact method

### feedback
- Stores user feedback and ratings
- Includes approval status for public display

### newsletter_subscriptions
- Manages email newsletter subscriptions
- Supports different subscription types (weekly digest, breaking news)

## File Upload Configuration

- **Maximum file size**: 5MB per file
- **Allowed file types**: JPEG, JPG, PNG, GIF, PDF, DOC, DOCX
- **Upload directory**: `./uploads/`
- **Supported fields**:
  - `cv` - CV/Resume file
  - `aadhar` - Aadhar card copy
  - `passportCopy` - Passport copy
  - `photo` - Passport-size photo
  - `additionalDocuments` - Additional supporting documents (up to 5 files)

## Email Configuration

The system sends confirmation emails for:
- Visa application submissions
- Contact form submissions

To configure email:
1. Update SMTP settings in `.env` file
2. For Gmail, use App Passwords instead of regular password
3. Enable "Less secure app access" if using regular SMTP

## Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing protection
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Express-validator for form validation
- **File Upload Security**: File type and size restrictions
- **SQL Injection Protection**: Parameterized queries

## Error Handling

- Comprehensive error handling for all endpoints
- Validation errors return detailed error messages
- File upload errors are handled gracefully
- Database errors are logged and return generic error messages

## Development

### Adding New Endpoints
1. Add route handler in `server.js`
2. Add validation middleware if needed
3. Update database schema if required
4. Test the endpoint

### Database Management
- Database file: `visa_services.db`
- Tables are created automatically on first run
- Use SQLite browser tools for manual database inspection

## Production Deployment

1. **Environment Setup**:
   - Set `NODE_ENV=production`
   - Use strong JWT_SECRET
   - Configure proper SMTP settings
   - Set up proper CORS origins

2. **Security Considerations**:
   - Use HTTPS in production
   - Set up proper firewall rules
   - Regular security updates
   - Monitor logs for suspicious activity

3. **Performance**:
   - Consider using PM2 for process management
   - Set up log rotation
   - Monitor server resources

## Troubleshooting

### Common Issues

1. **Email not sending**:
   - Check SMTP configuration
   - Verify email credentials
   - Check firewall/network restrictions

2. **File upload fails**:
   - Check file size (max 5MB)
   - Verify file type is allowed
   - Ensure uploads directory exists and is writable

3. **Database errors**:
   - Check if database file is writable
   - Verify SQLite3 is properly installed

4. **CORS errors**:
   - Update CORS_ORIGINS in .env file
   - Ensure frontend URL is included

## API Testing

You can test the API using tools like:
- Postman
- curl
- Thunder Client (VS Code extension)

Example curl command:
```bash
curl -X GET http://localhost:3000/api/health
```

## Support

For technical support or questions about the backend API, please contact the development team.

## License

MIT License - see LICENSE file for details.
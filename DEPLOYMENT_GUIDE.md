# UAE Visa Services - Complete Deployment Guide

This guide provides step-by-step instructions for deploying the UAE Visa Services website with both frontend and backend components.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Frontend Setup](#frontend-setup)
4. [Backend Setup](#backend-setup)
5. [Database Configuration](#database-configuration)
6. [Email Configuration](#email-configuration)
7. [File Upload Configuration](#file-upload-configuration)
8. [Testing the Application](#testing-the-application)
9. [Production Deployment](#production-deployment)
10. [Troubleshooting](#troubleshooting)
11. [Maintenance](#maintenance)

## 🔧 Prerequisites

### System Requirements
- **Node.js**: Version 14.x or higher
- **npm**: Version 6.x or higher
- **Web Browser**: Modern browser (Chrome, Firefox, Safari, Edge)
- **Text Editor**: VS Code, Sublime Text, or similar

### Required Accounts
- **Email Service**: Gmail account for SMTP (or other email provider)
- **Domain**: Optional for production deployment
- **Hosting**: VPS or cloud hosting for production

## 📁 Project Structure

Your project should have the following structure:

```
final/
├── backend/
│   ├── node_modules/
│   ├── uploads/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   ├── server.js
│   ├── README.md
│   └── visa_services.db (created automatically)
├── css/
│   └── style.css
├── js/
│   ├── script.js
│   └── api.js
├── images/
│   ├── uae-flag.svg
│   ├── visa-services.svg
│   └── uae-skyline.svg
├── pages/
│   ├── apply-visa.html
│   ├── services.html
│   ├── contact.html
│   ├── rules.html
│   ├── feedback.html
│   └── news.html
└── index.html
```

## 🌐 Frontend Setup

### Step 1: Verify Frontend Files

Ensure all frontend files are in place:

1. **Main HTML file**: `index.html`
2. **Page files**: All files in `pages/` directory
3. **Stylesheets**: `css/style.css`
4. **JavaScript files**: `js/script.js` and `js/api.js`
5. **Images**: All SVG files in `images/` directory

### Step 2: Test Frontend Locally

#### Option A: Using Live Server (Recommended)

1. Install Live Server extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"
4. Your website will open at `http://127.0.0.1:5500`

#### Option B: Using Python HTTP Server

```bash
# Navigate to project directory
cd c:\Users\hazard\Desktop\final

# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Access at: `http://localhost:8000`

#### Option C: Using Node.js HTTP Server

```bash
# Install http-server globally
npm install -g http-server

# Navigate to project directory
cd c:\Users\hazard\Desktop\final

# Start server
http-server -p 8000
```

Access at: `http://localhost:8000`

### Step 3: Verify Frontend Functionality

Test the following pages:
- ✅ Homepage (`index.html`)
- ✅ Apply Visa (`pages/apply-visa.html`)
- ✅ Services (`pages/services.html`)
- ✅ Contact (`pages/contact.html`)
- ✅ Rules & Regulations (`pages/rules.html`)
- ✅ Feedback (`pages/feedback.html`)
- ✅ News (`pages/news.html`)

## 🔧 Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd c:\Users\hazard\Desktop\final\backend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- express
- cors
- body-parser
- multer
- sqlite3
- bcryptjs
- jsonwebtoken
- nodemailer
- express-validator
- helmet
- express-rate-limit
- dotenv

### Step 3: Environment Configuration

1. **Copy environment template**:
   ```bash
   copy .env.example .env
   ```

2. **Edit `.env` file** with your configuration:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   
   # JWT Secret (CHANGE THIS!)
   JWT_SECRET=your-super-secret-jwt-key-change-in-production-12345
   
   # Email Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   
   # Database Configuration
   DB_PATH=./visa_services.db
   
   # File Upload Configuration
   MAX_FILE_SIZE=5242880
   UPLOADS_DIR=./uploads
   
   # CORS Origins
   CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:5500,http://localhost:5500,http://localhost:8000
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   
   # Business Information
   BUSINESS_NAME=UAE Visa Services
   BUSINESS_EMAIL=info@uaevisaservices.com
   BUSINESS_PHONE=+971-4-XXX-XXXX
   BUSINESS_ADDRESS=Dubai, UAE
   ```

### Step 4: Create Uploads Directory

```bash
mkdir uploads
```

### Step 5: Start Backend Server

#### Development Mode (with auto-restart)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

The server will start at: `http://localhost:3000`

### Step 6: Verify Backend API

Test the health endpoint:
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "UAE Visa Services API is running",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

## 🗄️ Database Configuration

### Automatic Database Setup

The SQLite database (`visa_services.db`) is created automatically when you start the server for the first time. It includes these tables:

1. **visa_applications**: Stores visa application data
2. **contact_messages**: Stores contact form submissions
3. **feedback**: Stores user feedback and ratings
4. **newsletter_subscriptions**: Manages email subscriptions

### Manual Database Inspection

To inspect the database manually:

1. **Install SQLite Browser**: Download from [sqlitebrowser.org](https://sqlitebrowser.org/)
2. **Open database file**: `backend/visa_services.db`
3. **Browse tables**: View data and structure

## 📧 Email Configuration

### Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `SMTP_PASS`

3. **Update `.env` file**:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-character-app-password
   ```

### Other Email Providers

#### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

#### Yahoo Mail
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

### Test Email Configuration

Submit a test contact form to verify email delivery.

## 📁 File Upload Configuration

### Upload Directory Setup

The `uploads/` directory is created automatically. Ensure proper permissions:

```bash
# Windows (if needed)
icacls uploads /grant Everyone:F

# Linux/Mac (if deploying there)
chmod 755 uploads
```

### Supported File Types

- **Images**: JPEG, JPG, PNG, GIF
- **Documents**: PDF, DOC, DOCX
- **Maximum size**: 5MB per file

### Upload Fields

- `cv`: CV/Resume file
- `aadhar`: Aadhar card copy
- `passportCopy`: Passport copy
- `photo`: Passport-size photo
- `additionalDocuments`: Additional documents (up to 5 files)

## 🧪 Testing the Application

### Step 1: Start Both Servers

1. **Backend Server**:
   ```bash
   cd backend
   npm start
   ```
   Running at: `http://localhost:3000`

2. **Frontend Server**:
   ```bash
   # Using Live Server or http-server
   ```
   Running at: `http://localhost:5500` (or your chosen port)

### Step 2: Test All Forms

#### Visa Application Form
1. Navigate to "Apply Visa" page
2. Fill out all required fields
3. Upload test documents
4. Submit form
5. Check for success message and email confirmation

#### Contact Form
1. Navigate to "Contact" page
2. Fill out contact form
3. Submit and verify email delivery

#### Feedback Form
1. Navigate to "Feedback" page
2. Submit feedback
3. Verify submission success

#### Newsletter Subscription
1. Use newsletter forms on various pages
2. Test subscription functionality

### Step 3: Test API Endpoints

Using curl or Postman:

```bash
# Health check
curl http://localhost:3000/api/health

# Get public feedback
curl http://localhost:3000/api/public-feedback

# Check application status (replace with actual ID)
curl http://localhost:3000/api/application-status/1
```

## 🚀 Production Deployment

### Option 1: VPS Deployment

#### Server Setup
1. **Get a VPS** (DigitalOcean, Linode, AWS EC2, etc.)
2. **Install Node.js**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Install PM2** (Process Manager):
   ```bash
   sudo npm install -g pm2
   ```

#### Deploy Application
1. **Upload files** to server (using SCP, SFTP, or Git)
2. **Install dependencies**:
   ```bash
   cd /path/to/your/app/backend
   npm install --production
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   nano .env  # Edit with production values
   ```

4. **Start with PM2**:
   ```bash
   pm2 start server.js --name "uae-visa-api"
   pm2 startup
   pm2 save
   ```

#### Web Server Setup (Nginx)
1. **Install Nginx**:
   ```bash
   sudo apt update
   sudo apt install nginx
   ```

2. **Configure Nginx**:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       # Frontend
       location / {
           root /path/to/your/frontend;
           index index.html;
           try_files $uri $uri/ =404;
       }
       
       # Backend API
       location /api {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **Enable site**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/your-site /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### Option 2: Shared Hosting

For shared hosting that supports Node.js:

1. **Upload files** via FTP/cPanel
2. **Install dependencies** through hosting control panel
3. **Configure environment variables** in hosting settings
4. **Set up domain** to point to your application

### Option 3: Cloud Platforms

#### Heroku
1. **Install Heroku CLI**
2. **Create Heroku app**:
   ```bash
   heroku create uae-visa-services
   ```
3. **Set environment variables**:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-secret
   # ... other variables
   ```
4. **Deploy**:
   ```bash
   git push heroku main
   ```

#### Vercel (Frontend) + Railway (Backend)
1. **Deploy frontend** to Vercel
2. **Deploy backend** to Railway
3. **Update API URLs** in frontend

## 🔧 Troubleshooting

### Common Issues

#### 1. Backend Server Won't Start

**Error**: `Error: listen EADDRINUSE :::3000`

**Solution**:
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID)
taskkill /PID <PID> /F

# Or use different port
set PORT=3001 && npm start
```

#### 2. CORS Errors

**Error**: `Access to fetch at 'http://localhost:3000/api/...' from origin 'http://localhost:5500' has been blocked by CORS policy`

**Solution**: Update `CORS_ORIGINS` in `.env` file:
```env
CORS_ORIGINS=http://localhost:5500,http://127.0.0.1:5500,http://localhost:8000
```

#### 3. Email Not Sending

**Symptoms**: Forms submit but no emails received

**Solutions**:
1. **Check SMTP credentials** in `.env`
2. **Enable "Less secure app access"** (Gmail)
3. **Use App Passwords** instead of regular password
4. **Check spam folder**
5. **Verify email logs** in server console

#### 4. File Upload Fails

**Error**: `File too large` or `Invalid file type`

**Solutions**:
1. **Check file size** (max 5MB)
2. **Verify file type** (JPEG, PNG, PDF, DOC, DOCX)
3. **Ensure uploads directory exists** and is writable

#### 5. Database Errors

**Error**: `SQLITE_CANTOPEN: unable to open database file`

**Solutions**:
1. **Check file permissions** on database directory
2. **Ensure SQLite3 is installed**:
   ```bash
   npm install sqlite3
   ```
3. **Verify DB_PATH** in `.env` file

### Debug Mode

Enable debug logging:
```env
NODE_ENV=development
DEBUG=*
```

### Log Files

Check server logs:
```bash
# PM2 logs
pm2 logs uae-visa-api

# Direct server logs
node server.js
```

## 🔄 Maintenance

### Regular Tasks

#### 1. Database Backup

```bash
# Create backup
cp visa_services.db visa_services_backup_$(date +%Y%m%d).db

# Automated backup script
#!/bin/bash
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)
cp visa_services.db "$BACKUP_DIR/visa_services_$DATE.db"

# Keep only last 30 days
find $BACKUP_DIR -name "visa_services_*.db" -mtime +30 -delete
```

#### 2. Log Rotation

```bash
# PM2 log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

#### 3. Security Updates

```bash
# Update dependencies
npm audit
npm audit fix

# Update Node.js
# Check current version
node --version

# Update using Node Version Manager
nvm install node
nvm use node
```

#### 4. Monitor Application

```bash
# Check PM2 status
pm2 status

# Monitor resources
pm2 monit

# Restart if needed
pm2 restart uae-visa-api
```

### Performance Optimization

#### 1. Enable Gzip Compression

Add to Nginx config:
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

#### 2. Add Caching Headers

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

#### 3. Database Optimization

```sql
-- Run periodically to optimize database
VACUUM;
ANALYZE;
```

### Monitoring

#### 1. Application Monitoring

```bash
# Install monitoring tools
npm install --save express-status-monitor
```

Add to server.js:
```javascript
app.use(require('express-status-monitor')());
```

Access at: `http://your-domain.com/status`

#### 2. Uptime Monitoring

Use services like:
- UptimeRobot
- Pingdom
- StatusCake

#### 3. Error Tracking

```bash
# Install Sentry for error tracking
npm install @sentry/node
```

## 📞 Support

### Getting Help

1. **Check logs** for error messages
2. **Review this guide** for common solutions
3. **Test in development** before deploying to production
4. **Keep backups** of your database and files

### Resources

- **Node.js Documentation**: [nodejs.org/docs](https://nodejs.org/docs/)
- **Express.js Guide**: [expressjs.com](https://expressjs.com/)
- **SQLite Documentation**: [sqlite.org/docs.html](https://sqlite.org/docs.html)
- **PM2 Documentation**: [pm2.keymetrics.io](https://pm2.keymetrics.io/)

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] All frontend files are in place
- [ ] Backend dependencies installed
- [ ] Environment variables configured
- [ ] Email configuration tested
- [ ] Database tables created
- [ ] File upload directory created
- [ ] All forms tested locally

### Production Deployment
- [ ] Server/hosting setup complete
- [ ] Domain configured (if applicable)
- [ ] SSL certificate installed (recommended)
- [ ] Environment variables set for production
- [ ] Database backed up
- [ ] Monitoring setup
- [ ] Error tracking configured

### Post-Deployment
- [ ] All pages load correctly
- [ ] Forms submit successfully
- [ ] Emails are being sent
- [ ] File uploads work
- [ ] API endpoints respond correctly
- [ ] Performance is acceptable
- [ ] Security headers configured

---

**Congratulations!** 🎉 Your UAE Visa Services website is now fully deployed and operational. The website includes all requested features: professional UAE-themed design, visa application forms, contact system, feedback system, news section, and a complete backend with database integration.

For ongoing support and maintenance, refer to the troubleshooting and maintenance sections above.
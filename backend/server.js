const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW || 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 100, // limit each IP to requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:5500'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
const bodyLimit = process.env.BODY_LIMIT || '10mb';
app.use(bodyParser.json({ limit: bodyLimit }));
app.use(bodyParser.urlencoded({ extended: true, limit: bodyLimit }));

// Create uploads directory if it doesn't exist
const uploadsDir = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`Created uploads directory: ${uploadsDir}`);
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: process.env.UPLOAD_MAX_SIZE || 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow only specific file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and documents are allowed'));
    }
  }
});

// Initialize SQLite database
const dbPath = process.env.DATABASE_PATH || './visa_services.db';
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  } else {
    console.log(`Connected to SQLite database at: ${dbPath}`);
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  // Visa applications table
  db.run(`CREATE TABLE IF NOT EXISTS visa_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    nationality TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT NOT NULL,
    passport_number TEXT NOT NULL,
    passport_expiry DATE NOT NULL,
    visa_type TEXT NOT NULL,
    purpose_of_visit TEXT NOT NULL,
    duration_of_stay TEXT NOT NULL,
    company_name TEXT,
    job_title TEXT,
    company_address TEXT,
    monthly_salary TEXT,
    is_retired_officer BOOLEAN DEFAULT 0,
    service_branch TEXT,
    rank TEXT,
    years_of_service INTEGER,
    retirement_year INTEGER,
    cv_file TEXT,
    aadhar_file TEXT,
    passport_copy_file TEXT,
    photo_file TEXT,
    additional_documents TEXT,
    terms_accepted BOOLEAN DEFAULT 0,
    privacy_accepted BOOLEAN DEFAULT 0,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Contact messages table
  db.run(`CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    inquiry_type TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    preferred_contact TEXT,
    urgency_level TEXT,
    newsletter_subscription BOOLEAN DEFAULT 0,
    status TEXT DEFAULT 'new',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Feedback table
  db.run(`CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    visa_type TEXT NOT NULL,
    service_rating INTEGER NOT NULL,
    would_recommend BOOLEAN DEFAULT 0,
    feedback_title TEXT NOT NULL,
    feedback_message TEXT NOT NULL,
    aspects_impressed TEXT,
    allow_public_display BOOLEAN DEFAULT 0,
    allow_contact BOOLEAN DEFAULT 0,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Newsletter subscriptions table
  db.run(`CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    weekly_digest BOOLEAN DEFAULT 1,
    breaking_news BOOLEAN DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  console.log('Database tables initialized.');
}

// Email configuration (using nodemailer)
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-app-password'
  }
});

// Validation middleware
const validateVisaApplication = [
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('nationality').notEmpty().withMessage('Nationality is required'),
  body('dateOfBirth').isDate().withMessage('Valid date of birth is required'),
  body('passportNumber').notEmpty().withMessage('Passport number is required'),
  body('passportExpiry').isDate().withMessage('Valid passport expiry date is required'),
  body('visaType').notEmpty().withMessage('Visa type is required'),
  body('purposeOfVisit').notEmpty().withMessage('Purpose of visit is required')
];

const validateContactMessage = [
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('inquiryType').notEmpty().withMessage('Inquiry type is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('message').notEmpty().withMessage('Message is required')
];

const validateFeedback = [
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('visaType').notEmpty().withMessage('Visa type is required'),
  body('serviceRating').isInt({ min: 1, max: 5 }).withMessage('Service rating must be between 1 and 5'),
  body('feedbackTitle').notEmpty().withMessage('Feedback title is required'),
  body('feedbackMessage').notEmpty().withMessage('Feedback message is required')
];

// API Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'UAE Visa Services API is running' });
});

// Visa application submission
app.post('/api/visa-application', upload.fields([
  { name: 'cv', maxCount: 1 },
  { name: 'aadhar', maxCount: 1 },
  { name: 'passportCopy', maxCount: 1 },
  { name: 'photo', maxCount: 1 },
  { name: 'additionalDocuments', maxCount: 5 }
]), validateVisaApplication, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    fullName, email, phone, nationality, dateOfBirth, gender,
    passportNumber, passportExpiry, visaType, purposeOfVisit,
    durationOfStay, companyName, jobTitle, companyAddress,
    monthlySalary, isRetiredOfficer, serviceBranch, rank,
    yearsOfService, retirementYear, termsAccepted, privacyAccepted
  } = req.body;

  // Handle file uploads
  const files = req.files || {};
  const cvFile = files.cv ? files.cv[0].filename : null;
  const aadharFile = files.aadhar ? files.aadhar[0].filename : null;
  const passportCopyFile = files.passportCopy ? files.passportCopy[0].filename : null;
  const photoFile = files.photo ? files.photo[0].filename : null;
  const additionalDocs = files.additionalDocuments ? files.additionalDocuments.map(f => f.filename).join(',') : null;

  const sql = `INSERT INTO visa_applications (
    full_name, email, phone, nationality, date_of_birth, gender,
    passport_number, passport_expiry, visa_type, purpose_of_visit,
    duration_of_stay, company_name, job_title, company_address,
    monthly_salary, is_retired_officer, service_branch, rank,
    years_of_service, retirement_year, cv_file, aadhar_file,
    passport_copy_file, photo_file, additional_documents,
    terms_accepted, privacy_accepted
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.run(sql, [
    fullName, email, phone, nationality, dateOfBirth, gender,
    passportNumber, passportExpiry, visaType, purposeOfVisit,
    durationOfStay, companyName, jobTitle, companyAddress,
    monthlySalary, isRetiredOfficer === 'true' ? 1 : 0, serviceBranch, rank,
    yearsOfService, retirementYear, cvFile, aadharFile,
    passportCopyFile, photoFile, additionalDocs,
    termsAccepted === 'true' ? 1 : 0, privacyAccepted === 'true' ? 1 : 0
  ], function(err) {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: 'Failed to submit visa application' });
    }

    // Send confirmation email
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Visa Application Received - UAE Visa Services',
      html: `
        <h2>Visa Application Confirmation</h2>
        <p>Dear ${fullName},</p>
        <p>Thank you for submitting your visa application. We have received your application with ID: <strong>${this.lastID}</strong></p>
        <p>Our team will review your application and contact you within 2-3 business days.</p>
        <p>Best regards,<br>UAE Visa Services Team</p>
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Email error:', error);
      }
    });

    res.json({
      success: true,
      message: 'Visa application submitted successfully',
      applicationId: this.lastID
    });
  });
});

// Contact message submission
app.post('/api/contact', validateContactMessage, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    fullName, email, phone, inquiryType, subject, message,
    preferredContact, urgencyLevel, newsletterSubscription
  } = req.body;

  const sql = `INSERT INTO contact_messages (
    full_name, email, phone, inquiry_type, subject, message,
    preferred_contact, urgency_level, newsletter_subscription
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.run(sql, [
    fullName, email, phone, inquiryType, subject, message,
    preferredContact, urgencyLevel, newsletterSubscription === 'true' ? 1 : 0
  ], function(err) {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: 'Failed to submit contact message' });
    }

    // Send confirmation email
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Contact Message Received - UAE Visa Services',
      html: `
        <h2>Contact Message Confirmation</h2>
        <p>Dear ${fullName},</p>
        <p>Thank you for contacting us. We have received your message regarding: <strong>${subject}</strong></p>
        <p>Our team will respond to your inquiry within 24 hours.</p>
        <p>Best regards,<br>UAE Visa Services Team</p>
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Email error:', error);
      }
    });

    res.json({
      success: true,
      message: 'Contact message submitted successfully',
      messageId: this.lastID
    });
  });
});

// Feedback submission
app.post('/api/feedback', validateFeedback, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    fullName, email, phone, visaType, serviceRating, wouldRecommend,
    feedbackTitle, feedbackMessage, aspectsImpressed,
    allowPublicDisplay, allowContact
  } = req.body;

  const sql = `INSERT INTO feedback (
    full_name, email, phone, visa_type, service_rating, would_recommend,
    feedback_title, feedback_message, aspects_impressed,
    allow_public_display, allow_contact
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.run(sql, [
    fullName, email, phone, visaType, serviceRating, wouldRecommend === 'true' ? 1 : 0,
    feedbackTitle, feedbackMessage, aspectsImpressed,
    allowPublicDisplay === 'true' ? 1 : 0, allowContact === 'true' ? 1 : 0
  ], function(err) {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: 'Failed to submit feedback' });
    }

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      feedbackId: this.lastID
    });
  });
});

// Newsletter subscription
app.post('/api/newsletter', (req, res) => {
  const { email, weeklyDigest, breakingNews } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const sql = `INSERT OR REPLACE INTO newsletter_subscriptions (
    email, weekly_digest, breaking_news
  ) VALUES (?, ?, ?)`;

  db.run(sql, [
    email,
    weeklyDigest === 'true' ? 1 : 0,
    breakingNews === 'true' ? 1 : 0
  ], function(err) {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: 'Failed to subscribe to newsletter' });
    }

    res.json({
      success: true,
      message: 'Successfully subscribed to newsletter'
    });
  });
});

// Get application status
app.get('/api/application-status/:id', (req, res) => {
  const applicationId = req.params.id;

  const sql = 'SELECT id, full_name, email, visa_type, status, created_at FROM visa_applications WHERE id = ?';

  db.get(sql, [applicationId], (err, row) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: 'Failed to fetch application status' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({
      success: true,
      application: row
    });
  });
});

// Get public feedback (for display on website)
app.get('/api/public-feedback', (req, res) => {
  const sql = `SELECT full_name, visa_type, service_rating, feedback_title, 
               feedback_message, created_at FROM feedback 
               WHERE allow_public_display = 1 AND status = 'approved' 
               ORDER BY created_at DESC LIMIT 20`;

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: 'Failed to fetch feedback' });
    }

    res.json({
      success: true,
      feedback: rows
    });
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
  }
  
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`UAE Visa Services API server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  
  if (process.env.NODE_ENV === 'production') {
    console.log('Server is running in production mode');
    console.log('CORS origins:', allowedOrigins);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});
const fs = require('fs');
const nodemailer = require('nodemailer');

// Read previous issue count
let previous = 0;
if (fs.existsSync('./previous/current_issue_count.txt')) {
  previous = parseInt(fs.readFileSync('./previous/current_issue_count.txt', 'utf8'));
}

// Read current issue count
const current = parseInt(fs.readFileSync('current_issue_count.txt', 'utf8'));

console.log(`Previous: ${previous}, Current: ${current}`);

if (current > previous) {
  console.log('⬆️ Issue count increased, sending email...');

  // Setup transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: "anuragyadav2787@gmail.com", // you can add more recipients separated by comma
    subject: `⬆️ GitHub Issue Count Increased`,
    text: `Issue count increased from ${previous} to ${current}`
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) console.error('Error sending email:', err);
    else console.log('Email sent:', info.response);
  });
} else {
  console.log('✅ Issue count unchanged or decreased, no email sent.');
}

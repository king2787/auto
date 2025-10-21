const fs = require('fs');
const axios = require('axios');
const nodemailer = require('nodemailer');

const owner = 'king2787';
const repo = 'auto';
const issueFile = 'prev_count.txt';

async function getIssueCount() {
  const res = await axios.get(
    `https://api.github.com/search/issues?q=repo:${owner}/${repo}+type:issue+state:open`
  );
  return res.data.total_count;
}

function getPreviousCount() {
  return fs.existsSync(issueFile)
    ? parseInt(fs.readFileSync(issueFile, 'utf8'))
    : 0;
}

function saveCount(count) {
  fs.writeFileSync(issueFile, count.toString());
}

function sendEmail(oldCount, newCount) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"SubhChintak" <${process.env.EMAIL_USER}>`,
    to: 'anuragyadav2787@gmail.com',
    subject: `📈 Issues increased in ${owner}/${repo}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f4f6f8; border-radius: 8px;">
        <h2 style="color: #333;">🚨 GitHub Issues Alert</h2>
        <p style="font-size: 16px; color: #555;">
          The number of <strong>open issues</strong> in 
          <strong>${owner}/${repo}</strong> has increased.
        </p>
        <div style="margin: 20px 0; padding: 15px; background-color: #fff; border-left: 5px solid #e53e3e;">
          <p>📌 Issue count changed from <strong>${oldCount}</strong> → <strong>${newCount}</strong></p>
        </div>
        <p style="font-size: 14px; color: #888;">Timestamp: ${new Date().toLocaleString()}</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

async function monitor() {
  const prev = getPreviousCount();
  const current = await getIssueCount();

  console.log(`Issue count: ${prev} → ${current}`);

  if (current > prev) {
    await sendEmail(prev, current);
    console.log('✅ Email sent!');
  } else {
    console.log('No increase in issue count.');
  }

  saveCount(current);
}

monitor().catch(console.error);

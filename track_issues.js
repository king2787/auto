const fs = require('fs');
const axios = require('axios');
const nodemailer = require('nodemailer');
const { execSync } = require('child_process');

const owner = 'OWASP';
const repo = 'Nest';
const issueFile = 'prev_count.txt';

async function getIssueCount() {
  const res = await axios.get(`https://api.github.com/search/issues?q=repo:${owner}/${repo}+type:issue+state:open`);
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
      <div style="font-family: Arial, sans-serif;">
        <h2>🚨 GitHub Issues Alert</h2>
        <p>📌 Issue count changed from <strong>${oldCount}</strong> → <strong>${newCount}</strong></p>
        <p>🕒 ${new Date().toLocaleString()}</p>
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

  // Save updated count and commit to repo
  saveCount(current);
  try {
    execSync('git config --global user.email "bot@example.com"');
    execSync('git config --global user.name "GitHub Action Bot"');
    execSync('git add prev_count.txt');
    execSync(`git commit -m "Update issue count to ${current}" || true`);
    execSync('git push');
  } catch (e) {
    console.log('⚠️ Failed to push update:', e.message);
  }
}

monitor().catch(console.error);

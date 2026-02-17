const { google } = require('googleapis');
const crypto = require('crypto');
const Base64 = require('js-base64').Base64;

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });


function makeEmail(to, from, subject, html) {
    const messageParts = [
        `From: ${from}`,
        `To: ${to}`,
        `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
        'Content-Type: text/html; charset=UTF-8',
        '',
        html,
    ];
    const message = messageParts.join('\n');

    return Base64.encodeURI(message);
}




async function sendOtpEmail(to) {
    const otp = crypto.randomInt(100000, 999999).toString();
    const htmlContent = `<div style="background-color: #0f172a; padding: 40px 20px; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff; text-align: center;">
                         <div style="max-width: 450px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; padding: 30px; border: 1px solid #334155; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);">
    
                        <div style="margin-bottom: 25px;">
                        <span style="font-size: 24px; font-weight: bold; letter-spacing: 1px; color: #38bdf8;">🎬 MOVIES<span style="color: #ffffff;">CONVEY</span></span>
                        </div>

                        <h2 style="margin-bottom: 10px; font-size: 20px;">Verify Your Account</h2>
                        <p style="color: #94a3b8; font-size: 15px; margin-bottom: 30px;">
                        Welcome! Use the code below to finish setting up your Account and start tracking your favorite titles.
                        </p>

                        <div style="background-color: #0f172a; border: 2px dashed #38bdf8; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #ffffff;">${otp}</span>
                        </div>

                        <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
                        This code is valid for 5 minutes. <br>
                        If you didn't request this, you can safely ignore this email.
                        </p>

                        <hr style="border: 0; border-top: 1px solid #334155; margin: 30px 0;">
                        
                        <p style="color: #94a3b8; font-size: 12px;">
                        &#169; 2026 Movies Convey
                        </p>
                    </div>
                    </div>`;

  


    const raw = makeEmail(to, `"Movies Convey" <${process.env.EMAIL_USER || 'moviesconvey@gmail.com'}>`, 'Welcome to Movies Convey! 🎞️', htmlContent);

    try {
        const res = await gmail.users.messages.send({
            userId: 'me',
            requestBody: { raw },
        });
        console.log('Message sent, ID:', res.data.id);
        return otp;

    } catch (err) {
        console.error('Error sending email via Gmail API:', err);
        throw err;
    }
}


module.exports = { sendOtpEmail };
const { google } = require('googleapis');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

async function createTransporter() {
    const accessTokenResponse = await oauth2Client.getAccessToken();
    const accessToken = accessTokenResponse?.token || accessTokenResponse;

    if (!accessToken) {
        throw new Error('Failed to obtain access token. The refresh token may be invalid or revoked.');
    }

    try {
        const tokenInfo = await oauth2Client.getTokenInfo(accessToken);
        if (process.env.EMAIL_USER && tokenInfo.email && tokenInfo.email !== process.env.EMAIL_USER) {
            console.warn(`WARNING: token email (${tokenInfo.email}) does not match EMAIL_USER (${process.env.EMAIL_USER}).`);
        }
    } catch (diagErr) {
        console.warn('Could not retrieve token info:', diagErr.message);
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        port: 587,
        secure: false,
        auth: {
            type: 'OAuth2',
            user: process.env.EMAIL_USER || 'moviesconvey@gmail.com',
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
            accessToken,
        },
    });

    return transporter;
}

async function sendOtpEmail(to) {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REFRESH_TOKEN) {
        throw new Error('Missing Google OAuth env vars (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REFRESH_TOKEN)');
    }

    const newOtp = crypto.randomInt(100000, 999999).toString();


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
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #ffffff;">${newOtp}</span>
            </div>

            <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
            This code is valid for 10 minutes. <br>
            If you didn't request this, you can safely ignore this email.
            </p>

            <hr style="border: 0; border-top: 1px solid #334155; margin: 30px 0;">
            
            <p style="color: #94a3b8; font-size: 12px;">
            &#169; 2026 Movies Convey
            </p>
        </div>
        </div>`;

    try {
        const transporter = await createTransporter();
        const info = await transporter.sendMail({
            from: `"Movies Convey" <${process.env.EMAIL_USER || 'moviesconvey@gmail.com'}>`,
            to,
            subject: 'Welcome to Movies Convey! 🎞️',
            html: htmlContent,
        });

        console.log('Message sent:', info.messageId);
        return newOtp;
    } catch (e) {
        console.error('Error sending email:', e);
        return res.redirect('/register')
    }
}

module.exports = { sendOtpEmail };

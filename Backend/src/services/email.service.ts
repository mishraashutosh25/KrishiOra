import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendPasswordResetOtpEmail = async (
    email: string,
    otp: string
) => {
    await transporter.sendMail({
        from: `"KishriOra" <${process.env.SMTP_FROM}>`,
        to: email,
        subject: "KishriOra - Password Reset OTP",

        text: `
Your KishriOra password reset OTP is ${otp}.

This OTP is valid for 10 minutes.

If you did not request a password reset, please ignore this email.
        `,

        html: `
            <div style="
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            ">
                <h2>Password Reset Request</h2>

                <p>Hello,</p>

                <p>
                    We received a request to reset your KishriOra password.
                </p>

                <p>Your password reset OTP is:</p>

                <div style="
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 8px;
                    padding: 15px;
                    background: #f4f4f4;
                    text-align: center;
                    margin: 20px 0;
                ">
                    ${otp}
                </div>

                <p>
                    This OTP is valid for
                    <strong>10 minutes</strong>.
                </p>

                <p>
                    If you did not request a password reset,
                    you can safely ignore this email.
                </p>

                <p>
                    Regards,<br>
                    <strong>KishriOra Team</strong>
                </p>
            </div>
        `,
    });
};
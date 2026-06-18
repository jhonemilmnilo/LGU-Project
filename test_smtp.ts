import nodemailer from "nodemailer";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

if (!emailUser || !emailPass) {
    console.error("Missing EMAIL_USER or EMAIL_PASS");
    process.exit(1);
}

const sanitizedPass = emailPass.replace(/\s+/g, "");

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
        user: emailUser,
        pass: sanitizedPass,
    },
});

transporter.verify(function (error) {
    if (error) {
        console.error("Transporter verify failed:", error);
    } else {
        console.log("Server is ready to take our messages");
    }
});

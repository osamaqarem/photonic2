import nodemailer from "nodemailer"

import { config } from "~/next/config"

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: config.MAIL_USER,
    // For gmail, the account must have 2FA and an app password must be used.
    pass: config.MAIL_PASS,
  },
  tls: {
    //DevSkim: ignore DS169125,DS169126,DS440000
    ciphers: "TLSv1.2",
  },
})

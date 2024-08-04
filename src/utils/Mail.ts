import sgMail from '@sendgrid/mail'
import { readFile } from 'node:fs/promises'
sgMail.setApiKey(`${process.env.SG_API_KEY}`)

export default class Mail {
  private from = `${process.env.SG_SENDER}`
  private html: string = ''
  constructor(public to: string, public subject: string) {}

  async sendResetPassword(resetPasswordSession: string) {
    let template = await readFile(
      `${__dirname}/../../views/templates/resetPassword.html`,
      'utf-8'
    )
    const resetPasswordUrl = `${process.env.ORIGIN}/profile/reset-password/${resetPasswordSession}`
    template = template.replace('{url}', resetPasswordUrl)
    this.html = template
    this.sendMail()
  }

  private async sendMail() {
    await sgMail.send({
      from: this.from,
      to: this.to,
      subject: this.subject,
      html: this.html,
    })
  }
}

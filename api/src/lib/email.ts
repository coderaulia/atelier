export interface EmailPayload {
  to: string
  subject: string
  html: string
}

export async function sendEmail(payload: EmailPayload, brevoApiKey: string): Promise<void> {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'api-key': brevoApiKey,
    },
    body: JSON.stringify({
      sender: { name: 'Vanaila Studio', email: 'studio@vanaila.com' },
      to: [{ email: payload.to }],
      subject: payload.subject,
      htmlContent: payload.html,
    }),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Brevo API error: ${error}`)
  }
}

export function emailTemplates(lang: 'id' | 'en' = 'en') {
  const t = {
    en: {
      verifySubject: 'Verify your email - Vanaila Studio',
      verifyBody: (token: string, baseUrl: string) => `
        <h2>Welcome to Vanaila Studio!</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <p><a href="${baseUrl}/auth/verify-email?token=${token}">Verify Email</a></p>
        <p>This link expires in 24 hours.</p>
        <p>If you didn't create this account, please ignore this email.</p>
      `,
      resetSubject: 'Reset your password - Vanaila Studio',
      resetBody: (token: string, baseUrl: string) => `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <p><a href="${baseUrl}/reset-password?token=${token}">Reset Password</a></p>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
      subscriptionConfirmedSubject: 'Pro subscription confirmed - Vanaila Studio',
      subscriptionConfirmedBody: (amount: number, currency: string, nextRenewal: string) => `
        <h2>Pro Subscription Confirmed</h2>
        <p>Your Pro subscription is now active!</p>
        <p><strong>Amount:</strong> ${amount.toLocaleString()} ${currency}</p>
        <p><strong>Next renewal:</strong> ${nextRenewal}</p>
        <p>Thank you for supporting Vanaila Studio.</p>
      `,
      paymentFailedSubject: 'Payment failed - Vanaila Studio',
      paymentFailedBody: (retryUrl: string) => `
        <h2>Payment Failed</h2>
        <p>We couldn't process your payment. Your Pro access will expire in 3 days if not resolved.</p>
        <p><a href="${retryUrl}">Retry Payment</a></p>
      `,
      subscriptionCancelledSubject: 'Subscription cancelled - Vanaila Studio',
      subscriptionCancelledBody: (expiryDate: string) => `
        <h2>Subscription Cancelled</h2>
        <p>Your Pro subscription has been cancelled. You'll keep Pro access until <strong>${expiryDate}</strong>.</p>
        <p>We'd love to have you back anytime.</p>
      `,
      accountDeletionSubject: 'Account deletion scheduled - Vanaila Studio',
      accountDeletionBody: () => `
        <h2>Account Deletion Scheduled</h2>
        <p>Your account has been soft-deleted and will be permanently removed in 30 days.</p>
        <p>If this was a mistake, contact support immediately.</p>
      `,
    },
    id: {
      verifySubject: 'Verifikasi email Anda - Vanaila Studio',
      verifyBody: (token: string, baseUrl: string) => `
        <h2>Selamat datang di Vanaila Studio!</h2>
        <p>Silakan verifikasi alamat email Anda dengan mengklik tautan di bawah ini:</p>
        <p><a href="${baseUrl}/auth/verify-email?token=${token}">Verifikasi Email</a></p>
        <p>Tautan ini berlaku selama 24 jam.</p>
        <p>Jika Anda tidak membuat akun ini, abaikan email ini.</p>
      `,
      resetSubject: 'Reset password Anda - Vanaila Studio',
      resetBody: (token: string, baseUrl: string) => `
        <h2>Permintaan Reset Password</h2>
        <p>Klik tautan di bawah untuk mereset password Anda:</p>
        <p><a href="${baseUrl}/reset-password?token=${token}">Reset Password</a></p>
        <p>Tautan ini berlaku selama 1 jam.</p>
        <p>Jika Anda tidak meminta ini, abaikan email ini.</p>
      `,
      subscriptionConfirmedSubject: 'Langganan Pro dikonfirmasi - Vanaila Studio',
      subscriptionConfirmedBody: (amount: number, currency: string, nextRenewal: string) => `
        <h2>Langganan Pro Dikonfirmasi</h2>
        <p>Langganan Pro Anda sekarang aktif!</p>
        <p><strong>Jumlah:</strong> ${amount.toLocaleString()} ${currency}</p>
        <p><strong>Perpanjangan berikutnya:</strong> ${nextRenewal}</p>
        <p>Terima kasih telah mendukung Vanaila Studio.</p>
      `,
      paymentFailedSubject: 'Pembayaran gagal - Vanaila Studio',
      paymentFailedBody: (retryUrl: string) => `
        <h2>Pembayaran Gagal</h2>
        <p>Kami tidak dapat memproses pembayaran Anda. Akses Pro Anda akan berakhir dalam 3 hari jika tidak diselesaikan.</p>
        <p><a href="${retryUrl}">Coba Lagi</a></p>
      `,
      subscriptionCancelledSubject: 'Langganan dibatalkan - Vanaila Studio',
      subscriptionCancelledBody: (expiryDate: string) => `
        <h2>Langganan Dibatalkan</h2>
        <p>Langganan Pro Anda telah dibatalkan. Anda akan tetap memiliki akses Pro hingga <strong>${expiryDate}</strong>.</p>
        <p>Kami senang menyambut Anda kembali kapan saja.</p>
      `,
      accountDeletionSubject: 'Penghapusan akun dijadwalkan - Vanaila Studio',
      accountDeletionBody: () => `
        <h2>Penghapusan Akun Dijadwalkan</h2>
        <p>Akun Anda telah dihapus sementara dan akan dihapus permanen dalam 30 hari.</p>
        <p>Jika ini kesalahan, hubungi dukungan segera.</p>
      `,
    },
  }

  return t[lang]
}

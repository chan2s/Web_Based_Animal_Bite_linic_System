from django.core.management.base import BaseCommand, CommandError
from django.core.mail import send_mail
from django.conf import settings


class Command(BaseCommand):
    help = 'Send a test email to verify SMTP configuration'

    def add_arguments(self, parser):
        parser.add_argument(
            'recipient',
            type=str,
            help='The email address to send the test email to',
        )

    def handle(self, *args, **options):
        recipient = options['recipient']

        subject = 'Test Email — Animal Bite Clinic System'
        message = f"""
Hi there,

This is a test email from the Animal Bite Clinic System.

If you received this, your SMTP configuration is working correctly!

Configuration used:
  BACKEND:    {settings.EMAIL_BACKEND}
  HOST:       {settings.EMAIL_HOST}
  PORT:       {settings.EMAIL_PORT}
  USE_TLS:    {settings.EMAIL_USE_TLS}
  FROM:       {settings.DEFAULT_FROM_EMAIL}
  TO:         {recipient}

Thank you,
Animal Bite Clinic Team
"""
        html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }}
        .container {{ max-width: 600px; margin: auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }}
        .header {{ background: linear-gradient(135deg, #059669, #10b981); padding: 30px; text-align: center; }}
        .header h1 {{ color: #fff; margin: 0; font-size: 24px; }}
        .body {{ padding: 30px; }}
        .success {{ background: #ecfdf5; border: 2px solid #10b981; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }}
        .success .check {{ font-size: 48px; }}
        .details {{ background: #f8fafc; border-radius: 8px; padding: 16px; font-family: monospace; font-size: 13px; }}
        .footer {{ padding: 20px; background: #f8fafc; text-align: center; color: #94a3b8; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🐾 Animal Bite Clinic</h1>
        </div>
        <div class="body">
            <h2>SMTP Test Email</h2>
            <div class="success">
                <div class="check">✅</div>
                <p style="font-size: 18px; font-weight: 600; color: #059669;">SMTP is working!</p>
            </div>
            <p>If you received this email, your SMTP configuration is correct.</p>
            <h3>Configuration</h3>
            <div class="details">
                BACKEND: {settings.EMAIL_BACKEND}<br>
                HOST: {settings.EMAIL_HOST}<br>
                PORT: {settings.EMAIL_PORT}<br>
                USE_TLS: {settings.EMAIL_USE_TLS}<br>
                FROM: {settings.DEFAULT_FROM_EMAIL}
            </div>
        </div>
        <div class="footer">
            Animal Bite Clinic System &bull; Stay protected against rabies
        </div>
    </div>
</body>
</html>
"""

        self.stdout.write(self.style.NOTICE(f'Sending test email to {recipient}...'))
        self.stdout.write(self.style.NOTICE(f'  Backend: {settings.EMAIL_BACKEND}'))
        self.stdout.write(self.style.NOTICE(f'  Host: {settings.EMAIL_HOST}'))
        self.stdout.write(self.style.NOTICE(f'  Port: {settings.EMAIL_PORT}'))
        self.stdout.write(self.style.NOTICE(f'  TLS: {settings.EMAIL_USE_TLS}'))
        self.stdout.write(self.style.NOTICE(f'  From: {settings.DEFAULT_FROM_EMAIL}'))

        try:
            sent = send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient],
                html_message=html_message,
                fail_silently=False,
            )
            if sent:
                self.stdout.write(self.style.SUCCESS(
                    f'✓ Test email successfully sent to {recipient}!'
                ))
                self.stdout.write(self.style.SUCCESS(
                    'Check your inbox (and spam folder) to confirm delivery.'
                ))
            else:
                self.stdout.write(self.style.WARNING(
                    'Email was not sent (send_mail returned 0).'
                ))
        except Exception as e:
            raise CommandError(
                f'Failed to send email.\n\n'
                f'Error type: {type(e).__name__}\n'
                f'Error details: {str(e)}\n\n'
                f'Troubleshooting suggestions:\n'
                f'  1. Verify EMAIL_HOST_USER and EMAIL_HOST_PASSWORD in .env\n'
                f'  2. For Gmail, ensure you are using an App Password (not your regular password)\n'
                f'  3. Check that 2-Step Verification is enabled for your Google account\n'
                f'  4. Verify the App Password has not been revoked\n'
                f'  5. Check if Gmail has blocked the sign-in attempt\n'
            )

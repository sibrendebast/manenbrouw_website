import { Resend } from 'resend';

// Using the key from .env.local
const resend = new Resend('re_SXY64pix_F19G8EzfoPaHHmngXhow5Dq1');
const FROM_EMAIL = 'Man & Brouw <info@manenbrouw.be>';

async function testEmail() {
    console.log(`Testing email sending from ${FROM_EMAIL}...`);
    
    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: ["debastsibren@gmail.com"],
            subject: "Domain Verification Check",
            html: "<h1>Checking domain status</h1><p>If you see this, the domain is verified.</p>"
        });

        if (error) {
            console.error("Error sending test email:", error);
        } else {
            console.log("Test email sent successfully! Domain is likely verified.", data);
        }
    } catch (err) {
        console.error("Failed to execute test:", err);
    }
}

testEmail();

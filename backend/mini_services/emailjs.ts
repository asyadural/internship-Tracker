import fetch from 'node-fetch';

export interface EmailJSConfig {
  service_id: string;
  template_id: string;
  public_key: string;
  private_key: string;
}

export async function sendEmail(
  email: string,
  code: number,
  token: string,
  config: EmailJSConfig
  ): Promise<boolean> {
  const { service_id, template_id, public_key, private_key } = config;

  if (![service_id, template_id, public_key, private_key].every(Boolean)) {
    console.error("❌ Missing EmailJS configuration");
    return false;
  }

  try {
    const res = await fetch(
      "https://api.emailjs.com/api/v1.0/email/send",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id,
          template_id,
          user_id:      public_key,
          accessToken:  private_key,
          template_params: {
            email,
            code,
            link: `http://localhost:8000/auth/verify?token=${token}`
          }
        })
      }
    );

    if (!res.ok) {
      const body = await res.text();
      console.error("❌ EmailJS error:", res.status, body);
      return false;
    }

    console.log("✅ Email sent");
    return true;
  } catch (err: any) {
    console.error("❌ Failed to send email:", err.message);
    return false;
  }
}
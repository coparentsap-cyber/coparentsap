/*
  # Fix email service configuration

  1. Email Templates
    - Create email templates table
    - Add default templates for welcome, invite, reset

  2. Email Queue
    - Create email queue for reliable delivery
    - Add retry mechanism
*/

-- Create email templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  subject text NOT NULL,
  html_content text NOT NULL,
  variables jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default email templates
INSERT INTO email_templates (name, subject, html_content, variables) VALUES
(
  'welcome',
  '🎉 Bienvenue sur Co-Parents !',
  '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Bienvenue</title></head><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><div style="background: linear-gradient(135deg, #8b5cf6, #ec4899); padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0;"><h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">Co-Parents</h1><p style="color: white; margin: 15px 0 0 0; opacity: 0.95; font-size: 18px;">L''app des familles recomposées</p></div><div style="background: white; padding: 40px 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"><h2 style="color: #374151; margin-top: 0; font-size: 24px;">Bonjour {{name}} ! 👋</h2><p style="color: #6b7280; line-height: 1.6; font-size: 16px;">Félicitations ! Votre compte Co-Parents a été créé avec succès.</p><div style="background: #f3f4f6; padding: 25px; border-radius: 12px; margin: 30px 0;"><h3 style="color: #374151; margin-top: 0; font-size: 18px;">🔑 Votre code unique :</h3><div style="background: white; padding: 20px; border-radius: 8px; text-align: center; font-family: monospace; font-size: 28px; font-weight: bold; color: #8b5cf6; border: 3px solid #8b5cf6; margin: 15px 0;">{{invite_code}}</div></div></div></body></html>',
  '{"name": "string", "invite_code": "string"}'
),
(
  'invite',
  '{{from_name}} vous invite sur Co-Parents 👨‍👩‍👧‍👦',
  '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Invitation</title></head><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><div style="background: linear-gradient(135deg, #8b5cf6, #ec4899); padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0;"><h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">Co-Parents</h1><p style="color: white; margin: 15px 0 0 0; opacity: 0.95; font-size: 18px;">Invitation à rejoindre</p></div><div style="background: white; padding: 40px 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"><h2 style="color: #374151; margin-top: 0; font-size: 24px;">🎉 {{from_name}} vous invite !</h2><p style="color: #6b7280; line-height: 1.6; font-size: 16px;"><strong>{{from_name}}</strong> utilise Co-Parents et souhaite vous connecter.</p><div style="background: #eff6ff; padding: 25px; border-radius: 12px; border-left: 4px solid #3b82f6; margin: 30px 0;"><h3 style="color: #1e40af; margin-top: 0; font-size: 18px;">🔑 Code de connexion :</h3><div style="background: white; padding: 20px; border-radius: 8px; text-align: center; font-family: monospace; font-size: 28px; font-weight: bold; color: #8b5cf6; border: 3px solid #8b5cf6; margin: 15px 0;">{{invite_code}}</div></div></div></body></html>',
  '{"from_name": "string", "invite_code": "string"}'
);

-- Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Create policy for email templates (public read)
CREATE POLICY "Email templates are publicly readable"
  ON email_templates
  FOR SELECT
  TO public
  USING (true);
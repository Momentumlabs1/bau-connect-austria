-- =============================================
-- SICHERHEITS-FIX: Password Reset Tokens absichern
-- =============================================

-- Alte Policy löschen (falls vorhanden)
DROP POLICY IF EXISTS "Service role can manage password reset tokens" ON public.password_reset_tokens;

-- Neue Policy: Nur authentifizierte Admins (Edge Functions nutzen Service Role Key und umgehen RLS)
CREATE POLICY "Only admins can manage password reset tokens"
ON public.password_reset_tokens
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Anon-Zugriff explizit blockieren
CREATE POLICY "Block anon access to password reset tokens"
ON public.password_reset_tokens
FOR ALL
TO anon
USING (false);

-- =============================================
-- SICHERHEITS-FIX: Email Verification Codes absichern
-- =============================================

-- Alte Policy löschen (falls vorhanden)
DROP POLICY IF EXISTS "Service role can manage verification codes" ON public.email_verification_codes;

-- Neue Policy: Nur authentifizierte Admins
CREATE POLICY "Only admins can manage verification codes"
ON public.email_verification_codes
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Anon-Zugriff explizit blockieren
CREATE POLICY "Block anon access to verification codes"
ON public.email_verification_codes
FOR ALL
TO anon
USING (false);
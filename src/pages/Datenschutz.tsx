import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";

const Datenschutz = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Datenschutzerklärung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-2">1. Datenschutz auf einen Blick</h2>
              <h3 className="font-semibold mt-4 mb-2">Allgemeine Hinweise</h3>
              <p className="mb-4">Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können. Ausführliche Informationen zum Thema Datenschutz entnehmen Sie unserer unter diesem Text aufgeführten Datenschutzerklärung.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">2. Verantwortlicher</h2>
              <p className="mb-2">Verantwortlicher im Sinne der DSGVO:</p>
              <p className="font-medium">BauConnect24 e.U</p>
              <p>Efraim Dinc</p>
              <p>Schwemmgasse 3</p>
              <p>4332 Au an der Donau</p>
              <p>Österreich</p>
              <p className="mt-2">Telefon: +43 676 7360103</p>
              <p>E-Mail: <a href="mailto:kontakt@bauconnect24.at" className="text-primary hover:underline">kontakt@bauconnect24.at</a></p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">3. Datenerfassung auf dieser Website</h2>
              
              <h3 className="font-semibold mt-4 mb-2">3.1 Daten bei Registrierung als Kunde</h3>
              <p className="mb-2">Wenn Sie sich als Kunde registrieren, erheben wir folgende Daten:</p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Vorname und Nachname</li>
                <li>E-Mail-Adresse</li>
                <li>Telefonnummer (optional)</li>
                <li>Passwort (verschlüsselt gespeichert)</li>
              </ul>
              <p className="mb-2"><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)</p>
              <p className="mb-4"><strong>Speicherdauer:</strong> Bis zur Löschung Ihres Accounts oder 3 Jahre nach letzter Aktivität</p>

              <h3 className="font-semibold mt-4 mb-2">3.2 Daten bei Registrierung als Handwerker</h3>
              <p className="mb-2">Wenn Sie sich als Handwerker registrieren, erheben wir zusätzlich:</p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Firmenname und Firmendaten</li>
                <li>Rechtsform und UID-Nummer</li>
                <li>Gewerbeschein (Upload)</li>
                <li>Versicherungsnachweis (Upload)</li>
                <li>Profilbild und Portfolio-Bilder</li>
                <li>Gewerke und Serviceradius</li>
                <li>Zertifikate (optional)</li>
                <li>Wallet-Transaktionen und Kontostand</li>
              </ul>
              <p className="mb-2"><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) und lit. c (rechtliche Verpflichtung zur Identitätsprüfung)</p>
              <p className="mb-4"><strong>Speicherdauer:</strong> 7 Jahre nach Account-Löschung (steuerrechtliche Aufbewahrungspflichten)</p>

              <h3 className="font-semibold mt-4 mb-2">3.3 Projektdaten</h3>
              <p className="mb-2">Wenn Sie ein Projekt erstellen, speichern wir:</p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Projektbeschreibung und Titel</li>
                <li>Adresse und Postleitzahl</li>
                <li>Budget-Angaben</li>
                <li>Gewünschter Starttermin</li>
                <li>Projektbilder (Uploads)</li>
                <li>Kategorie und Gewerk</li>
              </ul>
              <p className="mb-2"><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)</p>
              <p className="mb-4"><strong>Speicherdauer:</strong> 3 Jahre nach Projektabschluss oder -löschung</p>

              <h3 className="font-semibold mt-4 mb-2">3.4 Nachrichten und Kommunikation</h3>
              <p className="mb-2">Wir speichern Ihre Nachrichten zwischen Kunden und Handwerkern:</p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Nachrichteninhalt</li>
                <li>Zeitstempel</li>
                <li>Absender und Empfänger</li>
                <li>Projektzuordnung</li>
              </ul>
              <p className="mb-2"><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)</p>
              <p className="mb-4"><strong>Speicherdauer:</strong> 2 Jahre nach letzter Nachricht im Gespräch</p>

              <h3 className="font-semibold mt-4 mb-2">3.5 Bewertungen</h3>
              <p className="mb-2">Sie können Handwerker bewerten. Wir speichern:</p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Bewertung (Sterne)</li>
                <li>Kommentar (optional)</li>
                <li>Zeitpunkt der Bewertung</li>
              </ul>
              <p className="mb-2"><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an Qualitätssicherung)</p>
              <p className="mb-4"><strong>Speicherdauer:</strong> Solange das Handwerker-Profil aktiv ist</p>

              <h3 className="font-semibold mt-4 mb-2">3.6 Zahlungsdaten</h3>
              <p className="mb-2">Für Lead-Käufe und Wallet-Aufladungen:</p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Transaktionsdaten (Betrag, Zeitpunkt, Beschreibung)</li>
                <li>Stripe-Zahlungs-IDs (keine Kreditkartendaten bei uns gespeichert)</li>
                <li>Wallet-Kontostand</li>
              </ul>
              <p className="mb-2"><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) und lit. c (steuerrechtliche Pflichten)</p>
              <p className="mb-4"><strong>Speicherdauer:</strong> 7 Jahre (steuerrechtliche Aufbewahrungspflichten)</p>

              <h3 className="font-semibold mt-4 mb-2">3.7 Technische Daten</h3>
              <p className="mb-2">Automatisch erhobene Daten beim Besuch der Website:</p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>IP-Adresse</li>
                <li>Browser-Typ und Version</li>
                <li>Betriebssystem</li>
                <li>Referrer-URL</li>
                <li>Zeitpunkt des Zugriffs</li>
                <li>Letzter Login-Zeitpunkt</li>
              </ul>
              <p className="mb-2"><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an Systemsicherheit)</p>
              <p className="mb-4"><strong>Speicherdauer:</strong> 7 Tage (IP-Adressen in Logs), Login-Zeitpunkt dauerhaft</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">4. Empfänger und Drittanbieter</h2>
              
              <h3 className="font-semibold mt-4 mb-2">4.1 Supabase (Datenbank & Authentifizierung)</h3>
              <p className="mb-2">Wir nutzen Supabase für die Datenspeicherung und Benutzer-Authentifizierung.</p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Anbieter: Supabase Inc.</li>
                <li>Serverstandort: EU (Frankfurt, Deutschland)</li>
                <li>Datenschutz: <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://supabase.com/privacy</a></li>
              </ul>

              <h3 className="font-semibold mt-4 mb-2">4.2 Stripe (Zahlungsabwicklung)</h3>
              <p className="mb-2">Für Zahlungen nutzen wir Stripe. Kreditkartendaten werden direkt bei Stripe verarbeitet, nicht bei uns.</p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Anbieter: Stripe Inc., USA</li>
                <li>EU-Standardvertragsklauseln vorhanden</li>
                <li>Datenschutz: <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://stripe.com/privacy</a></li>
              </ul>

              <h3 className="font-semibold mt-4 mb-2">4.3 Lovable/Vercel (Hosting)</h3>
              <p className="mb-2">Unsere Website wird gehostet bei:</p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Anbieter: Lovable/Vercel</li>
                <li>Serverstandort: EU</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">5. Cookies</h2>
              <p className="mb-4">Unsere Website verwendet nur technisch notwendige Cookies für die Funktionalität der Plattform (Session-Management, Authentifizierung). Diese Cookies sind für den Betrieb der Website unerlässlich und können nicht deaktiviert werden.</p>
              <p className="mb-2"><strong>Verwendete Cookies:</strong></p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li><code>sb-access-token</code> - Authentifizierungs-Token (Session)</li>
                <li><code>sb-refresh-token</code> - Refresh-Token für automatische Anmeldung</li>
                <li><code>cookie-consent</code> - Speichert Ihre Cookie-Einwilligung</li>
              </ul>
              <p className="mb-2"><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an Funktionalität)</p>
              <p><strong>Speicherdauer:</strong> Session-basiert bzw. bis zur Abmeldung</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">6. Ihre Rechte als betroffene Person</h2>
              <p className="mb-2">Sie haben folgende Rechte gemäß DSGVO:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Auskunftsrecht (Art. 15 DSGVO):</strong> Sie können Auskunft über Ihre gespeicherten Daten verlangen.</li>
                <li><strong>Berichtigungsrecht (Art. 16 DSGVO):</strong> Sie können die Berichtigung unrichtiger Daten verlangen.</li>
                <li><strong>Löschungsrecht (Art. 17 DSGVO):</strong> Sie können die Löschung Ihrer Daten verlangen, sofern keine gesetzlichen Aufbewahrungspflichten bestehen.</li>
                <li><strong>Einschränkung der Verarbeitung (Art. 18 DSGVO):</strong> Sie können die Einschränkung der Verarbeitung verlangen.</li>
                <li><strong>Datenübertragbarkeit (Art. 20 DSGVO):</strong> Sie können Ihre Daten in einem strukturierten Format erhalten.</li>
                <li><strong>Widerspruchsrecht (Art. 21 DSGVO):</strong> Sie können der Verarbeitung Ihrer Daten widersprechen.</li>
                <li><strong>Beschwerderecht:</strong> Sie haben das Recht, sich bei der Datenschutzbehörde zu beschweren.</li>
              </ul>
              <p className="mb-2">Zur Ausübung Ihrer Rechte kontaktieren Sie uns unter:</p>
              <p><a href="mailto:kontakt@bauconnect24.at" className="text-primary hover:underline">kontakt@bauconnect24.at</a></p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">7. Datenschutzbehörde</h2>
              <p className="mb-2">Österreichische Datenschutzbehörde</p>
              <p>Barichgasse 40-42</p>
              <p>1030 Wien</p>
              <p>Telefon: +43 1 52 152-0</p>
              <p>E-Mail: <a href="mailto:dsb@dsb.gv.at" className="text-primary hover:underline">dsb@dsb.gv.at</a></p>
              <p>Website: <a href="https://www.dsb.gv.at" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://www.dsb.gv.at</a></p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">8. Datensicherheit</h2>
              <p className="mb-4">Wir verwenden innerhalb des Website-Besuchs das verbreitete SSL-Verfahren (Secure Socket Layer) in Verbindung mit der jeweils höchsten Verschlüsselungsstufe. Alle Passwörter werden verschlüsselt gespeichert. Der Zugriff auf Ihre Daten ist nur für autorisierte Personen möglich.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">9. Änderungen der Datenschutzerklärung</h2>
              <p>Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen in der Datenschutzerklärung umzusetzen. Für Ihren erneuten Besuch gilt dann die neue Datenschutzerklärung.</p>
            </section>

            <section className="text-sm text-muted-foreground pt-4 border-t">
              <p>Stand: Januar 2025</p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Datenschutz;

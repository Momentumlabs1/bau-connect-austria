import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";

const AGB = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Allgemeine Geschäftsbedingungen (AGB)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-2">§1 Geltungsbereich</h2>
              <p className="mb-2">Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung der Online-Plattform BauConnect24 (nachfolgend "Plattform"), betrieben durch:</p>
              <p className="mb-2 font-medium">BauConnect24 e.U, Efraim Dinc, Schwemmgasse 3, 4332 Au an der Donau, Österreich</p>
              <p>Die Plattform dient der Vermittlung von Handwerksleistungen zwischen Kunden und Handwerkern.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">§2 Vertragspartner und Plattform-Rolle</h2>
              <p className="mb-4">BauConnect24 stellt ausschließlich die technische Plattform zur Verfügung und vermittelt den Kontakt zwischen Kunden und Handwerkern. BauConnect24 ist <strong>nicht Vertragspartei</strong> der zwischen Kunden und Handwerkern geschlossenen Verträge über Handwerksleistungen.</p>
              <p className="mb-4">Der Vertrag über die tatsächliche Ausführung der Handwerksleistung kommt ausschließlich zwischen Kunde und Handwerker zustande. BauConnect24 übernimmt keine Haftung für die Erfüllung, Qualität oder Rechtmäßigkeit dieser Verträge.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">§3 Registrierung und Nutzerkonto</h2>
              <p className="mb-2"><strong>3.1</strong> Zur Nutzung der Plattform ist eine Registrierung erforderlich. Die Registrierung erfolgt wahlweise als Kunde oder Handwerker.</p>
              <p className="mb-2"><strong>3.2</strong> Der Nutzer garantiert, dass alle bei der Registrierung angegebenen Daten wahrheitsgemäß und vollständig sind. Änderungen sind unverzüglich mitzuteilen.</p>
              <p className="mb-2"><strong>3.3</strong> Der Nutzer ist verpflichtet, sein Passwort geheim zu halten. Bei Missbrauchsverdacht ist BauConnect24 unverzüglich zu informieren.</p>
              <p className="mb-2"><strong>3.4</strong> Handwerker müssen eine vollständige Verifizierung (Gewerbeschein, Versicherungsnachweis) durchlaufen, bevor sie Leads kaufen können.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">§4 Leistungen für Kunden</h2>
              <p className="mb-2"><strong>4.1 Projekteinstellung:</strong> Kunden können kostenlos Projekte einstellen und Handwerker kontaktieren.</p>
              <p className="mb-2"><strong>4.2 Keine Erfolgsgarantie:</strong> BauConnect24 garantiert nicht, dass Kunden Angebote von Handwerkern erhalten. Die Plattform vermittelt lediglich den Kontakt.</p>
              <p className="mb-2"><strong>4.3 Projektbeschreibung:</strong> Kunden sind verpflichtet, ihre Projekte wahrheitsgemäß, vollständig und ohne irreführende Angaben zu beschreiben.</p>
              <p className="mb-2"><strong>4.4 Bewertungen:</strong> Kunden können Handwerker nach Projektabschluss bewerten. Bewertungen müssen wahrheitsgemäß sein und dürfen keine beleidigenden Inhalte enthalten.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">§5 Leistungen für Handwerker</h2>
              <p className="mb-2"><strong>5.1 Lead-System:</strong> Handwerker können Leads (Kundenprojekte) kaufen, um Zugang zu vollständigen Kontaktdaten des Kunden zu erhalten.</p>
              <p className="mb-2"><strong>5.2 Lead-Preis:</strong> Der Preis pro Lead beträgt aktuell 5,00 EUR (inklusive Mehrwertsteuer, sofern anwendbar). Preisänderungen werden mit einer Frist von 14 Tagen per E-Mail angekündigt.</p>
              <p className="mb-2"><strong>5.3 Wallet-System:</strong> Handwerker laden ihr Wallet-Guthaben auf und bezahlen Leads aus diesem Guthaben. Die Aufladung erfolgt per Kreditkarte über Stripe.</p>
              <p className="mb-2"><strong>5.4 Keine Rückerstattung:</strong> Gekaufte Leads können nicht zurückgegeben werden. Der Handwerker erhält mit dem Lead-Kauf sofortigen Zugang zu den vollständigen Kundendaten.</p>
              <p className="mb-2"><strong>5.5 Keine Erfolgsgarantie:</strong> Der Kauf eines Leads garantiert nicht den Zuschlag für das Projekt. Die Vergabe obliegt ausschließlich dem Kunden.</p>
              <p className="mb-2"><strong>5.6 Profilinformationen:</strong> Handwerker sind verpflichtet, ihr Profil vollständig und wahrheitsgemäß auszufüllen. Portfolio-Bilder müssen eigene Arbeiten darstellen.</p>
              <p className="mb-2"><strong>5.7 Verifizierung:</strong> BauConnect24 behält sich vor, hochgeladene Dokumente (Gewerbeschein, Versicherung) zu prüfen und Profile bei Zweifeln abzulehnen oder zu sperren.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">§6 Preise und Zahlung</h2>
              <p className="mb-2"><strong>6.1</strong> Die Projekteinstellung und Kontaktaufnahme durch Kunden ist kostenfrei.</p>
              <p className="mb-2"><strong>6.2</strong> Handwerker zahlen für den Kauf von Leads gemäß der aktuellen Preisliste.</p>
              <p className="mb-2"><strong>6.3</strong> Alle Preise verstehen sich inklusive gesetzlicher Umsatzsteuer (sofern anwendbar).</p>
              <p className="mb-2"><strong>6.4</strong> Die Zahlung erfolgt per Kreditkarte über den Zahlungsdienstleister Stripe. Es gelten die AGB von Stripe.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">§7 Pflichten der Nutzer</h2>
              <p className="mb-2"><strong>7.1</strong> Nutzer sind verpflichtet, keine rechtswidrigen, beleidigenden, diskriminierenden oder sittenwidrigen Inhalte zu veröffentlichen.</p>
              <p className="mb-2"><strong>7.2</strong> Die Nutzung der Plattform für Spam, Werbung oder andere unzulässige Zwecke ist untersagt.</p>
              <p className="mb-2"><strong>7.3</strong> Nutzer dürfen die Plattform nicht durch Bots, Scraping oder andere automatisierte Verfahren missbrauchen.</p>
              <p className="mb-2"><strong>7.4</strong> Das Kopieren, Verbreiten oder kommerzielle Nutzen von Inhalten anderer Nutzer ist ohne deren Zustimmung untersagt.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">§8 Haftungsausschluss</h2>
              <p className="mb-2"><strong>8.1 Vermittlerrolle:</strong> BauConnect24 ist ausschließlich Vermittler und nicht Vertragspartei der zwischen Kunden und Handwerkern geschlossenen Verträge. BauConnect24 übernimmt keine Haftung für die Erfüllung, Qualität, Rechtmäßigkeit oder Mängel der vermittelten Handwerksleistungen.</p>
              <p className="mb-2"><strong>8.2 Inhalte Dritter:</strong> BauConnect24 übernimmt keine Haftung für von Nutzern eingestellte Inhalte (Projektbeschreibungen, Bewertungen, Portfolio-Bilder). Nutzer haften selbst für ihre Inhalte.</p>
              <p className="mb-2"><strong>8.3 Verfügbarkeit:</strong> BauConnect24 bemüht sich um eine ständige Verfügbarkeit der Plattform, übernimmt jedoch keine Garantie. Wartungsarbeiten können zu vorübergehenden Ausfällen führen.</p>
              <p className="mb-2"><strong>8.4 Höhere Gewalt:</strong> BauConnect24 haftet nicht für Ausfälle oder Verzögerungen, die durch höhere Gewalt, Streiks, Naturkatastrophen oder andere außerhalb des Einflussbereichs liegende Ereignisse verursacht werden.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">§9 Bewertungssystem</h2>
              <p className="mb-2"><strong>9.1</strong> Kunden können Handwerker nach Projektabschluss bewerten (Sterne und Kommentar).</p>
              <p className="mb-2"><strong>9.2</strong> Bewertungen müssen wahrheitsgemäß sein und dürfen keine beleidigenden, diskriminierenden oder rechtswidrigen Inhalte enthalten.</p>
              <p className="mb-2"><strong>9.3</strong> BauConnect24 behält sich vor, Bewertungen zu löschen, die gegen diese AGB verstoßen.</p>
              <p className="mb-2"><strong>9.4</strong> Handwerker können auf Bewertungen nicht antworten, aber unangemessene Bewertungen melden.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">§10 Kündigung und Löschung des Nutzerkontos</h2>
              <p className="mb-2"><strong>10.1</strong> Nutzer können ihr Konto jederzeit ohne Angabe von Gründen kündigen. Die Löschung erfolgt über die Account-Einstellungen oder per E-Mail an kontakt@bauconnect24.at.</p>
              <p className="mb-2"><strong>10.2</strong> BauConnect24 kann Nutzerkonten bei Verstoß gegen diese AGB oder bei rechtswidrigem Verhalten mit sofortiger Wirkung sperren oder löschen.</p>
              <p className="mb-2"><strong>10.3</strong> Bei Kontolöschung werden personenbezogene Daten gemäß der Datenschutzerklärung gelöscht. Buchungsbelege werden aus steuerrechtlichen Gründen 7 Jahre aufbewahrt.</p>
              <p className="mb-2"><strong>10.4</strong> Ein Anspruch auf Rückerstattung von Wallet-Guthaben besteht bei Kündigung nicht, sofern keine gesetzliche Ausnahme greift.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">§11 Datenschutz</h2>
              <p className="mb-2">Für die Verarbeitung personenbezogener Daten gilt unsere <a href="/datenschutz" className="text-primary hover:underline">Datenschutzerklärung</a>.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">§12 Änderungen der AGB</h2>
              <p className="mb-2"><strong>12.1</strong> BauConnect24 behält sich vor, diese AGB jederzeit zu ändern. Änderungen werden den Nutzern per E-Mail mitgeteilt.</p>
              <p className="mb-2"><strong>12.2</strong> Widerspricht der Nutzer den geänderten AGB nicht innerhalb von 14 Tagen, gelten die geänderten AGB als akzeptiert.</p>
              <p className="mb-2"><strong>12.3</strong> Widerspricht der Nutzer, kann BauConnect24 das Nutzungsverhältnis mit einer Frist von 30 Tagen kündigen.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">§13 Schlussbestimmungen</h2>
              <p className="mb-2"><strong>13.1 Anwendbares Recht:</strong> Es gilt ausschließlich österreichisches Recht unter Ausschluss des UN-Kaufrechts.</p>
              <p className="mb-2"><strong>13.2 Gerichtsstand:</strong> Ausschließlicher Gerichtsstand ist Linz, Österreich (soweit gesetzlich zulässig).</p>
              <p className="mb-2"><strong>13.3 Salvatorische Klausel:</strong> Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.</p>
              <p className="mb-2"><strong>13.4 Streitbeilegung:</strong> Die EU-Kommission stellt eine Plattform für außergerichtliche Streitbeilegung bereit: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://ec.europa.eu/consumers/odr</a></p>
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

export default AGB;

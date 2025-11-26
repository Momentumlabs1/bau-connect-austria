import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";

const Impressum = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Impressum</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-2">Informationspflicht laut §5 E-Commerce Gesetz</h2>
              <p className="mb-4">Medieninhaber und Herausgeber:</p>
              <p className="font-medium">BauConnect24 e.U</p>
              <p>Schwemmgasse 3</p>
              <p>4332 Au an der Donau</p>
              <p>Österreich</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">Kontaktdaten</h2>
              <p>Telefon: +43 676 7360103</p>
              <p>E-Mail: <a href="mailto:info@bauconnect24.at" className="text-primary hover:underline">info@bauconnect24.at</a></p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">Unternehmensgegenstand</h2>
              <p>Online-Vermittlungsplattform für Handwerksleistungen</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">Unternehmensinhaber</h2>
              <p>Efraim Dinc</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">Kammerzugehörigkeit</h2>
              <p>Wirtschaftskammer Österreich</p>
              <p>Bezirksstelle Perg</p>
              <p><a href="https://www.wko.at" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.wko.at</a></p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">Umsatzsteuer</h2>
              <p>Als Kleinunternehmer gemäß § 6 Abs. 1 Z 27 UStG wird keine Umsatzsteuer ausgewiesen.</p>
              <p>UID-Nummer: Nicht vorhanden (Kleinunternehmerregelung)</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">Firmenbuch</h2>
              <p>Einzelunternehmen sind nicht im Firmenbuch eingetragen.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">Aufsichtsbehörde/Gewerbebehörde</h2>
              <p>Bezirkshauptmannschaft Perg</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">Berufsrecht</h2>
              <p>Gewerbeordnung: <a href="https://www.ris.bka.gv.at" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.ris.bka.gv.at</a></p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">Online-Streitbeilegung</h2>
              <p className="mb-2">Verbraucher haben die Möglichkeit, Beschwerden an die Online-Streitbeilegungsplattform der EU zu richten:</p>
              <p><a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://ec.europa.eu/consumers/odr</a></p>
              <p className="mt-2">Sie können allfällige Beschwerde auch an die oben angegebene E-Mail-Adresse richten.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">Mediengesetz §25 - Offenlegung</h2>
              <h3 className="font-semibold mt-4 mb-2">Blattlinie</h3>
              <p>BauConnect24 ist eine Online-Plattform zur Vermittlung von Handwerksleistungen in Österreich. Wir bringen Kunden mit qualifizierten Handwerkern zusammen und ermöglichen eine transparente und effiziente Projektvergabe.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">Haftungsausschluss</h2>
              <h3 className="font-semibold mt-4 mb-2">Haftung für Inhalte dieser Website</h3>
              <p className="mb-4">Wir entwickeln die Inhalte dieser Website ständig weiter und bemühen uns korrekte und aktuelle Informationen bereitzustellen. Leider können wir keine Haftung für die Korrektheit aller Inhalte auf dieser Website übernehmen, speziell für jene, die seitens Dritter bereitgestellt wurden. Als Diensteanbieter sind wir nicht verpflichtet, die von Ihnen übermittelten oder gespeicherten Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.</p>
              
              <h3 className="font-semibold mt-4 mb-2">Haftung für Links auf dieser Website</h3>
              <p>Unsere Website enthält Links zu anderen Websites für deren Inhalt wir nicht verantwortlich sind. Haftung für verlinkte Websites besteht für uns nicht, da wir keine Kenntnis rechtswidriger Tätigkeiten hatten und haben, uns solche Rechtswidrigkeiten auch bisher nicht aufgefallen sind und wir Links sofort entfernen würden, wenn uns Rechtswidrigkeiten bekannt werden.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">Urheberrechtshinweis</h2>
              <p>Alle Inhalte dieser Website (Bilder, Fotos, Texte, Videos) unterliegen dem Urheberrecht. Falls notwendig, werden wir die unerlaubte Nutzung von Teilen der Inhalte unserer Seite rechtlich verfolgen.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">Bildernachweis</h2>
              <p>Die Bilder, Fotos und Grafiken auf dieser Website sind urheberrechtlich geschützt.</p>
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

export default Impressum;

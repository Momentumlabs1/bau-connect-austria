import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";

const Widerruf = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Widerrufsbelehrung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-2">Widerrufsrecht</h2>
              <p className="mb-4">Verbraucher (das ist jede natürliche Person, die ein Rechtsgeschäft zu Zwecken abschließt, die überwiegend weder ihrer gewerblichen noch ihrer selbständigen beruflichen Tätigkeit zugerechnet werden können) haben ein vierzehntägiges Widerrufsrecht.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">Widerrufsfrist</h2>
              <p className="mb-4">Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">Ausübung des Widerrufsrechts</h2>
              <p className="mb-2">Um Ihr Widerrufsrecht auszuüben, müssen Sie uns:</p>
              <div className="bg-muted p-4 rounded-md mb-4">
                <p className="font-medium">BauConnect24 e.U</p>
                <p>Efraim Dinc</p>
                <p>Schwemmgasse 3</p>
                <p>4332 Au an der Donau</p>
                <p>Österreich</p>
                <p className="mt-2">E-Mail: <a href="mailto:kontakt@bauconnect24.at" className="text-primary hover:underline">kontakt@bauconnect24.at</a></p>
                <p>Telefon: +43 676 7360103</p>
              </div>
              <p className="mb-4">mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür das beigefügte Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.</p>
              <p className="mb-4">Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">Folgen des Widerrufs</h2>
              <p className="mb-4">Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">Besondere Hinweise</h2>
              
              <h3 className="font-semibold mt-4 mb-2">Für Wallet-Aufladungen:</h3>
              <p className="mb-4">Das Widerrufsrecht gilt für Wallet-Aufladungen (Guthaben-Aufbuchungen) gemäß den gesetzlichen Bestimmungen. Sie können Ihre Wallet-Aufladung innerhalb von 14 Tagen widerrufen.</p>

              <h3 className="font-semibold mt-4 mb-2">Ausnahme für Lead-Käufe:</h3>
              <p className="mb-4">Das Widerrufsrecht erlischt bei Verträgen über die Erbringung von Dienstleistungen, wenn der Unternehmer die Dienstleistung vollständig erbracht hat und mit der Ausführung der Dienstleistung erst begonnen hat, nachdem der Verbraucher dazu seine ausdrückliche Zustimmung gegeben hat und gleichzeitig seine Kenntnis davon bestätigt hat, dass er sein Widerrufsrecht bei vollständiger Vertragserfüllung durch den Unternehmer verliert.</p>
              <p className="mb-4"><strong>Das bedeutet konkret:</strong> Wenn Sie einen Lead kaufen und ausdrücklich zustimmen, dass die Dienstleistung (Zugang zu Kundenkontaktdaten) sofort erbracht wird, erlischt Ihr Widerrufsrecht mit dem Moment des Lead-Kaufs. Dies wird Ihnen vor jedem Lead-Kauf deutlich angezeigt und Sie müssen aktiv zustimmen.</p>
            </section>

            <section className="bg-muted p-6 rounded-md">
              <h2 className="text-xl font-semibold mb-4">Muster-Widerrufsformular</h2>
              <p className="mb-4 italic">(Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und senden Sie es zurück.)</p>
              
              <div className="bg-background p-4 rounded border border-border">
                <p className="mb-2">An:</p>
                <p className="font-medium">BauConnect24 e.U</p>
                <p>Efraim Dinc</p>
                <p>Schwemmgasse 3</p>
                <p>4332 Au an der Donau</p>
                <p>Österreich</p>
                <p className="mb-4">E-Mail: kontakt@bauconnect24.at</p>
                
                <p className="mb-4">Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über die Erbringung der folgenden Dienstleistung (*) / den Kauf der folgenden Waren (*):</p>
                <p className="mb-4">_________________________________________________________________</p>
                <p className="mb-4">Bestellt am (*) / erhalten am (*):</p>
                <p className="mb-4">_________________________________________________________________</p>
                <p className="mb-4">Name des/der Verbraucher(s):</p>
                <p className="mb-4">_________________________________________________________________</p>
                <p className="mb-4">Anschrift des/der Verbraucher(s):</p>
                <p className="mb-4">_________________________________________________________________</p>
                <p className="mb-4">Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier):</p>
                <p className="mb-4">_________________________________________________________________</p>
                <p className="mb-4">Datum:</p>
                <p className="mb-4">_________________________________________________________________</p>
                <p className="text-sm italic">(*) Unzutreffendes streichen.</p>
              </div>
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

export default Widerruf;

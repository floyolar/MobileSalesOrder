# MobileSalesOrder
Mobile Sales Order App for SAP business one(SBO) HANA Service Layer(SL)

Es handelt sich um eine Demosoftware für den Zugriff eines WebFrontends auf die Businesslogic von SBO über den Servicelayer.
Wir lassen sie auf einem NGINX Webserver laufen.

Die URL zum Servicelayer ist in der nginx.conf als proxy pass definert:

location /b1s/v1/ {
        proxy_pass https://XXX.XXX.XXX.XXX:50005/b1s/v1/;
        }

Dadurch wird auch das CORS Problem umgangen. (https://de.wikipedia.org/wiki/Cross-Origin_Resource_Sharing)

Wir haben das Teil für einen Kundentag aus der Hüfte geschossen. Es wird kein Framework und dergleichen verwendet,
ist nicht für den produktiven Einsatz geeignet.

Aber vielleicht dient sie dem ingteressierten Kollegen als Einstieg in die Welt der SAP HANA Servicelayer Entwicklung.

Was tut die App?
1. Login an die HANA DB,die in der login.js unter CompanyDB angegeben ist
2. Eine Liste der offenen Aufträge anzeigen
3. einen neuen Auftrag anlegen
4. einen Auftrag unterschreiben (mit dem Finger/Stift auf einem Touch Display


Voraussetzungen:
UDF im Auftrag (ORDR) U_ISSIGNED, ALpha(1) - ist ein Flag, ob der Auftrag bereits unterschrieben ist
UDF im Auftrag (ORDR) U_Sign, Text - enthält die Unterschrift als Base64 String vom Jpeg der Unterschrift
Auftrags-Layout, z.B. CLD, welche den Text wieder in ein JPEG verwandelt und dieses unterhalb des Gesamtpreises anzeigt.

Bei Fragen, einfach hier stellen...

# MobileSalesOrder
Mobile Sales Order App for SBO Hana SL

Es handelt sich um eine Demosoftware.
Wir lassen sie auf einem NGINX Webserver laufen.

Die URL zum Servicelayer ist in der ningx.conf als proxy pass definert:

location /b1s/v1/ {
        proxy_pass https://XXX.XXX.XXX.XXX:50005/b1s/v1/;
        }

Dadurch wird auch das CORS Problem umgangen. (https://de.wikipedia.org/wiki/Cross-Origin_Resource_Sharing)

Wir haben das Teil für einen Kundentag aus der Hüfte geschossen. Es wird kein Framework und dergleichen verwendet,
ist nicht für den produktiven Einsatz geeignet.

Aber vielleicht dient sie dem ingteressierten Kollegen als Einstieg in die Welt der SAP HANA Servicelayer Entwicklung.
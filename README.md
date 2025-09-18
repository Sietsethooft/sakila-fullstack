# Sakila Fullstack Webapplicatie

Deze webapplicatie ontsluit de Sakila filmverhuur database via een gebruiksvriendelijke interface. De applicatie is gebouwd met JavaScript, Express en MySQL, volgens het MVC-architectuurpatroon.

## Functionaliteit

- Overzicht en beheer van films, klanten en verhuurtransacties
- Authenticatie voor gebruikers (inloggen, uitloggen)
- Server-side rendering van pagina's met EJS
- Gebruik van Bootstrap voor styling
- Foutafhandeling met duidelijke foutmeldingen
- "About"-pagina met user stories en acceptatiecriteria

## Architectuur

- **Backend:** Node.js, Express, MySQL (zonder ORM, alleen callbacks)
- **Frontend:** Server-side rendered EJS views, Bootstrap CSS
- **Structuur:** MVC (Model-View-Controller)
- **Database:** Online MySQL database

## Installatie

1. Clone deze repository:
   ```
   git clone <repo-url>
   cd sakila-fullstack
   ```
2. Installeer dependencies:
   ```
   npm install
   ```
3. Configureer je `.env` bestand met je databasegegevens. Denk hierbij aan:
   ```
   DB_HOST=...
   DB_USER=...
   DB_PASSWORD=...
   DB_DATABASE=...
   DB_PORT=...
   SECRET_KEY=...
   ```
4. Start de applicatie:
   ```
   npm start
   ```

## CI/CD

Deze repository bevat een CI/CD workflow die automatisch tests uitvoert en de applicatie naar een online omgeving deployed bij een geslaagde build.

## User Stories & Acceptatiecriteria

Zie de "About"-pagina in de applicatie voor een overzicht van de user stories en acceptatiecriteria.

## Licentie

Dit project gebruikt uitsluitend open source technologieën en is bedoeld voor educatieve doeleinden.

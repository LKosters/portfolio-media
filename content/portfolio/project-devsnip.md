Dit project is een zelf bedacht project die ik graag wou doen. Het doel: een website waar developers makkelijk en snel code snippets kunnen delen met elkaar. Zie hieronder mijn process voor het maken van deze website.
![](/portfolio-images/Process.png)

## Project management
Om dit bij te houden heb ik als project management tool Linear gebruikt zodat ik een goed overzicht heb wat ik nog moet doen. Ook kan ik hierin de code die ik schrijf linken aan een git branch en een preview link bij mijn hosting zodat ik precies kan zien welke code er nodig was om een bepaald issue te verhelpen.

![](/portfolio-images/Linear issues DevSnip.png)

## Designing
Ik startte het project met het designen van een landingspagina voor de website, dit deed ik in figma met behulp van components en auto layouts. Mijn doel was dat je makkelijk je code kan sharen en dat het mooie code snippets zijn, dus dit wou ik daarom benadrukken. Ook omdat ik als doelgroep developers heb wou ik dat het wel een beetje minimaler was en een donkere stijl omdat dat meer bij developers past. Zie hieronder mijn figma bestand voor de landingspagina.

![](/portfolio-images/Figma Design DevSnip.png)

## Development
Op het begin van zon project denk ik na met welke tech stack ik de website wil bouwen, daaruit kwam het volgende:
- Framework: Next.js (voor de Shadcn component library)
- Database: Firebase (heeft een fijne free tier en is makkelijk te gebruiken)
- Authenticatie: Clerk (makkelijk op te zetten ook met SSO en een goede free tier)

### Basis opzetten
Ik begon het development gedeelte met een basis opzetten in de AI tool v0.dev, dit zorgt ervoor dat ik veel sneller een dashboard op kan zetten en aan landingspagina op basis van mijn design. Een prompt die ik bijvoorbeeld gebruikt heb voor het maken van het dashboard is:

> Create a dashboard for a code snippets website, codesnippets have a name language and the code itself, each snippets has a copy and share button and the side has a sidebar with a dashboard (home) create and user

Hieruit kwam het volgende resultaat:

![](/portfolio-images/Pasted image 20250410095443.png)

Ook voor de landingspagina zelf heb ik v0.dev gebruik met de volgende prompt waarin ik ook mijn figma bestand heb gelinkt met de figma integratie:

> Please recreate the UI shown in the attached Figma frame as accurately as possible.

Hieruit kwam het volgende:

![](/portfolio-images/Pasted image 20250410095643.png)

### Verdergaan op de basis
Zoals je denk ik ook wel meteen ziet is de basis die AI voor mij heeft opgezet nog zeker nog goed genoeg als eindproduct. Fonts die niet kloppen, dashboard ie niet de goede kleuren gebruikt, kleine styling inconsistenties. Daardoor heb ik er eerst voor gezorgd dat dit allemaal klopt voordat ik verder zou gaan met het functionele gedeelte. Ik denk dat het eindresultaat er erg goed uit ziet:

![](/portfolio-images/Pasted image 20250410100206.png)
![](/portfolio-images/Pasted image 20250410100234.png)

### Het functionele gedeelte
Hierna heb ik het dus functioneel gemaakt, dit begon met in Clerk een project aanmaken en daarna Clerk als package installeren en de provider om mijn app heen zetten. Na het zetten van mijn keys in mijn .env werkte het meteen. Hierna heb ik in Firebase een app aangemaakt met Firestore als database, in die database is er een collection snippets waar elke snippet het volgende in bevat:

- userId (string)
- Name (string)
- Language (string)
- Code (string)
- updatedAt (timestamps)
- createdAt (timestamps)

Door het userId is het dus makkelijk om de snippets te kunnen ophalen op basis van de user, dit doe ik met de volgende code:
![](/portfolio-images/db.ts.png)
De pagesize in de code zorgt ervoor dat mijn infinite scrolling goed kan werken zodat het steeds meer snippets laat hoe verder je scrolt.

### Versiebeheer
Om versiebeheer bij te houden gebruikte ik GitHub en zorgde ik ervoor dat al mijn issues die ik bijhield in Linear een aparte branch kregen en ik die als de issue af was gemerged werd op de main branch. Ook omdat ik Vercel gebruikte voor mijn hosting werd automatisch na een push een nieuwe build gemaakt voor de live omgeving wat erg fijn is.

![](/portfolio-images/GitHub DevSnip.png)

## User testing
Na het maken van de website wou ik het graag testen om te kijken of er misschien nog problemen waren die ik gemist heb of features waren die nog misten. Om dit te user testen maakte ik gebruik van de tool PostHog. PostHog is een analytics tool die heel veel verschillende features heeft om analytics te krijgen of om users te testen. Ik heb voor mijn tests de optie gekozen voor een Survey omdat ik daarmee vragen kan stellen over de features die ik belangrijk vindt op mijn website. Ik heb wel gericht gekozen voor de mensen die mijn survey in zouden vullen dat het echt developers zijn. Ook heb ik ze een instructie meegestuurd met wat ze eerst op de website moesten doen voordat ze de survey gingen invullen. Wat PostHog makkelijk maakt is dat ik van de mensen die mijn survey ingevuld hebben een recording kan zien van hoe ze door mijn website hij zijn gegaan. Hieruit heb ik ook veel informatie kunnen halen en kon ik makkelijker bugs eruit halen omdat ik ook de browser console van de user kon zien.

![](/portfolio-images/Pasted image 20250410102529.png)

Zie hieronder een samenvatting van de antwoorden:

![](/portfolio-images/Pasted image 20250410102635.png)

## TODO: Conclusie
Bezoek de website op https://www.devsnip.nl/
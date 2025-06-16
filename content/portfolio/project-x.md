In dit project heb ik een webapp gemaakt waar je met AI workouts routines kan genereren en ook met een AI coach kan praten die je advies of andere tips kan geven op basis van je recente workouts en routines. Mijn doel met dit project was om AI op een nuttige manier te integreren in een app. Ik wou ook iets maken wat nuttig opzichzelf was, iets wat ik zelf zou gaan gebruiken.

## Planning
Ik heb van te voren eerst in mijn projectplanning een globale planning gemaakt en als ik die zou volgen zou ik op schema liggen.
![Pasted image 20250611114320](/portfolio-images/Pasted image 20250611114320.png)
Uiteindelijk heb ik veel sneller gewerkt en had ik alles van week 1 t/m 3 al in de eerste week af. Dit kwam opzich prima uit want hierdoor kon ik me ook focussen op nieuwe onderdelen zoals een statistieken pagina en een landingspagina als je niet ingelogd was. Ook om precies bij te houden wat ik nog moest doen heb ik Linear gebruikt als project management tool, zie hieronder hoe dat eruit zag.
![Pasted image 20250611114515](/portfolio-images/Pasted image 20250611114515.png)
Ook heb ik in Linear milestones aangemaakt voor bijvoorbeeld ready for testing en 1.0 zodat ik ook weet wanneer ik genoeg heb gemaakt om te gaan user testen.

## Versiebeheer
Versiebeheer heb ik bijgehouden op GitHub, hier maak ik ook gebruik van van branches en open ik pull requests om ze te mergen naar main. Ook wordt er van elke commit een preview gemaakt op mijn hosting (Vercel) waardoor ik kan zien hoe het er op de server uitziet voordat ik merge. Elke commit/merge naar main wordt er een volledige buildt gemaakt op Vercel waardoor de live website meteen wordt aangepast. Zie hieronder een foto van hoe mijn GitHub eruit zag.
![Pasted image 20250611114848](/portfolio-images/Pasted image 20250611114848.png)

## Design
Ik heb eerst een design een Figma gemaakt voor de webapp, hierin heb ik gebruik gemaakt van een component voor de navigatie en ik heb de rest van de elementen gebruik gemaakt van autolayouts. Ook heb ik het logo voor de webapp gemaakt en een gradient gemaakt wat ik overal kan hergebruiken.
![Pasted image 20250613103049](/portfolio-images/Pasted image 20250613103049.png)
![Pasted image 20250613110209](/portfolio-images/Pasted image 20250613110209.png)

## Development stack
Als development stack heb ik gekozen om de webapp in het framework Nuxt te maken omdat ik dat een fijn framework vindt om in te werken. Voor authenticatie heb ik Clerk gebruik omdat die en goede gratis versie heeft en makkelijk te installeren is. Voor het AI model heb ik Gemini gebruikt omdat die tegenwoordig best wel goede resultaten geeft en het het enigste AI model is waarvan je de API kan gebruiken zonder geld te betalen met een free tier. Omdat ik al voor het AI model voor google ben gegaan heb ik voor de database Firebase gebruikt omdat de Firebase SDK toch al in mijn project zat.

## Background agents testen
Tijdens dat ik bezig was met dit project kwam de code editor Cursor uit met een nieuwe AI feature: Background agents. Background agents kunnen aanpassingen maken aan je code op de achtergrond op een aparte git branch waardoor ze eigenlijk meer een soort werknemer van je zijn. De code wordt automatisch gecommit naar die aparte branch wat dus best wel handig is. Ik heb de AI coach feature laten maken door een background agent en zie hieronder het resultaat.
![Pasted image 20250613111020](/portfolio-images/Pasted image 20250613111020.png)
Ik was nog niet helemaal blij met de styling die de background agent gemaakt had maar het werkte wel volledig goed dus was al in al heel erg verast met deze nieuwe AI feature.

## Conclusie
Ik ben best wel blij met het eindresultaat, het is namelijk een app die ik zelf gebruik. Mijn doel was om AI in een nuttige manier te integeren in een app, en als ik het zelf al gebruik dan is dat zeker wel geslaagd.

## Links
GitHub: https://github.com/LKosters/AdaptAI
Figma: https://www.figma.com/design/4OxGwHhjDE6rYjUCiDhRdh/AdaptAI?node-id=0-1&t=KV6Bz8pbblLitCvR-1
Website: https://adaptai.lkosters.nl/
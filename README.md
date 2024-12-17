I den här inlämningsuppgiften får ni möjlighet att använda er av de koncept och verktyg som vi har gått igenom. Ni ska utveckla ett smart kontrakt i Solidity för en crowdfunding-plattform, där användare kan starta insamlingar för välgörenhetsändamål. Varje insamling ska ha ett målbelopp och en deadline. Om målbeloppet nås innan deadlinen ska insamlingen avslutas, och pengarna överföras till den angivna mottagaren. Det ska då inte längre vara möjligt att bidra till insamlingen. Om målbeloppet inte nås innan deadline, ska pengarna returneras till bidragsgivarna.

Kontraktet ska inkludera följande funktioner:

Skapa insamlingar med ett specifikt målbelopp och en deadline.
Möjlighet för användare att donera pengar till insamlingen.
Stänga insamlingen och överföra pengarna till mottagaren om målbeloppet nås.
Återbetala donationerna till bidragsgivarna om målbeloppet inte nås innan deadline.
Samtliga användare ska kunna skapa insamlingar, och flera insamlingar ska kunna pågå samtidigt.

 

Grundläggande krav (G):
Kontraktet ska innehåll följande element:

Minst en struct eller enum
Minst en mapping eller array
En constructor
Minst en custom modifier
Minst ett event för att logga viktiga händelser
Utöver ovanstående krav ska ni även skriva tester för kontraktet som täcker grundläggande funktionalitet. Säkerställer att alla viktiga funktioner fungerar som förväntat, samt att ni har ett test coverage på minst 40%.

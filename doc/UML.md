The UML for our schema is: 
![Alt text](images/UML.png)

Converting UML to relational schema yields the following:

1)User(Userid: VARCHAR(20) [PK], Name: VARCHAR(255), EmailAddress: VARCHAR(255), Password: VARCHAR(255), Phoneno: VARCHAR(15))
2)Athelete(Athleteid: VARCHAR(20) [PK], Name: VARCHAR(255), Gender: ENUM)
3)Sport(Sportid: VARCHAR(50) [PK], Sportname: VARCHAR(50), Category: VARCHAR(50))
4)Country (Countryname: VARCHAR(20) [PK]);
5)Team(Teamid: VARCHAR(50) [PK], TeamName: VARCHAR(50), Countryname: VARCHAR(20) [FK to Country.Countryname])
The attribure Countryname is added to the Team relation as foreign key referencing Countryname attribute in Country Relation, because Team and Country are part of a Many to One Relation named "Playsfor", and hence Team can Play for only one country.
6)Belongs(Athleteid: VARCHAR(20) [PK] [FK to Athlete.Athleteid], Teamid: VARCHAR(50) [PK] [FK to Team.Teamid], Role: VARCHAR(20))
Belongs is a Many to Many relation consisting of Athlete and Team, this means an athlete can be part of multiple teams and a team can have multiple athletes. One important point to note is that Role attribute is a relational attribute for Belongs.
It can have two values either player or a coach, which means an athlete can belong to a team as either a player or a coach.
Athleteid and Teamid are foreign keys referencing Athlete and Team tables respectively.
The primary key is composite consisting both Athleteid and Teamid.
7)Plays(Teamid: VARCHAR(50) [PK] [FK to Team.Teamid], Sportid: VARCHAR(50) [PK] [FK to Sport.Sportid], Position: INT)
Plays is a Many to Many relation consisting of Sport and Team, this means a team can be part of multiple sports and a sport can have multiple teams. One important point to note is that Position attribute is a relational attribute for Plays. This attribute
Sportid and Teamid are foreign keys referencing Sport and Team tables respectively.
The primary key is composite consisting both Sportid and Teamid.

Final relational schema after normalisation:

Assumption/details to be known of:

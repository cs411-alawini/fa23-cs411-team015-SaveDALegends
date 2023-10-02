# The UML for our schema is: 
![Alt text](images/UML.png)


# Description of Relationships in UML
There are three relationships Belongs, Plays and PlaysFor
1) Belongs is a many to many relationship and it indicates an Athlete can belong to one or more teams and similarly a Team can have one or more Athletes. An athlete can belong to a team either as a Coach or a Player this is determined by the Role relationship attribute which is specific to this relationship.

2) Plays is a many to many relationship and it indicates a Team can play one or more Sports and similarly a Sport can be played by One or more Teams. The position won for a Team in a given Sport can be determined by the Relationship attribute Position.

3) PlaysFor is a many to one relationship and it indiactes a Team can play for only one country and a Country can have multiple Teams.

# Converting UML to relational schema yields the following:

1) User(Userid: VARCHAR(20) [PK], Name: VARCHAR(255), EmailAddress: VARCHAR(255), Password: VARCHAR(255), Phoneno: VARCHAR(15))

In the above Relation, the FDs are as follows:
Userid-> Name, EmailAddress, Password, Phoneno
EmailAddress-> Name, Userid, Password, Phoneno
Phoneno-> Name, EmailAddress, Password, Userid
The candidate keys are Userid, EmailAddress and Phoneno. Hence for all the FDs the 
L.H.S is a superkey and thus User relation is in BCNF.
So, It Satisfies both 3NF & BCNF.
No need of normalisation it already exists in BCNF & 3NF.

2) Athlete(Athleteid: VARCHAR(20) [PK], Name: VARCHAR(255), Gender: ENUM)

The FDs are as follows:
Athleteid->Name, Gender
The candidate key is only Athleteid. Hence for all the FDs the L.H.S is a superkey and thus Athlete relation is in BCNF.
So, It Satisfies both 3NF & BCNF.
No need of normalisation it already exists in BCNF & 3NF.

3) Sport(Sportid: VARCHAR(50) [PK], Sportname: VARCHAR(50), Category: VARCHAR(50))

The FDs are as follows:
Sportid->Sportname, Category
The candidate key is only Sportid. Hence for all the FDs the L.H.S is a superkey and thus Sport relation is in BCNF.
So, It Satisfies both 3NF & BCNF.
No need of normalisation it already exists in BCNF & 3NF.

4) Country (Countryname: VARCHAR(20) [PK])
It has only one attribute and it satisfies both BCNF & 3NF.

5) Team(Teamid: VARCHAR(50) [PK], TeamName: VARCHAR(50), Countryname: VARCHAR(20) [FK to Country.Countryname])
The attribure Countryname is added to the Team relation as foreign key referencing Countryname attribute in Country Relation, because Team and Country are part of a Many to One Relationship named "Playsfor", and hence Team can Play for only one country.

The FDs are as follows:
Teamid->TeamName, Countryname
The candidate key is only teamid. Hence for all the FDs the L.H.S is a superkey and thus Team relation is in BCNF.
So, It Satisfies both 3NF & BCNF.
No need of normalisation it already exists in BCNF & 3NF.

*6) Belongs(Athleteid: VARCHAR(20) [FK to Athlete.Athleteid], Teamid: VARCHAR(50) [FK to Team.Teamid], Role: ENUM, [PK] (Athleteid, Teamid))
Belongs is a Many to Many relationship consisting of Athlete and Team, this means an athlete can be part of multiple teams and a team can have multiple athletes. One important point to note is that Role attribute is a relational attribute for Belongs.
It can have two values either player or a coach, which means an athlete can belong to a team as either a player or a coach.
Athleteid and Teamid are foreign keys referencing Athlete and Team tables respectively.
The primary key is composite consisting both Athleteid and Teamid.

The FDs are as follows:
Athleteid->Role
Candidate key is (Athleteid,Teamid)

For the above FD Athleteid is not a superkey hence this violates BCNF
We also see that the RHS which is Role is not part of candidate key hence this violates 3NF.
So to convert this into BCNF
We find the closure of Athleteid which in this case is only Athleteid and Role

So we split the relation into following:
Belongs(Athleteid: VARCHAR(20) [FK to Athlete.Athleteid], Teamid: VARCHAR(50) [FK to Team.Teamid], [PK] (Athleteid, Teamid)) 
and 
Roles(Athleteid: VARCHAR(20) [PK] [FK to Athlete.Athleteid], Role:ENUM)

Now after Normalisation the new relations are as follows:

a) Belongs(Athleteid: VARCHAR(20) [FK to Athlete.Athleteid], Teamid: VARCHAR(50) [FK to Team.Teamid], [PK] (Athleteid, Teamid))
For this there are no FDs so this relation is in BCNF and hence satisfies both 3NF & BCNF.

b) Roles(Athleteid: VARCHAR(20) [PK] [FK to Athlete.Athleteid], Role:ENUM)
The FDs are:
Athleteid->Role
The candidate key is Athleteid and for the given FD Athleteid is a superkey so this relation is in BCNF and hence satisfies both BCNF & 3NF.

In the above scenario, we have only one FD which can be preserved even after splitting into BCNF, hence we are not losing any FDs while splitting into BCNF and also even if we choose 3NF we will get the same relations as BCNF. So, since splitting into BCNF is not leading to any loss of FDs and splitting into 3NF is not leading to added redundancies we can choose either of that as there is no difference. We go ahead and chosen the higher form which is BCNF.


*7) Plays(Teamid: VARCHAR(50) [FK to Team.Teamid], Sportid: VARCHAR(50) [FK to Sport.Sportid], Position: INT, [PK] (Teamid, Sportid))
Plays is a Many to Many relationship consisting of Sport and Team, this means a team can be part of multiple sports and a sport can have multiple teams. One important point to note is that Position attribute is a relational attribute for Plays. The attributes
Sportid and Teamid are foreign keys referencing Sport and Team tables respectively.
The primary key is composite consisting both Sportid and Teamid.

The FDs are as follows:
Teamid, Sportid -> Position
The candidate key is (Sportid,Teamid) and for the given FD the L.H.S is a superkey so this relation is in BCNF. So, It Satisfies both 3NF & BCNF.
No need of normalisation it already exists in BCNF & 3NF.


# Final relational schema:

1) User(Userid: VARCHAR(20) [PK], Name: VARCHAR(255), EmailAddress: VARCHAR(255), Password: VARCHAR(255), Phoneno: VARCHAR(15))

2) Athlete(Athleteid: VARCHAR(20) [PK], Name: VARCHAR(255), Gender: ENUM)

3) Sport(Sportid: VARCHAR(50) [PK], Sportname: VARCHAR(50), Category: VARCHAR(50))

4) Country(Countryname: VARCHAR(20) [PK])

5) Team(Teamid: VARCHAR(50) [PK], TeamName: VARCHAR(50), Countryname: VARCHAR(20) [FK to Country.Countryname])

*6) Belongs(Athleteid: VARCHAR(20) [FK to Athlete.Athleteid], Teamid: VARCHAR(50) [FK to Team.Teamid], [PK] (Athleteid, Teamid))

7) Roles(Athleteid: VARCHAR(20) [PK] [FK to Athlete.Athleteid], Role:ENUM)

*8) Plays(Teamid: VARCHAR(50) [FK to Team.Teamid], Sportid: VARCHAR(50) [FK to Sport.Sportid], Position: INT, [PK] (Teamid, Sportid))

# Assumption/details to be known of:
1) Athlete can either be a coach or a player this is determined by the role attribute which belongs to relation "Belongs"

2) All participations from team only no direct participation from Athlete in any sport

3) A team should participate in at least one sport and should contain atleast one player

4) "Plays" relation has an attribute known as position which indicates the rank/position won for a specific pair of <team,sport>

5) All the medals(position 1 or 2 or 3) are given to a team only, which in turn consists of athletes

6) If a team wins a medal(position 1 or 2 or 3) it means that all the athletes in the team who are players can win the medal

7) A user should have unique email, userid and phoneno and thus are mandatory
 
8) Country table contains only the countries that are part of Olympics



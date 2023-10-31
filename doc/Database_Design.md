# Database Implementation

We implemented teh database locally using MySQL workbench and integrated with VisualStudioCode.

The database connection details screenshot is as follows:
![Alt text](images/dbms_conn.png)

# DDL Commands

## Athlete
create table Athlete(Athleteid VARCHAR(20) Primary KEY, Name VARCHAR(255), Gender ENUM('Male', 'Female'));

## Sport
create table Sport(Sportid VARCHAR(50) Primary Key, Sportname VARCHAR(50), Category VARCHAR(50));

## Country
create table Country(Countryname VARCHAR(255) Primary Key,
NationalSport VARCHAR(50));

## Team
create table Team(
Teamid VARCHAR(50) Primary key,
TeamName VARCHAR(50),
Countryname VARCHAR(255),
Foreign Key (Countryname) references Country (Countryname));

## Belongs
create table Belongs(
Athleteid VARCHAR(20),
Teamid VARCHAR(50),
Foreign Key (Athleteid) references Athlete (Athleteid),
Foreign Key (Teamid) references Team (Teamid),
Primary Key (Athleteid, Teamid));

## Roles
create table Roles(
Athleteid VARCHAR(20),
Role ENUM('Player', 'Coach'),
Foreign Key (Athleteid) references Athlete (Athleteid),
Primary Key (Athleteid));

## Plays
create table Plays(
Teamid VARCHAR(20),
Sportid VARCHAR(50),
Position INT,
Foreign Key (Teamid) references Team (Teamid),
Foreign Key (Sportid) references Sport (Sportid),
Primary Key (Teamid, Sportid));

# Number of Entries in each created table
## Athlete
select count(*) as athlete_count from athlete;
![Alt text](images/athlete_cnt.png)

## Sport
select count(*) as sport_count from sport;
![Alt text](images/sport_cnt.png)

## Country
select count(*) as country_count from country;
![Alt text](images/country_cnt.png)

## Team
select count(*) as team_count from team;
![Alt text](images/team_cnt.png)

## Belongs
select count(*) as belongs_count from belongs;
![Alt text](images/belongs_cnt.png)

## Roles
select count(*) as roles_count from roles;
![Alt text](images/roles_cnt.png)

## Plays
select count(*) as plays_count from plays;
![Alt text](images/plays_cnt.png)

# Advanced Queries

## Query 1
List top 15 countries in olympics based on medals count

### Query:
select Countryname, count(teamid) as total_medals
from plays natural join team 
where position < 4
group BY Countryname
order by total_medals DESC
LIMIT 15;

## Query 1 Ouput 
The output is limited to 15 rows
![Alt text](images/q1_op.png)

## Query 2
For each sport find the country with gold, silver & bronze and no of countries contested
### Query
select * from
(select Sportname, count(DISTINCT(Countryname)) as No_of_Countries_Participated
FROM team natural join plays natural join sport
group BY Sportid) as Num_Partcipants
natural join
(select Sportname, Countryname as Gold_Medal_Winner
from Sport natural join Plays natural join team
where position = 1) as Gold
natural join
(select Sportname, Countryname as Silver_Medal_Winner
from Sport natural join Plays natural join team
where position = 2) as Silver
natural join
(select Sportname, Countryname as Bronze_Medal_Winner
from Sport natural join Plays natural join team
where position = 3) as Bronze
LIMIT 15;
## Query 2 Ouput
We limit the ouput to 15 entries
![Alt text](images/q2_op.png)

# Indexing
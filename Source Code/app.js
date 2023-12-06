const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const port = 3000;
let userid_for_like = "";
// MySQL Connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'olympics'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL as id ' + connection.threadId);
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    // Replace the following with your actual login logic
    const query = 'SELECT * FROM User WHERE EmailAddress = ? AND Password = ?';
    connection.query(query, [email, password], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            // Successful login
            userid_for_like = results[0].UserID;
            res.redirect('/medals'); // Redirect to the medals page or any other page
        } else {
            // Invalid credentials
            res.send('Invalid email or password. <a href="/login">Go back to login page</a>');
        }
    });
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'signup.html'));
});

app.post('/signup', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const phone = req.body.phone;

    // Check if passwords match
    if (password !== confirmPassword) {
        return res.send('Passwords do not match. <a href="/signup">Go back to signup page</a>');
    }

    // Generate a unique random string for UserID
    const userId = generateUserId();

    // Check if email already exists in the User table
    const checkEmailQuery = 'SELECT * FROM User WHERE EmailAddress = ?';
    connection.query(checkEmailQuery, [email], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            return res.send('Email address is already in use. <a href="/signup">Go back to signup page</a>');
        }

        // If email is not in use, insert the user into the User table
        
        const insertUserQuery = 'INSERT INTO User (UserID, Name, EmailAddress, Password, Phoneno) VALUES (?, ?, ?, ?, ?)';
        connection.query(insertUserQuery, [userId, name, email, password, phone], (err, results) => {
            if (err) throw err;

            res.send('User registered successfully! <a href="/login">Go to login page</a>');
        });
    });
});

// Route to handle the query and render the results
app.get('/medals', (req, res) => {
    // Your SQL query
    const query = `
        SELECT countryname, IFNULL(total_medals, 0) AS total_medals, IFNULL(total_players, 0) AS total_players


FROM
    (SELECT Countryname, COUNT(teamid) AS total_medals
        FROM plays
        NATURAL JOIN team
        WHERE position < 4
        GROUP BY Countryname) AS Medal_cnt
        NATURAL JOIN
    (SELECT countryname, COUNT(athleteid) AS total_players
        FROM Team
        NATURAL JOIN belongs
        NATURAL JOIN Roles
        WHERE role = "Player"
        GROUP BY countryname) AS Player_cnt

        right join

        (select countryname from country) as country_list using(countryname)
        order by total_medals desc
        ;
`;
    // Execute the query
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).send('Error executing query. Please try again.');
        }

        // Render the results in an HTML page
        res.render('medals', { results });
    });
});




// Set up the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
// app.js
app.get('/country_sport/:countryname', (req, res) => {
    const countryname = req.params.countryname;

    // Your SQL query
    const query = `
        (select countryname, sportname, teamname, "Gold" as Medal from country natural join team 
        natural join plays natural join sport where countryname=? and position=1)
        UNION
        (select countryname, sportname, teamname, "Silver" as Medal from country natural join team 
        natural join plays natural join sport where countryname=? and position=2)
        UNION
        (select countryname, sportname, teamname, "Bronze" as Medal from country natural join team 
        natural join plays natural join sport where countryname=? and position=3)
        UNION
        (select countryname, sportname, teamname, concat(position, "th Position") as Medal from country natural join team 
        natural join plays natural join sport where countryname=? and position>3);
    `;

    // Execute the query
    connection.query(query, [countryname, countryname, countryname, countryname], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).send('Error executing query. Please try again.');
        }

        // Render the results in the country_sport.ejs page
        res.render('country_sport', { results, countryname });
    });
});

app.get('/team-details/:teamname', (req, res) => {
    // Extract team name from query parameters
    const teamname = req.params.teamname;
    //console.log(teamname);
    // Query to fetch details for the specific team
    const query = `
        SELECT Athleteid, Name, Gender, Role, Sportid, Sportname
        FROM athlete
        NATURAL JOIN belongs
        NATURAL JOIN team
        NATURAL JOIN roles
        NATURAL JOIN plays
        NATURAL JOIN sport
        WHERE TeamName = ?;
    `;
    
    // Execute the query
    connection.query(query, [teamname], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).send('Error executing query. Please try again.');
        }
        //console.log(results);
        // Render the team-details page with the results
        
        res.render('team-details', { teamname, results });

    });
});


app.get('/search-by-sport', (req, res) => {
    // Add logic here to retrieve data for the search_by_sport page
    const results = []; // Replace with your actual data

    // Render the search_by_sport page
    res.render('search_by_sport.ejs', { results });
});

app.get('/search-by-player', (req, res) => {
    // Your SQL query
    const query = `
    select name,gender,role,teamname,countryname from
    athlete natural join roles natural join team natural join belongs;
`;
    // Execute the query
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).send('Error executing query. Please try again.');
        }

        // Render the results in an HTML page
        res.render('search_by_player', { results });
    });
});

app.get('/sport_details', (req, res) => {
    const query = `
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
where position = 3) as Bronze;
    `;

    // Execute the query
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).send('Error executing query. Please try again.');
        }
        res.render('sport_details', { results });

    });
});


app.get('/search-results', (req, res) => {
    // Extract the search query from the URL parameters
    const searchQuery = req.query.query;

    // Construct the SQL query
    const query = 'SELECT * FROM (SELECT Sportname, count(DISTINCT(Countryname)) as No_of_Countries_Participated FROM team NATURAL JOIN plays NATURAL JOIN sport WHERE Sportname LIKE ? GROUP BY Sportid) as Num_Partcipants NATURAL JOIN (SELECT Sportname, Countryname as Gold_Medal_Winner FROM Sport NATURAL JOIN Plays NATURAL JOIN team WHERE position = 1) as Gold NATURAL JOIN (SELECT Sportname, Countryname as Silver_Medal_Winner FROM Sport NATURAL JOIN Plays NATURAL JOIN team WHERE position = 2) as Silver NATURAL JOIN (SELECT Sportname, Countryname as Bronze_Medal_Winner FROM Sport NATURAL JOIN Plays NATURAL JOIN team WHERE position = 3) as Bronze';

// Execute the query with the search query as a parameter
    connection.query(query, [`%${searchQuery}%`], (err, results) => {
    if (err) {
        console.error('Error executing query:', err);
        return res.status(500).send('Error executing query. Please try again.');
    }

    // Render the search results in an HTML page
    res.render('search_results', { results });
});
});

// Add this at the end of your app.js file

app.get('/participated_country', (req, res) => {
    const sportname = req.query.sportname;
    //console.log(sportname);
    // Your SQL query to fetch details for the participated countries
    const query = `
        SELECT countryname, teamname, position
        FROM team natural join plays natural join sport
        WHERE sportname = ?
        ORDER BY position;
    `;

    // Execute the query
    connection.query(query, [sportname], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).send('Error executing query. Please try again.');
        }
       
        // Render the participated_country.ejs page with the results
        res.render('participated_country', { results });
    });
});

app.get('/update-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'update_password.html'));
});

// Route for handling the update password form submission
app.post('/update-password', (req, res) => {
    const email = req.body.email;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    const confirmNewPassword = req.body.confirmNewPassword;

    // Check if new password and confirm new password match
    if (newPassword !== confirmNewPassword) {
        return res.send('New password and confirm new password do not match. <a href="/update-password">Go back</a>');
    }

    // Execute the SQL query to update the password
    const updatePasswordQuery = 'UPDATE User SET Password = ? WHERE EmailAddress = ? AND Password = ?';
    connection.query(updatePasswordQuery, [newPassword, email, oldPassword], (err, results) => {
        if (err) {
            console.error('Error updating password:', err);
            return res.status(500).send('Error updating password. Please try again.');
        }

        // Check if the update was successful
        if (results.affectedRows > 0) {
            res.send('Password updated successfully! <a href="/login">Go to login page</a>');
        } else {
            res.send('Invalid email or old password. <a href="/update-password">Go back</a>');
        }
    });
});

// Define a route for the liked_country page
app.get('/liked_country', (req, res) => {
    const userId = userid_for_like;
    // Your SQL query to fetch liked countries for the specified user
    const query = `
        SELECT countryname
        FROM LikeCountry
        where UserID=?;
    `;

    // Execute the query
    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).send('Error executing query. Please try again.');
        }

        // Render the liked_country.ejs page with the results
        res.render('liked_country', { results });
    });
});

// Add this route to your existing app.js
app.get('/all_countries', (req, res) => {
    // Your SQL query to fetch all countries
    const userId=userid_for_like;
    const query = 'SELECT countryname FROM Country WHERE countryname NOT IN (SELECT countryname FROM LikeCountry WHERE UserID = ?);';

    // Execute the query
    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).send('Error executing query. Please try again.');
        }
        //console.log(results);
        // Render the all_countries.ejs page with the results
        res.render('all_countries', { results });
    });
});

// Add this route to handle the POST request for liking a country
app.post('/like_country', (req, res) => {
    const userId = userid_for_like;
    const countryname = req.body.countryname;

    // Your SQL query to insert the liked country for the specified user
    const query = 'INSERT INTO LikeCountry (UserID, countryname) VALUES (?, ?)';

    // Execute the query
    connection.query(query, [userId, countryname], (err, results) => {
        if (err) {
            console.error('Adding More than 5 Liked Countries not allowed: ', err);
            return res.status(500).send('Adding More than 5 Liked Countries not allowed!');
        }

        // Redirect back to the all_countries page or any other desired page
        res.redirect('/all_countries');
    });
});


app.post('/like_sport', (req, res) => {
    const userId = userid_for_like;
    const sportid = req.body.sportid;

    // Your SQL query to insert the liked country for the specified user
    const query = 'INSERT INTO LikeSport (UserID,Sportid ) VALUES (?, ?)';

    // Execute the query
    connection.query(query, [userId, sportid], (err, results) => {
        if (err) {
            console.error('Adding More than 5 Liked Sports not allowed: ', err);
            return res.status(500).send('Adding More than 5 Liked Sports not allowed!');
        }

        // Redirect back to the all_countries page or any other desired page
        res.redirect('/all_sports');
    });
});

// Add this route at the end of your app.js file
app.post('/remove_country', (req, res) => {
    const userId = userid_for_like;
    const countryname = req.body.countryname;
   // console.log(userId,countryname);
    // Your SQL query to remove the liked country for the specified user
    const removeQuery = `
        DELETE FROM LikeCountry
        WHERE UserID = ? AND countryname = ?;
    `;

    // Execute the query
    connection.query(removeQuery, [userId, countryname], (err, results) => {
        if (err) {
            console.error('Error removing country:', err);
            return res.status(500).send('Error removing country. Please try again.');
        }

        // Redirect back to the liked_country page after removal
        res.redirect('/liked_country');
    });
});


app.post('/remove_sport', (req, res) => {
    const userId = userid_for_like;
    const sportid = req.body.sportid;
   // console.log(userId, sportid);
    // Your SQL query to remove the liked country for the specified user
    const removeQuery = `
        DELETE FROM LikeSport
        WHERE UserID = ? AND sportid = ?;
    `;

    // Execute the query
    connection.query(removeQuery, [userId, sportid], (err, results) => {
        if (err) {
            console.error('Error removing country:', err);
            return res.status(500).send('Error removing country. Please try again.');
        }

        // Redirect back to the liked_country page after removal
        res.redirect('/liked_sport');
    });
});

app.get('/all_sports', (req, res) => {
    // Your SQL query to fetch all countries
    const userId = userid_for_like;
    const query = 'SELECT sportid,sportname FROM Sport WHERE sportid NOT IN (SELECT sportid FROM LikeSport WHERE UserID = ?);';

    // Execute the query
    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).send('Error executing query. Please try again.');
        }
        //console.log(results);
        // Render the all_countries.ejs page with the results
        res.render('all_sports', { results });
    });
});


app.get('/liked_sport', (req, res) => {
    const userId = userid_for_like;
    // Your SQL query to fetch liked countries for the specified user
    const query = `
        SELECT sportid,sportname
        FROM LikeSport natural join Sport
        where UserID=?;
    `;
    // Execute the query
    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).send('Error executing query. Please try again.');
        }
        //console.log(results);
        // Render the liked_country.ejs page with the results
        res.render('liked_sport', { results });
    });
});



app.get('/stats', (req, res) => {
    //const userId = userid_for_like;
    // Your SQL query to fetch liked countries for the specified user
    const query = `
       call DisplayCountryStatistics();
    `;
    // Execute the query
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).send('Error executing query. Please try again.');
        }
        //console.log(results);
        // Render the liked_country.ejs page with the results
        res.render('stats', { results});
    });
});

function generateUserId() {
    // Generate a random string (you can use a more secure method for production)
    return  Math.random().toString(36).substring(2, 12);
    
}

app.listen(port, () => {
    console.log(`Server listening on port ${ port } `);
});

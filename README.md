
# Archived

This was a project for college. I was in charge of the Backend, Architecture and Frontend of the Admin Dashboard and the scripts to hanlde map (OSM) on the client side.


The app was a Venue discovery site based on restaurants, accommodations, transport and places for the Sucre state, Venezuela but with an open architecture to allow it to grow to cover more places.

Users could register, comment, add to favorite, multilanguage, Admin Dashboard and rate places/venues.

This was implemented with:

- mongoDB
- Nodejs 8.10

I learned
- Deeply the nodejs/express ecosystem
- mongodb/mongoose
- Design patterns (I implemented Factory for POI creation since they have similar structure and for the User class, and also the Strategy Pattern based on Passport.js), 
- Classes syntax for javascript (by that time it was cool)

To run this project

- just use nvm, to set the old version of Node 8.10
- and then `npm i`
- `npm start`

This will take the port 4000 for the API and the default port (27017) for the MongoDB database, which is called `softour`.
By default it will push some data to the database for demo purposes.
A few cities of Sucre state, Venezuela and a super admin user `luistena@softour.com` with the non safe for production password `secret`.

To change that you could check the `configuracion/index.js` file

This has some deprecated features, that I allow it to have it to do a youtube demo for this project `https://youtu.be/cBGeJUG1bu8`
I mark them with a "warning" label in the code, you might want to fix/check that in case you want to continue developing this project.

//read files
const fs = require("fs");

//configure environment variables
require("dotenv").config();

//configure stripe
const stripe = require("stripe")(process.env.SECRET_KEY);

//require express and make an app
const express = require("express");
const app = express();

//set the view engine to ejs
app.set("view engine", "ejs");

//set the directory for the static files
app.use(express.static("public"));

//make express parse json
app.use(express.json());

//make a get request for the store
app.get("/store", async (req, res) => {
	//read the items from the json file on the server
	fs.readFile("public/items.json", function(err, data) {
		//check for an error
		if (err) {
			//send the server error as the response
			console.log(err);
			res.status(500).end();
		} else {
			//render the store ejs for the user to see
			res.render("store.ejs", {items: JSON.parse(data), stripePubKey: process.env.PUBLIC_KEY});
		}
	});
});

//make a post request for the store
app.post("/purchase", (req, res) => {
	//read the items from the json file on the server
	fs.readFile("public/items.json", function(err, data) {
		if (err) {
			console.log(err);
			res.status(500).end();
		} else {
			console.log("purchase made on site");
			const itemsJson = JSON.parse(data);
			const itemsArray = itemsJson.music.concat(itemsJson.merch);
			var total = 0;

			req.body.items.forEach((item) => {
				var itemJson = itemsArray.find((i) => {
					return i.id == item.id
				});

				total += itemJson.price * item.quantity;
			});

			console.log(req.body.stripeTokenId);


			stripe.charges.create({
				amount: total,
				source: req.body.stripeTokenId,
				currency: 'usd'
			}).then(() => {
				console.log("Charge Successful");
				res.json({message: "Successful Purchase"});
			}).catch((err) => {
				console.log("Charge Failed");
				console.log(err);
				res.status(500).end();
			});
		}
	});
});


//listen on port 3000
app.listen(3000);

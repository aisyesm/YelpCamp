var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");

//INDEX route
router.get("/", (req, res) => {
	Campground.find({}, (err, allCampgrounds) => {
		if(err){
			console.log(err);
		} else{
			res.render("campgrounds/index", {campgrounds: allCampgrounds}); 
		}
	});
});

//CREATE route
router.post("/", middleware.isLoggedIn, (req, res) => {
	var name = req.body.name;
	var image = req.body.image;
	var price = req.body.price;
	var description = req.body.description;
	var author = {
		id: req.user._id,
		username: req.user.username
	};
	var newCampground = {name: name, price: price, image: image, author: author, description: description};
	
	Campground.create(newCampground, (err, campground) => {
		if(err){
			console.log(err);
		} else{ 
			res.redirect("/campgrounds");
		}
	});
});

//NEW route
router.get("/new", middleware.isLoggedIn, (req, res) => {
	res.render("campgrounds/new");
});

//SHOW route
router.get("/:id", (req, res) => {
	Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => {
		if(err){
			console.log(err);
		} else {
			console.log(foundCampground);
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
});

//EDIT Route
router.get("/:id/edit", middleware.checkCampgroundOwnership, (req, res) => {
	Campground.findById(req.params.id, (err, foundCampground) => {
		res.render("campgrounds/edit", {campground: foundCampground});
	});
	
});

//UPDATE Route
router.put("/:id", middleware.checkCampgroundOwnership, (req, res) => {
	// find and update the correct campground
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground) => {
		if(err){
			res.redirect("/campgrounds");
		} else {
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

//DESTROY Route
router.delete("/:id", middleware.checkCampgroundOwnership, (req, res) => {
	Campground.findByIdAndRemove(req.params.id, (err) => {
		if(err){
			res.redirect("/campgrounds");
		} else{
			req.flash("success", "Campground deleted");
			res.redirect("/campgrounds");
		}
	});
});

module.exports = router;

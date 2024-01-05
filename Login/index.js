var express = require('express');
var mongoose = require('mongoose');
var path = require('path')

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('views', './');
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname)))

mongoose.connect("mongodb://127.0.0.1:27017/ecourt");
var db = mongoose.connection;


app.get("/", (req, res) => {
  let errorMessage = '';
  if (req.query.error === 'invalid_credentials') {
      errorMessage = 'Invalid username or password.';
  } else if (req.query.error === 'server_error') {
      errorMessage = 'An error occurred. Please try again later.';
  }
  res.render("index", { dols: errorMessage });
});


app.post("/login", async (req, res) => {
    var mob = req.body.mobile;
    var pas = req.body.pas;

    try {
        var user = await db.collection("users").findOne({ mobile: mob });
        if (user && user.password == pas) {
            res.send('omk');
        } else {
            // Redirect back to the login page with a query parameter
            res.redirect('/?error=invalid_credentials');
        }
    } catch (error) {
        res.redirect('/?error=server_error');
    }
});



app.listen(3000, ()=>{
  console.log("Server started on 3000");
})
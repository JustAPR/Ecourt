var express = require("express");
var mongoose = require("mongoose");
var path = require("path");
const multer = require('multer');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "Login"));
app.use(express.static("public"));
const uploadDirectory = path.join(__dirname, 'uploads');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, uploadDirectory);
  },
  filename: function (req, file, cb) {
      cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage })
;
mongoose.connect(
  "mongodb+srv://prajayr1306:12qwaszxAPR@cluster0.lu2mazv.mongodb.net/ecourt?retryWrites=true&w=majority"
);
var db = mongoose.connection;

app.get("/x", (req, res) => {
  let errorMessage = "";
  let successMessage = "";
  let showSignup = false;

  if (req.query.error === "invalid_credentials") {
    errorMessage = "Invalid username or password.";
  } else if (req.query.error === "server_error") {
    errorMessage = "An error occurred. Please try again later.";
  }

  if (req.query.signup === "failure") {
    errorMessage = "User with the given username or email already exists.";
    res.render("login", { dols: "", mol: errorMessage, showSignup: true });
    showSignup = true;
  } else if (req.query.signup === "success") {
    successMessage = "Signup successful. Please login.";
    res.render("login", {
      dols: successMessage,
      mol: errorMessage,
      showSignup: showSignup,
    });
  }
  res.render("login", {
    dols: errorMessage,
    mol: successMessage,
    showSignup: showSignup,
  });
});
app.get("", (req, res) => {
  res.render("home");
});
app.post("/login", async (req, res) => {
  var mob = req.body.username;
  var pas = req.body.password;
  try {
    var user = await db.collection("users").findOne({ username: mob });
    if (user && user.password == pas) {
      const welcomeMessages = {
        1: "USER",
        2: "Lawyer",
        3: "Court/Judge",
        0: "Admin",
      };

      const userType = user.type;
      const welcomeMessage = welcomeMessages[userType] || "Unknown User Type";
      if (userType == "1") {
        res.sendFile(path.join(__dirname, './public/client.html'))
      }
      if (userType == "2") {
        res.redirect("/ad.html");
      }
      if (userType == "3") {
        res.redirect("/test.html");
      }
    } else {
      res.redirect("/x?error=invalid_credentials");
    }
  } catch (error) {
    res.redirect("/x?error=server_error");
  }
});
app.post("/signup", async (req, res) => {
  let errorMessage = "";
  const tys = {
    user: "1",
    lawyer: "2",
    Court: "3",
    Judge: "3",
    Admin: "0",
  };
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const userType = tys[req.body.userType];
  const t = tys[req.body.userType];
  try {
    const existingUser = await db
      .collection("users")
      .findOne({ $or: [{ username: username }, { email: email }] });

    if (existingUser) {
      res.redirect("/x?signup=failure");
      // res.render('login', { dols:'',mol: 'User with the given username or email already exists.',showSignup: true  });
    } else {
      await db.collection("users").insertOne({
        username: username,
        email: email,
        password: password,
        type: userType,
      });
      res.redirect("/x?signup=success");
      // res.render('login', { dols: 'Signup successful. Please login.',mol:'',showSignup: false  });
    }
  } catch (error) {
    console.error("Signup error:", error);
    res.render("login", {
      dols: "",
      mol: "An error occurred during signup. Please try again.",
    });
  }
});
app.post('/upload', upload.single('uploadedFile'), (req, res) => {
  res.redirect('/client.html');
});
app.get('/files', (req, res) => {
  fs.readdir(uploadDirectory, (err, files) => {
      if (err) {
          res.status(500).send('Error reading files');
      } else {
          res.json(files);
      }
  });
});
app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(uploadDirectory, filename);
  res.download(filepath);
});
app.listen(3001, () => {
  console.log("Server started on 3000");
});

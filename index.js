var sqlite3 = require("sqlite3").verbose();
var express = require("express");
var http = require("http");
var bodyParser = require("body-parser");
var app = express();
var cors = require("cors");
var server = http.createServer(app);
var db = new sqlite3.Database("./database/Product.db3");
var bcrypt = require("bcryptjs");
app.use(cors()); //
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
db.run("CREATE TABLE IF NOT EXISTS emp(id TEXT, name TEXT)");
server.listen(3000, function () {
  console.log("Server listening on port: 3000");
});

//============== LOGIN ===================================================
app.post("/register", function (req, res) {
  // สมัคร User
  // Register Login
  db.serialize(() => {
    db.all(
      "SELECT * FROM user_login where username = ? and password = ? ",
      [req.body.username, req.body.password],
      function (err, row) {
        if (err) {
          console.log(err);
        } else {
          if (row.length === 0) {
            db.run(
              "INSERT INTO user_login(name_n , surname_s , username , password) VALUES(?,?,?,?)",
              [
                req.body.name_n,
                req.body.surname_s,
                req.body.username,
                req.body.password,
              ],
              function (err) {
                if (err) {
                  return console.log(err.message);
                }
                console.log("Register Success : " + req.body.name_n);
                res.send("Register Success : " + req.body.name_n);
              }
            );
          } else {
            res.send({
              status: "error",
              message: "ตรวจสอบ Username หรือ Password",
            });
          }
        }
      }
    );
  });
});

app.post("/edit_user", function (req, res) {
  // แก้ไข User
  // Register Login
  db.serialize(() => {
    db.run(
      "UPDATE user_login SET name_n = ? , surname_s = ? , username = ?  , password = ?  where user_id = ? ",
      [
        req.body.name_n,
        req.body.surname_s,
        req.body.username,
        req.body.password,
        req.body.user_id,
      ],
      function (err) {
        if (err) {
          console.log(err);
        } else {
          res.send("User Edit Success");
        }
      }
    );
  });
});

//login
app.post("/Check_login", (req, res) => {
  db.serialize(() => {
    let username = req.body.username;
    let password = req.body.password;
    console.log(username);
    console.log(password);
    bcrypt.hash(username, 10, (err, tokentext) => {
      console.log(tokentext);
      db.all(
        "SELECT * FROM user_login where username = ? and password = ? ",
        [username, password],
        function (err, row) {
          if (err) {
            console.log(err);
          } else {
            if (row.length === 0) {
              res.send({
                status: "error",
                message: "ตรวจสอบ Username หรือ Password",
              });
            } else {
              res.send({
                status: "ok",
                message: "Logged in",
                accessToken: tokentext,
                name_n: row[0].name_n,
                surname_s: row[0].surname_s,
              });
            }
          }
        }
      );
    });
  });
});
//===============================================================
//ส่วนของประเภทสินค้า
app.post("/add_category", function (req, res) {
  // เพิ่มประเภทสินค้า
  db.serialize(() => {
    db.run(
      "INSERT INTO category_product(cat_name) VALUES(?)",
      [req.body.cat_name],
      function (err) {
        if (err) {
          return console.log(err.message);
        } else {
          console.log("Add Category Success : " + req.body.cat_name);
          res.send("Add Category Success : " + req.body.cat_name);
        }
      }
    );
  });
});

app.post("/edit_category", function (req, res) {
  // แก้ไขประเภทสินค้า
  db.serialize(() => {
    db.run(
      "UPDATE category_product SET cat_name = ?  where cat_id = ? ",
      [req.body.cat_name, req.body.cat_id],
      function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Edit Category Success : " + req.body.cat_name);
          res.send(
            "Edit Category Success : " +
              req.body.cat_name +
              "\nID : " +
              req.body.cat_id
          );
        }
      }
    );
  });
});

app.get("/delete_category/:cat_id", function (req, res) {
  // แก้ไขประเภทสินค้า
  db.serialize(() => {
    db.run(
      "DELETE FROM category_product  where cat_id = ? ",
      req.params.cat_id,
      function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Delect Category Success ID: " + req.params.cat_id);
          db.run(
            "DELETE FROM data_product where pro_id = ? ",
            req.params.cat_id,
            function (err) {
              if (err) {
                console.log(err);
              } else {
                console.log("Delect Category Success ID: " + req.params.cat_id);
                res.send("Delect Category Success ID: " + req.params.cat_id);
              }
            }
          );
        }
      }
    );
  });
});

app.get("/select_category/:cat_id", function (req, res) {
  //Show data
  db.serialize(() => {
    db.all("SELECT * FROM category_product where cat_id = ? ",req.params.cat_id, function (err, row) {
      if (err) {
        console.log(err);
      }
      res.send(row);
      console.log("Entry displayed successfully");
    });
  });
});

app.get("/select_category/", function (req, res) {
  //Show data
  db.serialize(() => {
    db.all("SELECT * FROM category_product", function (err, row) {
      if (err) {
        console.log(err);
      }
      res.send(row);
      console.log("Entry displayed successfully");
    });
  });
});
//=================================================================

//========= Product ===============================================
//ส่วนของสินค้า
app.post("/add_product", function (req, res) {
  // เพิ่มประเภทสินค้า
  db.serialize(() => {
    db.run(
      "INSERT INTO data_product(pro_name , pro_price , cat_id) VALUES(?,?,?)",
      [req.body.pro_name, req.body.pro_price, req.body.cat_id],
      function (err) {
        if (err) {
          return console.log(err.message);
        } else {
          console.log(
            "Add Product Success : " +
              req.body.pro_name +
              "\nราคา : " +
              req.body.pro_price
          );
          res.send(
            "Add Product Success : " +
              req.body.pro_name +
              "\nราคา : " +
              req.body.pro_price
          );
        }
      }
    );
  });
});

app.post("/edit_product", function (req, res) {
  // แก้ไขประเภทสินค้า
  db.serialize(() => {
    db.run(
      "UPDATE data_product SET pro_name = ? , pro_price = ? , cat_id = ?  where pro_id = ? ",
      [req.body.pro_name, req.body.pro_price, req.body.cat_id, req.body.pro_id],
      function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log(
            "Edit Product Success : " +
              req.body.pro_name +
              "\nราคา : " +
              req.body.pro_price
          );
          res.send(
            "Edit Product Success : " +
              req.body.pro_name +
              "\nราคา : " +
              req.body.pro_price
          );
        }
      }
    );
  });
});

app.get("/delete_product/:pro_id", function (req, res) {
  // แก้ไขประเภทสินค้า
  db.serialize(() => {
    db.run(
      "DELETE FROM data_product where pro_id = ? ",
      req.params.pro_id,
      function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Delect Category Success ID: " + req.params.pro_id);
          res.send("Delect Category Success ID: " + req.params.pro_id);
        }
      }
    );
  });
});

app.get("/select_product", function (req, res) {
  //Show data
  db.serialize(() => {
    db.all(
      "SELECT * FROM data_product as data_pro INNER JOIN category_product as cat_pro on ( data_pro.cat_id = cat_pro.cat_id)",
      function (err, row) {
        if (err) {
          console.log(err);
        }
        res.send(row);
        console.log("Entry displayed successfully");
      }
    );
  });
});
//=================================================================

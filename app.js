const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
// const date = require(__dirname + "/date.js");
const _ = require('lodash');


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todoDB",{useNewUrlParser: true},{ useUnifiedTopology: true });

const itemSchema = new mongoose.Schema({
  name : String
});


const Item/*model_name*/ = mongoose.model("Item"/*collection_name*/,itemSchema);

const item1 = new Item({
  name:"Welcome to the TODO list."
});

const item2 = new Item({
  name:"Hit the + button to add a new item."
});

const item3 = new Item({
  name:"<-- Hit this to remove an item."
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List",listSchema);




app.get("/",function(req, res){

  Item.find({},function(err,foundItems){

    if (foundItems.length === 0)
    {
      Item/*model_name*/.insertMany(defaultItems,function(err){
    if (err)
    {
      console.log(err);
    }
    else 
    {
      console.log("Success!");
    }
  });
      res.redirect("/");
    } else{

    res.render("list", {listTitle: "Today", newListItems:foundItems});
}
  })

});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);



  List.findOne({name: customListName},function(err, foundList){
    if(!err){
      if(!foundList){
          const list = new List({
          name: customListName,
          items: defaultItems
        });

  list.save();
  res.redirect("/" + customListName);

      }else {
        res.render("list", {listTitle:foundList.name,newListItems:foundList.items})
      }
    }
  })

});




app.post("/",function(req,res){
    const itemname = req.body.newItem;
    const listname = req.body.list;
    const item = new Item ({
      name: itemname
    });

    if( listname === "Today")
    {
      item.save();
      res.redirect("/");
    }
    else{
      List.findOne({name:listname},function(err,foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+ listname);
      });
    }

});

app.post("/delete",function(req,res){
  const rmid = req.body.checkbox;
  const listname = req.body.listname;

  if( listname === "Today")
  {
  Item.deleteOne({_id:rmid},function(err)
  {
    if (err)
      {console.log(err);}
    else {console.log("success in removing");
    res.redirect("/");}
  });
  }else{
    List.findOneAndUpdate({name:listname},{$pull:{items:{_id: rmid}}},function(err,foundList){
      if(!err)
      {
        res.redirect("/" + listname);
      }
    }) 
  }

});



app.get("/about", function(req,res){
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server at 3000 running.");
});
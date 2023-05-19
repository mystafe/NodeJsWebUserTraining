const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const dbUrl = 'mongodb+srv://AlohaUser01:AlohaUser01@cluster0.i74kayf.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(error => console.error('Failed to connect to MongoDB:', error));



/* WebUserSchema.pre('deleteOne', { document: true }, function (next) {
  const webUserId = this._id;
  Contact.deleteMany({ webUserId }, (err) => {
    if (err) {
      return next(err);
    }
    next();
  });
});  */

const app = express();
app.use(express.static('public'));

const methodOverride = require('method-override');
app.use(methodOverride('_method'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.render('main');
});

const webuserRoutes=require('./routes/webuserRoutes')
const contactRoutes=require('./routes/contactRoutes');

app.use(webuserRoutes)
app.use(contactRoutes);



 
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Welcome to webuser training Aloha User on port ${port}`);
});
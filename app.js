const express = require('express');
const mongoose = require('mongoose');

const path = require('path');


const dbUrl = 'mongodb+srv://AlohaUser01:AlohaUser01@cluster0.i74kayf.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(error => console.error('Failed to connect to MongoDB:', error));

const WebUserSchema = new mongoose.Schema({
  name: String,
  surname: String,
  email: String,
  address: String
});




// Pre-hook for deleteOne method


const WebUser = mongoose.model('WebUser', WebUserSchema);


const ContactSchema = new mongoose.Schema({
  title: String,
  message: String,
  webUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'WebUser' }
});


const Contact = mongoose.model('Contact', ContactSchema);

WebUserSchema.pre('deleteOne', { document: true }, function (next) {
  const webUserId = this._id;

  // Delete all contacts referencing this web user
  Contact.deleteMany({ webUserId }, (err) => {
    if (err) {
      return next(err);
    }
    next();
  });
}); 

const app = express();
app.use(express.static('public'));

const methodOverride = require('method-override');

// ... other app configurations ...

app.use(methodOverride('_method'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.render('main');
});


app.get('/webusers',(rq,rs)=>{

  WebUser.find()
  .then(users=> rs.render('users',{users}))
  .catch(e=>rs.status(404))

})

app.get('/contacts',(req,res)=>{
  Contact.find().populate('webUserId','name surname').exec()
  .then(cx=>{
      const contacts =cx.map(c=>{
        const {_id,message,title}=c;
        const name=c.webUserId?c.webUserId.name:'Unknown';
        const surname=c.webUserId?c.webUserId.surname:'User';
        return {_id,title,message,name,surname}        
      });
        res.render('contacts',{contacts});
    })
    .catch(er=>{
      res.status(404).json(er.message);
    })
})
app.get('/add-user',(req,res)=>{
  res.render('add-user')
})
app.get('/add-contact',(req,res)=>{

  WebUser.find().then(webusers=>
    {
      res.render('add-contact',{webusers})
    }
    )
})
app.get('/webuser', (req, res) => {
    WebUser.find()
      .then(webUsers => {
        res.json(webUsers);
      })
      .catch(error => {
        res.status(500).json({ error: 'Failed to retrieve web users' });
      });
  });
  
 app.get('/contact/',(rq,rs)=>{

    Contact.find()
    .populate('webUserId','name surname')
    .select('title message').exec()
   .then(contacts=> {
    const newContacts=contacts.map(contact=>{
      const fullname= contact.webUserId?contact.webUserId.name+' '+contact.webUserId.surname:'unknown user';
      const {_id,title,message}=contact;
      return {_id,title,message,fullname};
    })


    rs.json(newContacts);
   })
   .catch(err => {
        rs.status(500).json({ error: err.message+'Failed to retrieve contacts' });
      });
 });
 

 app.post('/webuser',(req,res)=>{
    const {name,surname,email='',address=''}=req.body;

//    const newWebuser=new WebUser(
  //      {name,surname,email,address});
    //newWebuser.save().then(x=>res.json(x))
    const user={name,surname,email,address};
    WebUser.create(user).then(result=>res.redirect('/webusers/'))

    .catch(error => {
        res.status(500).json({ error: 'Failed to save web user' });
      });
 })

 app.delete('/webuser/:id', (rq, rs) => {
  const id = rq.params.id;
  WebUser.findByIdAndDelete(id)
    .then(deleteduser => {
      if (!deleteduser)
        return rs.status(404).json('User is not found');
      rs.redirect('/webusers/'); // Add a trailing slash
    })
    .catch(err => {
      rs.status(500).json({ error: err.message + ' Failed to delete WebUser' });
    });
});



 app.post('/contact',(rq,rs)=>{

    const {title='',message='',webUserId}=rq.body;

    const NewContact=new Contact({
        title,
        message,
        webUserId
    })

    NewContact.save().then(contact => rs.redirect('/contacts/'))
    .catch(err=>{
        rs.status(500).json(err.message)
    })

 })
 app.delete(`/contact/:id`,(rq,rs)=>{ 
    const id=rq.params.id;
    Contact.findByIdAndDelete(id)
    .then(result=>{
        if(!result)
            return rs.status(404).json('Contact is not found');
        rs.redirect('/contacts');    
    })
    .catch(err => {
        rs.status(500).json({ error: err.message+' Failed to delete contact' });
      });
 })
 

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Welcome to webuser training Aloha User on port ${port}`);
});
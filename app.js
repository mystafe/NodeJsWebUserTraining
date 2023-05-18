//AlohaUser01
//AlohaUser01
const express = require('express');
const mongoose = require('mongoose');

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
const WebUser = mongoose.model('WebUser', WebUserSchema);

const ContactSchema = new mongoose.Schema({
  title: String,
  message: String,
  webUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'WebUser' }
});

const Contact = mongoose.model('Contact', ContactSchema);



const app = express();


app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, aloha!');
});

app.get('/webusers', (req, res) => {
    WebUser.find()
      .then(webUsers => {
        res.json(webUsers);
      })
      .catch(error => {
        res.status(500).json({ error: 'Failed to retrieve web users' });
      });
  });

 app.get('/contacts',(rq,rs)=>{
    Contact.find()
    .populate('webUserId','name surname')
    .select('title message').exec().
    then(contacts=> {  
             const contactNew=contacts.map(c=>({         
                title:c.title,
                message:c.message,
                //webuserFullname:c.webUserId.name+' '+ c.webUserId.surname   
                webusefullname:c.webUserId?.name

            }));
            return   contactNew;
        })
    .then(contactNew=> {rs.json(contactNew)})

    .catch(err => {
        rs.status(500).json({ error: err.message+'Failed to retrieve contacts' });
      });
 });
 

 app.post('/webusers',(req,res)=>{
    const {name,surname,email='',address=''}=req.body;
    const newWebuser=new WebUser(
        {name,surname,email,address});
    newWebuser.save().then(x=>res.json(x))
    .catch(error => {
        res.status(500).json({ error: 'Failed to save web user' });
      });
 })

 app.delete(`/webusers/:id`,(rq,rs)=>{
    const id=rq.params.id;
    WebUser.findByIdAndDelete(id)
    .then(deleteduser=>{
        if(!deleteduser)
            return rs.status(404).json('User is not found');
        rs.status(201).json({ deleteduser: 'user is deleted'});    
    })
    .catch(err => {
        rs.status(500).json({ error: err.message+' Failed to delete WebUser' });
      });
 })

  
 app.post('/contacts',(rq,rs)=>{

    const {title='',message='',webUserId}=rq.body;

    const NewContact=new Contact({
        title,
        message,
        webUserId
    })

    NewContact.save().then(contact => rs.json({'status':'Ok', ticket: contact.id}))
    .catch(err=>{
        rs.status(500).json(err.message)
    })

 })

 app.delete(`/contacts/:id`,(rq,rs)=>{
    
    const id=rq.params.id;
    Contact.findByIdAndDelete(id)
    .then(result=>{
        if(!result)
            return rs.status(404).json('Contact is not found');
        rs.status(201).json({ result: result.id+' is deleted'});    
    })
    .catch(err => {
        rs.status(500).json({ error: err.message+' Failed to delete WebUser' });
      });
 })
 

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Welcome to webuser training Aloha User on port ${port}`);
});
const express=require("express");
const app=express();
const router=express.Router();

const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    title: String,
    message: String,
    webUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'WebUser' }
  })

  

const Contact = mongoose.model('Contact', ContactSchema)
const WebUser=mongoose.model('WebUser')

router.get('/contacts',(req,res)=>{
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

  router.get('/contact/',(rq,rs)=>{
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
 

 router.get('/add-contact',(req,res)=>{
    const contact=new Contact;
    WebUser.find().then(webusers=>
      {
        res.render('add-contact',{webusers,contact})
      }
      )
  })
  router.get('/add-contact/:id',(req,res)=>{
    const contactId = req.params.id;
    Contact.findById(contactId).populate('webUserId','_id').select('title message').exec()
    .then(contact=>
      {
         console.log(contact);
        WebUser.find().then(webusers=>
          {
            res.render('add-contact',{webusers,contact})
          }
          )
      }
      )
      .catch(er=> res.status(400).json(er.message))});

  //64672fabf6b562e5bea4dab0

  router.put('/add-contact/:id',(req,res)=>{
    
    const contactId = req.params.id;
    const { title, message, webUserId } = req.body;
  
    const contact=Contact.findById(contactId);
    Contact.findByIdAndUpdate(contactId, { title, message, webUserId }, { new: true })
      .then(updatedContact => {
        if (!updatedContact) {
          return res.status(404).json({ error: 'Contact not found' });
        }
        res.json(updatedContact);
      })
      .catch(error => {
        res.status(500).json({ error: 'Failed to update contact' });
      });
  });
  

router.post('/contact',(rq,rs)=>{
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


 router.put('/contact/:id', (req, res) => {
  const contactId = req.params.id;
  const { title, message, webUserId } = req.body;

  Contact.findByIdAndUpdate(contactId, { title, message, webUserId }, { new: true })
    .then(updatedContact => {
      if (!updatedContact) {
        return res.status(404).json({ error: 'Contact not found' });
      }
      res.json(updatedContact);
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to update contact' });
    });
});




 router.delete(`/contact/:id`,(rq,rs)=>{ 
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
 router.use(app);
module.exports=router;
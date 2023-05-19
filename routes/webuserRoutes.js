const express=require('express');
const app=express();
const router=express.Router();
const mongoose=require('mongoose');

const WebUserSchema=new mongoose.Schema(
{
    name:String,
    surname:String,
    email:String,
    address:String
}
);

const WebUser=mongoose.model('WebUser',WebUserSchema);



router.get('/webusers',(rq,rs)=>{
    WebUser.find()
    .then(users=> rs.render('users',{users}))
    .catch(e=>rs.status(404))
  
  })
  
  
  router.get('/add-user',(req,res)=>{
    res.render('add-user')
  })
  
  
  router.get('/webuser', (req, res) => {
      WebUser.find()
        .then(webUsers => {
          res.json(webUsers);
        })
        .catch(error => {
          res.status(500).json({ error: 'Failed to retrieve web users' });
        });
    });
    
  
  
    router.post('/webuser',(req,res)=>{
      const {name,surname,email='',address=''}=req.body;
      const user={name,surname,email,address};
      WebUser.create(user).then(result=>res.redirect('/webusers/'))
      .catch(error => {
          res.status(500).json({ error: 'Failed to save web user' });
        });
   })
  
   router.put('/webuser/:id',(req,res)=>{
      const {name,surname,email,address}=req.body;
      const userid=req.params.id;
      WebUser.findByIdAndUpdate(userid, { name, surname, email, address }, { new: true })
      .then(updatedUser => {
        res.json(updatedUser);
      })
      .catch(error => {
        res.status(500).json({ error: 'Failed to update web user' });
      });
  });


  

  

   router.delete('/webuser/:id', (rq, rs) => {
    const id = rq.params.id;
    WebUser.findByIdAndDelete(id)
      .then(deleteduser => {
        if (!deleteduser)
          return rs.status(404).json('User is not found');
        rs.redirect('/webusers/'); 
      })
      .catch(err => {
        rs.status(500).json({ error: err.message + ' Failed to delete WebUser' });
      });
  });
  

app.use(router);
module.exports=router;
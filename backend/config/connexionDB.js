const mongoose = require(`mongoose`);
function connection (){
    mongoose.connect("mongodb://localhost:27017/Example")
    .then(()=> console.log(`connexion avec DB`))
    .catch(e => console.log(`erreur de connection :`+e))
}
module.exports=connection
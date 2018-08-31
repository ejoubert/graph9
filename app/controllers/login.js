import Controller from '@ember/controller';
import {inject as service} from '@ember/service';
import md5 from 'md5';


export default Controller.extend({
    router: service('router'),
    graphCache: service('graph-data-cache'),

    nologin: false,
    bolt: null,
    neo4jUser: null,
    neo4jPass: null,
    user: null,
    password: null,

    init(){
      this.set('bolt', window.localStorage.connection)
      this.set('neo4jUser', window.localStorage.neo4jUser)
      this.set('neo4jPass', window.localStorage.neo4jPass)
      this.set('user', window.localStorage.user)

    },


    actions: {
      submit(bolt, neo4jUser, neo4jPass, user, password) {
        this.get('graphCache').empty()


        window.localStorage.setItem('connection', bolt)
        window.localStorage.setItem('neo4jUser', neo4jUser)
        window.localStorage.setItem('neo4jPass', neo4jPass)
        window.localStorage.setItem('user', user)
        window.localStorage.setItem('password', md5(password))

        this.set('bolt', bolt)
        this.set('neo4jUser', neo4jUser)
        this.set('user', user)

        console.log(this.get('bolt'))



        if (user == undefined || user == null || bolt == undefined || bolt == null || neo4jPass == undefined || neo4jPass == null || neo4jUser == undefined || neo4jUser == null) {
          console.log('Enter login credentials to continue.')
          this.set('nologin', true)
        } else {
          this.get('router').transitionTo('visualization')  
        }       
      }
    }
});

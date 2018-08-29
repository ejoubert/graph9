import Controller from '@ember/controller';
import {inject as service} from '@ember/service';
import md5 from 'md5';


export default Controller.extend({
    router: service('router'),
    graphCache: service('graph-data-cache'),

    nologin: false,

    actions: {
      submit(bolt, neo4jUser, neo4jPass, user, password) {
        this.get('graphCache').empty()


        window.sessionStorage.setItem('connection', bolt)
        window.sessionStorage.setItem('neo4jUser', neo4jUser)
        window.sessionStorage.setItem('neo4jPass', neo4jPass)
        window.sessionStorage.setItem('username', user)
        window.sessionStorage.setItem('password', md5(password))


        if (user == undefined || user == null || password == undefined || password == null || bolt == undefined || bolt == null || neo4jPass == undefined || neo4jPass == null || neo4jUser == undefined || neo4jUser == null) {
          console.log('Enter login credentials to continue.')
          this.set('nologin', true)
        } else {
        this.get('router').transitionTo('visualization')  
        }       
      }
    }
});

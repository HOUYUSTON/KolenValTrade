import React from 'react';
import logo from './logo.svg';
import './App.css';
import './search.css';

import {createStore, combineReducers, applyMiddleware} from 'redux';
import {Provider, connect} from 'react-redux';

import {Router, Route, Link, Switch} from 'react-router-dom';
import Select from 'react-select'
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';

const history = require("history")
const createHistory = history.createBrowserHistory
const createdHistory = createHistory()
const jwtDecode = require('jwt-decode');

const forbidden = [
  'donba$$',
  'down',
  'aue'
]

const historyReducer = (state, action) => {
  const {type} = action
  if(!state){
    return {
      status: '',
      ads: []
    }
  }
  if(type === 'ADS'){
    return {
      ...state,
      status: 'SENT',
      ads: action.ads
    }
  }
  if(type === 'ADS_PENDING'){
    return {
      ...state,
      status: 'SENDING'
    }
  }
  return state
}

const searchReducer = (state, action) => {
  const {type} = action
  if(!state){
    return {
      status: '',
      params: []
    }
  }
  if(type === 'PARAMS'){
    console.log('reducer params ',action.params)
    return {
      ...state,
      status: 'SENT',
      params: action.params
    }
  }
  if(type === 'PARAMS_PENDING'){
    return {
      ...state,
      status: 'SENDING'
    }
  }
  return state
}



const logRegReducer = (state, action) => {
  const {type} = action
  if(!state){
    return{
      status: 'NONE'
    }
  }
  if(type === 'SENT'){
    return{
      ...state,
      status: 'SENT'
    }
  }
  if(type === 'SENDING'){
    return {
      ...state,
      status: 'SENDING'
    }
  }
  if(type === 'FAILED'){
    return {
      ...state,
      status: 'FAILED'
    }
  }
  return state
}

const rootReducer = combineReducers({history: historyReducer, search: searchReducer, logReg: logRegReducer})

const store = createStore(rootReducer)
const delay = ms => new Promise(ok => setTimeout(ok,ms))

store.subscribe(() => console.log('store.getState ', store.getState()))

const logout = function() {
  localStorage.removeItem('tokenavelli')
  window.location.reload()
}

const actionADS = (obj) => {
  fetch("/getAds",{
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(obj)
  })
  .then(res => res.json())
  .then(ads => {
    console.log('action')
    store.dispatch({type: 'ADS', ads}) 
  })
  return {
    type: 'ADS_PENDING'
  }
}

const actionParams = () => {
  fetch('/getParams', {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })
    .then(res => res.json())
    .then(params => {
      console.log('action ', params)
      store.dispatch({type: 'PARAMS', params})
    })
  return {
    type: 'PARAMS_PENDING'
  }
}

const actionCreateAd = (obj) => {
  fetch('/createAd', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('tokenavelli')
  },
    body: JSON.stringify(obj)
  })
  .then(res => 
      res.status === 201? res.json() : store.dispatch({type: 'FAILED'})
    )
  .then(json => {
    localStorage.setItem("tokenavelli", json)
    store.dispatch({type: 'SENT'})
    store.dispatch(actionADS())
    createdHistory.push('/')
  })
  return {type: 'SENDING'}
}

const actionRegister = (mail, password, name, phone) => {
  fetch('/register', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({login: mail, password: password, name: name, phones: [phone]})
  })
    .then(res => 
      res.status === 201? res.json() : store.dispatch({type: 'FAILED'})
    )
    .then(json => {
      createdHistory.push('/login')
      store.dispatch({type: 'SENT'})//returns userInfo
    })
  return {type: 'SENDING'}
}

const actionLogin = (login, password) => {
  fetch('/login', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('tokenavelli')
    },
    body: JSON.stringify({login: login, password: password})
  })
    .then(res => 
      res.status === 201? res.json() : store.dispatch({type: 'FAILED'})
    )
    .then(json => {
      localStorage.setItem("tokenavelli", json)
      store.dispatch({type: 'SENT'})
      createdHistory.push('/')
      window.location.reload()
    })
  return {type: 'SENDING'}
}

//store.dispatch(actionPARAMS())

;(async () => {
  //while(true){
    await delay(1000)
    store.dispatch(actionADS())
  //}
})()

/*class SendForm extends React.Component{
  static get defaultProps(){
    return {
      onSend() {
        throw new ReferenceError('You forgot to set onSend prop')
      }
    }
  }

  constructor(props){
    super(props)
    props.forEach(input => {
      this.state
    })
    this.state = props.inputs
    console.log(this.state)
  }

  render () {
    return(
      <div>
        {this.state.map((value, onChange) => 
          <input value = {value}
            onChange = {onChange}
          />
        )}
        <button onClick = {() => {
          this.props.onSend(this.state.nick, this.state.message)          
          this.setState({nick: '', message: ''})
        }} disabled={this.props.status === 'SENDING'}/>
      </div>
    )
  }
}*/

class LoginForm extends React.Component {
  static get defaultProps(){
    return {
      onSend() {
        throw new ReferenceError('You forgot to set onSend prop')
      }
    }
  }

  constructor(props){
    super(props)
    this.state = {
      login: '', 
      password: '',
      formErrors: {login: '', password: ''},
      loginValid: false,
      passwordValid: false,
      formValid: false
    }
  }

  handleUserInput = (e) => {
    const name = e.target.name
    const value = e.target.value
    this.setState({[name]: value}, () => this.validateField(name, value))
  }

  validateField(fieldName, value) {
    let fieldValidationErrors = this.state.formErrors
    let loginValid = this.state.loginValid
    let passwordValid = this.state.passwordValid

    switch(fieldName) {
      case 'login':
        loginValid = value.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i)
        fieldValidationErrors.login = loginValid ? '' : ' is invalid'
        break;
      case 'password':
        passwordValid = value.length >= 6
        fieldValidationErrors.password = passwordValid ? '': ' is too short'
        break;
      default:
        break;
    }
    this.setState(
      {
        formErrors: fieldValidationErrors,
        loginValid: loginValid,
        passwordValid: passwordValid
      }, 
      this.validateForm
    )
  }

  validateForm() {
    this.setState({formValid: this.state.loginValid && this.state.passwordValid});
  }

  errorClass(error) {
    return(error.length === 0 ? '' : 'has-error');
  }

  render () {
    return(
      <div>
        <input name='login' value = {this.state.login}
          onChange = {this.handleUserInput}
        />
        <input name='password' value = {this.state.password} type = "password"
          onChange = {this.handleUserInput}
        />
        <button class="btn btn-warning" onClick = {() => {
          this.props.onSend(this.state.login, this.state.password)
          this.setState({login: '', password: ''})
        }} disabled={this.props.status === 'SENDING' || !this.state.formValid}>SEND</button>
        {Object.keys(this.state.formErrors).map((fieldName, i) => {
          if(this.state.formErrors[fieldName].length > 0){
            return (
              <p key={i}>{fieldName} {this.state.formErrors[fieldName]}</p>
            )        
          } else {
            return '';
          }
        })}
      </div>
    )
  }
}

class RegisterForm extends React.Component {
  static get defaultProps(){
    return {
      onSend() {
        throw new ReferenceError('You forgot to set onSend prop')
      }
    }
  }

  constructor(props){
    super(props)
    this.state = {
      login: '', 
      password: '',
      name: '',
      phone: '',
      formErrors: {login: '', password: '', name: '', phone: ''},
      loginValid: false,
      passwordValid: false,
      nameValid: false,
      phoneValid: false,
      formValid: false
    }
  }

  handleUserInput = (e) => {
    const name = e.target.name
    const value = e.target.value
    this.setState({[name]: value}, () => this.validateField(name, value))
  }

  validateField(fieldName, value) {
    let fieldValidationErrors = this.state.formErrors
    let loginValid = this.state.loginValid
    let passwordValid = this.state.passwordValid
    let nameValid = this.state.nameValid
    let phoneValid = this.state.phoneValid

    switch(fieldName) {
      case 'login':
        loginValid = value.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i)
        fieldValidationErrors.login = loginValid ? '' : ' is invalid'
        break;
      case 'password':
        passwordValid = value.length >= 6
        fieldValidationErrors.password = passwordValid ? '': ' is too short'
        break;
      case 'name':
        nameValid = forbidden.indexOf(value.toLowerCase()) === -1
        fieldValidationErrors.name = nameValid ? '': ' is forbidden'
        break;
      case 'phone':
        phoneValid = value.match(/^\+?3?8?(0[5-9][0-9]\d{7})$/i)
        fieldValidationErrors.phone = phoneValid ? '': ' is invalid'
        break;
      default:
        break;
    }
    this.setState(
      {
        formErrors: fieldValidationErrors,
        loginValid: loginValid,
        passwordValid: passwordValid,
        nameValid: nameValid,
        phoneValid: phoneValid
      }, 
      this.validateForm
    )
  }

  validateForm() {
    this.setState({formValid: this.state.loginValid && this.state.passwordValid && this.state.nameValid && this.state.phoneValid});
  }

  errorClass(error) {
    return(error.length === 0 ? '' : 'has-error');
  }

  render () {
    console.log('status ', this.props.status)
    return(
      <div>
        <input name='login' value = {this.state.login}
          onChange = {this.handleUserInput}
        />
        <input name='password' value = {this.state.password} type = "password"
          onChange = {this.handleUserInput}
        />
        <input name='name' value = {this.state.name}
          onChange = {this.handleUserInput}
        />
        <input name='phone' value = {this.state.phone}
          onChange = {this.handleUserInput}
        />
        <button class="btn btn-warning" onClick = {() => {
          this.props.onSend(this.state.login, this.state.password, this.state.name, this.state.phone)          
          this.setState({login: '', password: '', name: '', phone: ''})
        }} disabled={this.props.status === 'SENDING' || !this.state.formValid}>SEND</button>
        {Object.keys(this.state.formErrors).map((fieldName, i) => {
          if(this.state.formErrors[fieldName].length > 0){
            return (
              <p key={i}>{fieldName} {this.state.formErrors[fieldName]}</p>
            )        
          } else {
            return '';
          }
        })}
      </div>
    )
  }
}

class SearchForm extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      params: [],
      className: 'SearchForm'
    }
  }

  componentDidMount(){
    fetch('/getParams', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then(res => res.json())
    .then(params => {
      let obj = {}
      for(let param in params){
        obj[param] = {}
      }
      obj.params = params
      this.setState(obj)
      /*let selected = {}
      for(let param in params){
        selected[param] = {}
      }
      this.setState({params: params, selected: selected})*/
    })
  }

  filteredOptions = (opt, param) => {
    return opt.filter(optn => optn[param] === this.state[param].value)
  }

  render(){
    console.log('render', this.state)    
    let {params, className, ...obj} = this.state//объект со всеми массивами
    if(params){
      for(let param in params){
        params[param].forEach(elem => {
          if(elem._id){
            elem.value = elem._id
            delete elem._id
          }
          if(elem.name){
            elem.label = elem.name            
            delete elem.name
          }
        })
      }
    }
    let selects = []
    for(let param in params){
      let key = Object.keys(params[param][0]).filter(k => ['__v', 'value', 'label'].indexOf(k) === -1)//проверка свойства
      let options = []
      if(key[0]){
        options = this.filteredOptions(params[param], key[0])
      }
      else{
        options = params[param]
      }
      selects.push(
        <div>
          <label>
            {param.toString()}
            <Select
              value = {this.state[param]}
              id={param.toString()}
              name={param.toString()}
              options={options}
              className="basic-multi-select"
              classNamePrefix="select"
              onChange = {o => {
                let field = this.state[param]
                this.setState({[param]: o})
              }}
            />
          </label>        
        </div>
      )
    }
    for(let field in obj){
      if(obj[field].value != undefined){
        obj[field] = obj[field].value
      }
      else{
        delete obj[field]
      }
    }
    console.log('onSend',obj)
    console.log('action',this.props.onSend)
    return(
      <div class={className}>
        {selects}
        <button class='btn btn-secondary' onClick={() => {
          this.props.onSend(obj)
        }}>Search</button>
      </div>
    )
  }
}

/*let Adparams = (params) => //<select>{this.state.options.map((option, idx) => <option value={option}>{option}</option>)}</select>
{
  let selects = []
  for(let param in params){
    let keys = Object.keys(params[param])

    let options = keys > 2 ? filteredOptions(params[param], params[param][keys[2]]) :params[param]
    selects.push(
      <div>
        <label>
          {param.toString()}
          <Select
            id={param.toString()}
            name={param.toString()}
            options={options}
            className="basic-multi-select"
            classNamePrefix="select"            
          />
        </label>        
      </div>
    )
  }
  return(
    <div>
      {selects}
    </div>
  )
}*/

class RedirectButton extends React.Component{//нужно создать элемент этого класса и передать ему {name: 'Log In', path: '/login'}
  constructor(props){
    super(props)
    this.state = {...props}
  }

  render(){
    return(
      <Link class={this.state.class} to={this.state.path}>{this.state.name}</Link>
    )
  }
}

let zaglushka = () =>
<div>
  zaglushka
</div>

let Advertisement = ({ad}) =>
<div>
  <img src={ad.photos[0]} alt='Машина'></img>
  <h4>{ad.manufactor} {ad.model}</h4>
  <p>
    {ad.gearboxType} {ad.fuelType} {ad.price}
  </p>
</div>

let Ads = function({ads}){
  return(
    <div>
      {ads.map(ad => <Advertisement key = {ad._id} ad={ad} />)}
    </div>
  )
}

/*let Ads = ({ads}) =>
<div>
  {ads.map(ad => <Advertisement key = {ad._id} ad={ad} />)}
</div>*/

let Search = ({param}) =>
<div>
  <p>
    {param._id} {param._name}
  </p>
</div>

let Searches = function({params}){
  console.log('ss',params)
  return(
    <div>
      {Object.keys(params)}
    </div>
  )
}

const mapStateToProps = (state) => ({
    ads: state.history.ads
})

/*const inputsLogin = [
  {
    value: 'login',
    onChange: e => {this.setState({login: e.target.value})}
  },
  {
    value: 'password',
    onChange: e => {this.setState({password: e.target.value})}
  }
]*/

let AdsHistoryConnected = connect(st => ({ads: st.history.ads}), null)(Ads)
let LoginConnected = connect(st => ({status: st.logReg.status}), {onSend: actionLogin})(LoginForm)
let RegisterConnected = connect(st => ({status: st.logReg.status}), {onSend: actionRegister})(RegisterForm)
let SearchConnected = connect(st => ({params: st.search.params}), {onSend: actionADS})(SearchForm)
let CreateAdConnected = connect(st => ({params: st.search.params}), {onSend: actionCreateAd})(SearchForm)

function App() {
  let components
  if(localStorage.getItem('tokenavelli')){
    components = function(){
      return(
        <div>
          <RedirectButton class='btn btn-warning' name='createAd' path='/createAd'/>
          <Link class='btn btn-secondary' onClick = {logout}>Log out</Link>
        </div>
      )      
    }
  }
  else{
    components = function(){
      return(
        <div>
          <RedirectButton class='btn btn-secondary' name='login' path='/login'/>
          <RedirectButton class='btn btn-info' name='register' path='/register'/>
        </div>
      )
    }
  }
  return (
    <Provider store={store}>
      <Router history = {createdHistory}>
        <header />
        <div>
          {components()}
          <SearchConnected />
          <Switch>
            <Route path="/" component = {AdsHistoryConnected} exact />
            <Route path="/ad/:id" component = {zaglushka} exact />
            <Route path="/login" component = {LoginConnected} exact />
            <Route path="/register" component = {RegisterConnected} exact />
            <Route path="/createAd" component = {CreateAdConnected} exact />
          </Switch>
          <footer />
        </div>
      </Router>
    </Provider>
  );
}

export default App;

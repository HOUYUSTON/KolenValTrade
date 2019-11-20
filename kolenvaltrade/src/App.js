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

const actionADS = () => {
  fetch("/getAds",{
    method: "GET",
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  })
  .then(res => res.json())
  .then(ads => {
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

const actionSearch = () => {
  fetch('/getAdsbySearch', {
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
    .then(json => store.dispatch({type: 'SENT'}))//returns userInfo
  return {type: 'SENDING'}
}

const actionLogin = (login, password) => {
  fetch('/login', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({login: login, password: password})
  })
    .then(res => 
      res.status === 201? res.json() : store.dispatch({type: 'FAILED'})
    )
    .then(json => {
      localStorage.setItem("tokenavelli", json)
      store.dispatch({type: 'SENT'})
      history.push('/')
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

const options = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' }
]

class SearchForm extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      params: [],
      className: 'SearchForm'
    }
  }

  componentDidMount(){
    console.log('didmount')
    store.dispatch(actionParams())
    this.setState({params: this.props.params})
  }

  componentDidUpdate(){
    console.log('update')
  }

  render(){
    console.log('search', this.props.params)
    let params = this.props.params
    if(params){
      for(let param in params){
        params[param].forEach(elem => {
          /*let array = []
          let keys = Object.keys(elem)
          let arrKey = ''
          keys.forEach(key => {
            if(Array.isArray(elem[key])){
              console.log('isArray',key)
              arrKey = key
              array = array.concat(elem[key])
              console.log('array',array)
              delete elem[key]
            }
          })
          console.log('arrKey',arrKey)
          if(array.length > 0){
            param[arrKey] = array
          }*/
          elem.value = elem._id
          elem.label = elem.name
          delete elem._id
          delete elem.name
        })
      }
      console.log('params',params)
    }
    return(
      <div class={this.state.className}>
        {Adparams(params)}
      </div>
    )
  }
}

let Adparams = (params) => //<select>{this.state.options.map((option, idx) => <option value={option}>{option}</option>)}</select>
{
  let selects = []
  for(let param in params){
    selects.push(
      <div>
        <label>
          {param.toString()}
          <Select
            id={param.toString()}
            name={param.toString()}
            options={params[param]}
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
}

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
  console.log('ads',ads)
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
let SearchConnected = connect(st => ({params: st.search.params}), null)(SearchForm)

function App() {
  return (
    <Provider store={store}>
      <Router history = {createHistory()}>
        <header />
        <div>
          <RedirectButton class='btn btn-secondary' name='login' path='/login'/>
          <RedirectButton class='btn btn-info' name='register' path='/register'/>
          <SearchConnected />
          <Switch>
            <Route path="/" component = {AdsHistoryConnected} exact />
            <Route path="/ad/:id" component = {zaglushka} exact />
            <Route path="/login" component = {LoginConnected} exact />
            <Route path="/register" component = {RegisterConnected} exact />
          </Switch>
          <footer />
        </div>
      </Router>
    </Provider>
  );
}

export default App;

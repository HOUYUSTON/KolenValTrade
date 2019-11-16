import React from 'react';
import logo from './logo.svg';
import './App.css';

import {createStore, combineReducers, applyMiddleware} from 'redux';
import {Provider, connect} from 'react-redux';

import {Router, Route, Link, Switch} from 'react-router-dom';
const history = require("history")
const createHistory = history.createBrowserHistory

const jwtDecode = require('jwt-decode');

const reducer = (state, action) => {//
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

function logout() {
    localStorage.removeItem();
}

const store = createStore(reducer)
const delay = ms => new Promise(ok => setTimeout(ok,ms))

store.subscribe(() => console.log(store.getState()))

const actionRedirect = (path) => {
  history.push(path)
}

const actionADS = () => {
  fetch("/getAds",{
    method: "GET",
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  })
  .then(res => res.json())
  .then(ads => store.dispatch({type: 'ADS', ads}))
  return {
    type: 'ADS_PENDING'
  }
}

//store.dispatch(actionHistory())
;(async () => {
  //while(true){
    await delay(1000)
    store.dispatch(actionADS())
  //}
})()

class SendParams extends React.Component{
  constructor(props){
    super(props)
  }

  render(){
    return null
  }
}

/*class AdParams extends React.Component{representative поиска машин, нужен класс который будет им управлять, 
поиск и создание объявления будут использовать этот компонент,
за исключением того что в поиске будет кнопка которая инициирует поиск машины по выбранным параметрам, а в создании, создание объявления
  constructor(props){
    super(props)
    this.state = {}
  }

  render(){
    <select>{this.state.options.map((option, idx) => <option key={idx}>{option}</option>)}</select>
    <ul>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
    </ul>
    //checkbox как сделать на реакте
  }
}*/

/*class RedirectButton extends React.Component{//нужно создать элемент этого класса и передать ему {name: 'Log In', path: '/login'}
  constructor(props){
    super(props)
    console.log('props : ',this.props)
    this.state = {...props}
  }

  render(){
    console.log('render props : ',this.props)
    return(
      <button onClick={this.props.history.push(props.path)}>{props.name}</button>
    )
  }
}*/

let zaglushka = () =>
<div>
  zaglushka
</div>

let Advertisement = ({ad}) =>
<div>
  <img src={ad.photos[0]} alt='Машина'></img>
  <p>
    {ad.description + " " + ad.price}
  </p>
</div>

let Ads = ({ads}) =>
<div>
  {ads.map(ad => <Advertisement ad={ad} />)}
</div>

let AdsHistoryConnected = connect(st => ({ads: st.ads}))(Ads)

function App() {
  return (
    <Provider store={store}>
      <Router history = {createHistory()}>
        <div>
          <Switch>
            <Route path="/" component = {AdsHistoryConnected} exact />
            <Route path="/ad/:id" component = {zaglushka} exact />
            <Route path="/login" component = {zaglushka} exact />
            <Route path="/register" component = {zaglushka} exact />
          </Switch>
        </div>
      </Router>
    </Provider>
  );
}

export default App;

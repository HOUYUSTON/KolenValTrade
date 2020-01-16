const mongoose = require('mongoose')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const app = express()
const fetch = require("node-fetch");
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');

mongoose.connect('mongodb://localhost/kolenval', {useNewUrlParser: true})

var db = mongoose.connection;

var userSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	login: String,
	password: String,
	ads: [{type: mongoose.Schema.Types.ObjectId, ref: 'CarAd'}],
	photos: [String],
	phones: [String],
	name: String,
	//privilege: Boolean
})

var citySchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	name: String,
	region: {type: mongoose.Schema.Types.ObjectId, ref: 'Region'},
	ads: [{type: mongoose.Schema.Types.ObjectId, ref: 'CarAd'}]
})

var regionSchema =  new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	name: String,
	cities: [{type: mongoose.Schema.Types.ObjectId, ref: 'City'}]
})

var modelSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	name: String,
	manufactor: {type: mongoose.Schema.Types.ObjectId, ref: 'Manufactor'}
})

var manufactorSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	name: String,
	models: [{type: mongoose.Schema.Types.ObjectId, ref: 'Model'}]
})

var statusSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	name: String,// активно/не активно
	ads: [{type: mongoose.Schema.Types.ObjectId, ref: 'CarAd'}]
})

var releasedSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	name: String,
	ads: [{type: mongoose.Schema.Types.ObjectId, ref: 'CarAd'}]
})

var afterCrashSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	name: String,
	ads: [{type: mongoose.Schema.Types.ObjectId, ref: 'CarAd'}]
})

var runningSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	name: String,
	ads: [{type: mongoose.Schema.Types.ObjectId, ref: 'CarAd'}]
})

var bodyTypeSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	name: String,
	ads: [{type: mongoose.Schema.Types.ObjectId, ref: 'CarAd'}]
})

var gearboxTypeSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	name: String,
	ads: [{type: mongoose.Schema.Types.ObjectId, ref: 'CarAd'}]
})

var drivetrainTypeSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	name: String,
	ads: [{type: mongoose.Schema.Types.ObjectId, ref: 'CarAd'}]
})

var colorSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	name: String,
	ads: [{type: mongoose.Schema.Types.ObjectId, ref: 'CarAd'}]
})

var fuelTypeSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	name: String,
	ads: [{type: mongoose.Schema.Types.ObjectId, ref: 'CarAd'}]
})

var carAdSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	status: {type: mongoose.Schema.Types.ObjectId, ref: 'Status'},
	released: {type: mongoose.Schema.Types.ObjectId, ref: 'Released'},
	afterCrash: {type: mongoose.Schema.Types.ObjectId, ref: 'AfterCrash'},
	running: {type: mongoose.Schema.Types.ObjectId, ref: 'Running'},
	user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},//кто выложил объявление
	model: {type: mongoose.Schema.Types.ObjectId, ref: 'Model'},//отсюда достаем производителя
	bodyType: {type: mongoose.Schema.Types.ObjectId, ref: 'BodyType'},
	gearboxType: {type: mongoose.Schema.Types.ObjectId, ref: 'GearboxType'},
	drivetrainType: {type: mongoose.Schema.Types.ObjectId, ref: 'DrivetrainType'},
	color: {type: mongoose.Schema.Types.ObjectId, ref: 'Color'},
	fuelType: {type: mongoose.Schema.Types.ObjectId, ref: 'FuelType'},
	power: String,
	productionDate: String,
	price: String,
	description: String,
	photos: [String],
	city: {type: mongoose.Schema.Types.ObjectId, ref: 'City'}//через город узнаем область
})

var Region = mongoose.model('Region', regionSchema)
var City = mongoose.model('City', citySchema)
var User = mongoose.model('User', userSchema)
var User = mongoose.model('User', userSchema)
var Model = mongoose.model('Model', modelSchema)
var Manufactor = mongoose.model('Manufactor', manufactorSchema)
var Status = mongoose.model('Status', statusSchema)
var Released = mongoose.model('Released', releasedSchema)
var AfterCrash = mongoose.model('AfterCrash', afterCrashSchema)
var Running = mongoose.model('Running', runningSchema)
var BodyType = mongoose.model('BodyType', bodyTypeSchema)
var GearboxType = mongoose.model('GearboxType', gearboxTypeSchema)
var DrivetrainType = mongoose.model('DrivetrainType', drivetrainTypeSchema)
var Color = mongoose.model('Color', colorSchema)
var FuelType = mongoose.model('FuelType', fuelTypeSchema)
var CarAd = mongoose.model('CarAd', carAdSchema)

const secret = 'rjomba'

function jwtWare() {
    return expressJwt({ secret }).unless({ //блюдет доступ к приватным роутам
        path: [
            // public routes that don't require authentication
            '/',
            '/register',
            '/login',
            '/getAds',
            '/getParams',
            '/favicon.ico',
            '/babel/parser/lib/index.js',
            '/getAdsbySearch'
        ]
    });
}

/*function jwtCheck(req, secret) {//по большей степени для graphql
    const authorization = req && req.headers && req.headers.authorization 

    if (authorization && authorization.startsWith('Bearer ')){
        const token = authorization.substr("Bearer ".length)
        const decoded = jwt.verify(token, secret)
        return decoded
    }
}*/

/*fetch('/register', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({login: 'test', password: 'test'}) 
  }).then(res => (console.log(res, res.headers), res.json()))
    .then(json => console.log(json))*/

/*fetch('/login', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('tokenavelli')
    },
    body: JSON.stringify({login: 'test', password: 'test'}) 
  })
  .then(res => (console.log(res, res.headers), res.json()))
  .then(json => localStorage.setItem("tokenavelli", json))

fetch('/getParams', {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }).then(res => (console.log(res, res.headers), res.json()))
    .then(json => console.log(json))

fetch('/createAd', {
    method: 'POST',
    headers: {
    	'Accept': 'application/json',
      	'Content-Type': 'application/json',
		'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('tokenavelli'))
	},
    body: JSON.stringify({ad:{price: '1880'}})
  })
  .then(res => (console.log(res, res.headers), res.json()))
  .then(json => localStorage.setItem("tokenavelli", JSON.stringify(json)))

fetch('/getAdsbyUser', {
    method: 'GET',
    headers: {
    	'Accept': 'application/json',
      	'Content-Type': 'application/json',
		'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('tokenavelli'))
	}
  })
  .then(res => (console.log(res, res.headers), res.json()))
  .then(json => console.log(json))

fetch('/getAds', {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }).then(res => (console.log(res, res.headers), res.json()))
    .then(json => console.log(json))

fetch('/deleteAd', {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({user:{login: 'test', password: 'test'}, adId: {_id:'5dc5d3c26c21891d1c142895'}}) 
  }).then(res => (console.log(res, res.headers), res.json()))
    .then(json => console.log(json))*/

app.use(bodyParser.json())//как получить полный объект, а не ссылки на другие схемы
app.use(cors())
app.use(jwtWare())//вставить после тех путей куда можно без токена пройти

app.post('/register', async (req,res) => {
	if(await User.findOne({login: req.body.login})){
		res.status(409).json('User already exist')
	}
	else{
		let newUser = new User(req.body)
		newUser._id = new mongoose.Types.ObjectId()
		console.log(newUser)
		await newUser.save()
		let {password, ...userInfo} = newUser.toObject()
		res.status(201).json(userInfo)
	}
})

app.post('/login', async (req,res) => {
	let user
	console.log('login',req.headers.authorization.substr("Bearer ".length).length)
	if(req.headers.authorization.substr("Bearer ".length).length > 4){
		let token = req.headers.authorization.substr("Bearer ".length)
    	let decoded = jwt.verify(token, secret)
		console.log('id ', decoded.user._id)
    	user = await User.findOne({_id: decoded.user._id})
		console.log('authorization ',user)
	}
	else {
		if (req.body.password) {
			user = await User.findOne(req.body)
			console.log('body ',user)
		}		
	}
	if(user) {
		let {password, ...userInfo} = user.toObject()
		const token = jwt.sign({user: userInfo}, secret)
		console.log(token)
		res.status(201).json(token)
	}
	else{
		res.status(404).json('login or password is not correct')
	}
})

app.post('/getAds', async(req, res) => {
	console.log('req.body ',req.body)
	let a = await CarAd.find(req.body)/*.populate('model')
	let ads = a.map(ad => {
		console.log('adName',ad.model.name)
		let model = ad.model.name
		delete ad.model
		ad.model = model
		console.log('ad',ad)
		return ad
	})*/
	console.log('ads',a)
	if(a) {
		res.status(201).json(a)
	}
	else{
		res.status(404)
	}
})

app.get('/getAdsbyUser', async(req, res) => {//?
	let token = req.headers.authorization.substr("Bearer ".length)
    let decoded = jwt.verify(token, secret)
    console.log('decoded ',decoded)
	//let user = await User.findOne({_id: decoded.user._id})
	let adsPromises = []
	adsPromises = decoded.user.ads.map(async adId => {
		return await CarAd.findOne({_id: adId})
	})
	Promise.all(adsPromises).then(ads => ads? res.status(201).json(ads): res.status(404))
})

app.post('/createAd', async(req, res) => {
	if(req.headers.authorization.substr("Bearer ".length).length > 4){
		let token = req.headers.authorization.substr("Bearer ".length)
    	let decoded = jwt.verify(token, secret)
    	user = await User.findOne({_id: decoded.user._id})
		let status = await Status.findOne({name: 'active'})
		let ad = new CarAd(req.body)
		ad._id = new mongoose.Types.ObjectId()
		ad.user = decoded.user._id
		await ad.save()
		status.ads.push(ad._id)
		await status.save()
		user.ads.push(ad._id)
		await user.save()
		let {password, ...userInfo} = user.toObject()
		token = jwt.sign({user: userInfo}, secret)
		res.status(201).json(token)
	}
	else{
		res.status(409).json('unauthorized')
	}
})

app.delete('/deleteAd', async(req, res) => {
	if(req.headers.authorization.substr("Bearer ".length).length > 4){
		let token = req.headers.authorization.substr("Bearer ".length)
    	let decoded = jwt.verify(token, secret)
		console.log('id ', decoded.user._id)
    	user = await User.findOne({_id: decoded.user._id})
		console.log('authorization ',user)
		let ad = await CarAd.findOne(req.body.adId)
		let activeStatus = await Status.findOne({name: 'active'})
		activeStatus.ads.splice(user.ads.indexOf(ad._id), 1)
		user.ads.splice(user.ads.indexOf(ad._id), 1)
		await user.save()
		await activeStatus.save()
		await CarAd.deleteOne(ad)
		let {password, ...userInfo} = user.toObject()
		res.status(201).json(userInfo)
	}
	else{
		res.status(409).json('unauthorized')
	}
})

app.get('/getParams', async(req, res) => {
	let params = {}
	let rs = await Released.find({}, '-ads')
	params['realeased'] = rs
	let af = await AfterCrash.find({}, '-ads')
	params['aftercrash'] = af
	let rn = await Running.find({}, '-ads')
	params['running'] = rn
	let mf = await Manufactor.find({}, '-models')
	/*let mf = await Manufactor.find().populate('models')
	let manuf = mf.map(manufactor => {
		let {models, ...result} = manufactor
		let mdls = models.map(model => {
			let {name, _id, ...rest} = model
			return {name, _id};
		})
		return {name: manufactor.name, _id:manufactor._id, models:mdls}
	})*/
	params['manufactor'] = mf
	let md = await Model.find()
	params['model'] = md
	let rg = await Region.find({}, '-cities')
	/*let rg = await Region.find().populate('cities')
	let reg = rg.map(region => {
		let {cities, ...result} = region
		let cts = cities.map(city => {
			let {name, _id, ...rest} = city
			return {name, _id};
		})
		return {name: region.name, _id:region._id, cities:cts}
	})*/
	params['region'] = rg
	let ct = await City.find({}, '-ads')
	params['city'] = ct
	let bt = await BodyType.find({}, '-ads')
	params['bodyType'] = bt
	let ft = await FuelType.find({}, '-ads')
	params['fuelType'] = ft
	let gt = await GearboxType.find({}, '-ads')
	params['gearboxType'] = gt
	let dt = await DrivetrainType.find({}, '-ads')
	params['drivetrainType'] = dt
	let cr = await Color.find({}, '-ads')
	params['color'] = cr
	if(params) {
		res.status(201).json(params)
	}
	else{
		res.status(404).json('not found')
	}
})

db.on('error', console.error.bind(console, 'connection error:'))

db.once('open', function() {
  console.log('connected')
});

app.get('/', async (req, res) => res.send("KolenValTrade"))

app.listen(4000, function () {
  console.log('Example app listening on port 4000!')
})
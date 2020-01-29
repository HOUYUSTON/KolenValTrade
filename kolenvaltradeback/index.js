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
	//photos: [String],
	phones: [String],
	name: String,
	//privilege: Boolean
})

var citySchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	name: String,
	region: {type: mongoose.Schema.Types.ObjectId, ref: 'Region'}
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
	name: String
})

var afterCrashSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	name: String
})

var runningSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	name: String
})

var bodyTypeSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	name: String
})

var gearboxTypeSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	name: String
})

var drivetrainTypeSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	name: String
})

var colorSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	name: String
})

var fuelTypeSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	name: String
})

var carAdSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	status: {type: mongoose.Schema.Types.ObjectId, ref: 'Status'},
	released: {type: mongoose.Schema.Types.ObjectId, ref: 'Released'},
	aftercrash: {type: mongoose.Schema.Types.ObjectId, ref: 'AfterCrash'},
	running: {type: mongoose.Schema.Types.ObjectId, ref: 'Running'},
	user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},//кто выложил объявление
	manufactor: {type: mongoose.Schema.Types.ObjectId, ref: 'Manufactor'},
	model: {type: mongoose.Schema.Types.ObjectId, ref: 'Model'},//отсюда достаем производителя
	bodyType: {type: mongoose.Schema.Types.ObjectId, ref: 'BodyType'},
	gearboxType: {type: mongoose.Schema.Types.ObjectId, ref: 'GearboxType'},
	drivetrainType: {type: mongoose.Schema.Types.ObjectId, ref: 'DrivetrainType'},
	color: {type: mongoose.Schema.Types.ObjectId, ref: 'Color'},
	fuelType: {type: mongoose.Schema.Types.ObjectId, ref: 'FuelType'},
	productionDate: String,
	price: String,
	description: String,
	photos: [String],
	region: {type: mongoose.Schema.Types.ObjectId, ref: 'Region'},
	city: {type: mongoose.Schema.Types.ObjectId, ref: 'City'}//через город узнаем область
})

var Region = mongoose.model('Region', regionSchema)
var City = mongoose.model('City', citySchema)
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

/*
fetch('/register', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({login: 'test', password: 'test'}) 
  }).then(res => (console.log(res, res.headers), res.json()))
    .then(json => console.log(json))

let login = fetch('/login', {
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

let params = fetch('/getParams', {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }).then(res => (console.log(res, res.headers), res.json()))
    .then(json => console.log(json))

let get1 = fetch('/getAdsbyUser', {
    method: 'GET',
    headers: {
    	'Accept': 'application/json',
      	'Content-Type': 'application/json',
		'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('tokenavelli'))
	}
  })
  .then(res => (console.log(res, res.headers), res.json()))
  .then(json => console.log(json))

let get2 = fetch('/getAds', {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }).then(res => (console.log(res, res.headers), res.json()))
    .then(json => console.log(json))

let fetches = [login,params,get1,get2]

for(i=0;i<10;i++){
	let Randfetch = fetches[Math.floor(Math.random()*(fetches.length))]
	Randfetch()
}

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

fetch('/deleteAd', {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({user:{login: 'test', password: 'test'}, adId: {_id:'5dc5d3c26c21891d1c142895'}}) 
  }).then(res => (console.log(res, res.headers), res.json()))
    .then(json => console.log(json))

fetch('/deleteAd', {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImFkcyI6WyI1ZTIwNTYwOTMxMjc1ZDI4Mzg4ZTc1MjQiLCI1ZTIyZjBhZGRmYjY3NjIwZWNkODU5ZTUiLCI1ZTIzMDAyNWRmYjY3NjIwZWNkODU5ZTYiXSwicGhvdG9zIjpbXSwicGhvbmVzIjpbIjA2OTEzMzc0MjAiXSwiX2lkIjoiNWUyMDU1YWYzMTI3NWQyODM4OGU3NTIzIiwibG9naW4iOiJ5ZWV0MTMzN0BtYWlsLmNvbSIsIm5hbWUiOiJ5ZWV0IiwiX192IjozfSwiaWF0IjoxNTc5MzUyMTAxfQ.5uJE3zhzo58Bx99DRe3e0H1f5Pai8q9APuoVi0DYQrg'
    },
    body: JSON.stringify({adId: {_id:'5e230025dfb67620ecd859e6'}}) 
  }).then(res => (console.log(res, res.headers), res.json()))
    .then(json => console.log(json))
*/

app.use(bodyParser.json())//как получить полный объект, а не ссылки на другие схемы
app.use(cors())

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
	let params = req.body
	console.log('p',params)
	let a = []
	// if(params.model.isArray()){
	// 	a = await CarAd.find({
	// 		'model': {$in : params.model}
	// 	})
	// 	let tmp = a.filter(ad => )
	// }
	a = await CarAd.find(req.body,'-_id').populate({
		path: 'model',
		populate: {
			path: 'manufactor',
			select: 'name'
		},
		select: '-_id -ads -__v'
	}).populate({
		path: 'city',
		populate: {
			path: 'region',
			select: 'name'
		},
		select: '-_id -ads -__v'
	})
	.populate('user released aftercrash running bodyType fuelType gearboxType drivetrainType color','-_id -ads -__v')
	console.log('ads',a)
	if(a) {
		res.status(201).json(a)
	}
	else{
		res.status(404)
	}
})

app.get('/getParams', async(req, res) => {
	let params = {}
	let rs = await Released.find({})
	params['released'] = rs
	let af = await AfterCrash.find({})
	params['aftercrash'] = af
	let rn = await Running.find({})
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
	let md = await Model.find({})
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
	let ct = await City.find({})
	params['city'] = ct
	let bt = await BodyType.find({})
	params['bodyType'] = bt
	let ft = await FuelType.find({})
	params['fuelType'] = ft
	let gt = await GearboxType.find({})
	params['gearboxType'] = gt
	let dt = await DrivetrainType.find({})
	params['drivetrainType'] = dt
	let cr = await Color.find({})
	params['color'] = cr
	if(params) {
		res.status(201).json(params)
	}
	else{
		res.status(404).json('not found')
	}
})

app.use(jwtWare())//вставить после тех путей куда можно без токена пройти

app.get('/getAdsbyUser', async(req, res) => {//?
	let token = req.headers.authorization.substr("Bearer ".length)
    let decoded = jwt.verify(token, secret)
    console.log('decoded ',decoded)
	//let user = await User.findOne({_id: decoded.user._id})
	let adsPromises = []
	adsPromises = decoded.user.ads.map(async adId => {
		return await CarAd.findOne({_id: adId}).populate({
			path: 'model',
			populate: {
				path: 'manufactor',
				select: 'name'
			},
			select: '-_id -ads -__v'
		}).populate({
			path: 'city',
			populate: {
				path: 'region',
				select: 'name'
			},
			select: '-_id -ads -__v'
		})
		.populate('user released aftercrash running bodyType fuelType gearboxType drivetrainType color','-_id -ads -__v')
	})
	Promise.all(adsPromises).then(ads => ads? res.status(201).json(ads): res.status(404))
})

app.post('/createAd', async(req, res) => {
	if(req.headers.authorization.substr("Bearer ".length).length > 4){
		let token = req.headers.authorization.substr("Bearer ".length)
    	let decoded = jwt.verify(token, secret)
    	user = await User.findOne({_id: decoded.user._id})
		let status = await Status.findOne({name: 'active'})
		console.log('req.body create',req.body)
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
		let flag = false
    	user = await User.findOne({_id: decoded.user._id})
    	console.log('authorization ',user)
    	console.log('req',req.body.adId._id)
    	user.ads.forEach(ad => {
    		console.log(ad)
    		if(ad == req.body.adId._id){
    			flag = true
    		}
    	})
    	if(flag){
    		console.log('yeet')
			let ad = await CarAd.findOne(req.body.adId)//искать объявление у юзера, а не из всех объявлений
			console.log('ad',ad)
			let activeStatus = await Status.findOne({name: 'active'})
			activeStatus.ads.splice(user.ads.indexOf(ad._id), 1)
			user.ads.splice(user.ads.indexOf(ad._id), 1)
			await user.save()
			await activeStatus.save()
			await CarAd.deleteOne(ad)
			let {password, ...userInfo} = user.toObject()
			token = jwt.sign({user: userInfo}, secret)
			res.status(201).json(token)
    	}
		else{
			res.status(403).json('cannot delete what does not belong to you')
		}
	}
	else{
		res.status(409).json('unauthorized')
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
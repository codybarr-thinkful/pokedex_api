require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')
const POKEDEX = require('./pokedex.json').pokemon

const app = express()
app.use(helmet())
app.use(cors())

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common'
app.use(morgan(morganSetting))

const validTypes = [
	`Bug`,
	`Dark`,
	`Dragon`,
	`Electric`,
	`Fairy`,
	`Fighting`,
	`Fire`,
	`Flying`,
	`Ghost`,
	`Grass`,
	`Ground`,
	`Ice`,
	`Normal`,
	`Poison`,
	`Psychic`,
	`Rock`,
	`Steel`,
	`Water`
]

app.use(function validateBearerToken(req, res, next) {
	const authToken = req.get('Authorization')
	const apiToken = process.env.API_TOKEN

	if (!authToken || authToken.split(' ')[1] !== apiToken) {
		return res.status(401).json({ error: 'Unauthorized request' })
	}

	next()
})

function handleGetTypes(req, res) {
	res.json(validTypes)
}

app.get('/types', handleGetTypes)

function handleGetPokemon(req, res) {
	const { name, type } = req.query
	let results = POKEDEX

	if (name) {
		results = results.filter(pokemon =>
			pokemon.name.toLowerCase().includes(name)
		)
	}

	if (type) {
		results = results.filter(pokemon => pokemon.type.includes(type))
	}

	return res.json(results)
}

app.get('/pokemon', handleGetPokemon)

app.use((error, req, res, next) => {
	let response
	if (process.env.NODE_ENV === 'production') {
		response = { error: { message: 'server error' } }
	} else {
		response = { error }
	}
	res.status(500).json(response)
})

const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
	if (process.env !== process.env.NODE_ENV) {
		console.log(`Server listening at http://localhost:${PORT}`)
	}
})

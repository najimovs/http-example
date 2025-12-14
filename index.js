import * as http from "node:http"

const PORT = 3_000

const users = {}

function generateID() {

	let maxID = 0

	for ( const username in users ) {

		maxID = Math.max( maxID, users[ username ].id )
	}

	return maxID + 1
}

function bodyParserMiddleware( originalRequest, originalResponse, next ) {

	let body = ""
	let useBody = false

	originalRequest.on( "data", data => {

		useBody = true

		body += data
	} )

	originalRequest.on( "end", () => {

		if ( !useBody ) {

			next( originalRequest, originalResponse )
		}
		else {

			try {

				console.log( body )

				const json = JSON.parse( body )

				originalRequest.body = json

				next( originalRequest, originalResponse )
			}
			catch( error ) {

				console.error( error )

				originalResponse.end()
			}
		}
	} )
}

const server = http.createServer( ( req, res ) => {

	bodyParserMiddleware( req, res, handleServer )
} )

function handleServer( req, res ) {

	if ( req.url === "/health" ) {

		res.writeHead( 200, { "Content-Type": "application/json" } )
		res.end( JSON.stringify( { message: "OK" } ) )

		return
	}
	else if ( req.url === "/users" ) {

		if ( req.method === "GET" ) {

			res.writeHead( 200, { "Content-Type": "application/json" } )
			res.end( JSON.stringify( users ) )

			return
		}
		else if ( req.method === "POST" ) {

			const { username, gender, birthYear } = req.body

			if ( username in users ) {

				res.writeHead( 400, { "Content-Type": "application/json" } )
				res.end( JSON.stringify( { error: `${ username } is already exists.` } ) )

				return
			}

			const newUser = {
				id: generateID(),
				username,
				gender,
				birthYear,
			}

			users[ username ] = newUser

			res.writeHead( 201, { "Content-Type": "application/json" } ).end( JSON.stringify( newUser ) )

			return
		}
		else if ( req.method === "PATCH" ) {

			const { username, key, value } = req.body

			if ( !( username in users ) ) {

				res.writeHead( 400, { "Content-Type": "application/json" } )
				res.end( JSON.stringify( { error: `${ username } is not exists.` } ) )

				return
			}

			users[ username ][ key ] = value

			res.writeHead( 200, { "Content-Type": "application/json" } ).end( JSON.stringify( users[ username ] ) )

			return
		}
		else if ( req.method === "DELETE" ) {

			const { username } = req.body

			if ( !( username in users ) ) {

				res.writeHead( 400, { "Content-Type": "application/json" } )
				res.end( JSON.stringify( { error: `${ username } is not exists.` } ) )

				return
			}

			delete users[ username ]

			res.writeHead( 200, { "Content-Type": "application/json" } ).end( JSON.stringify( { username } ) )
		}
		else  {

			res.writeHead( 405 )
		}
	}
	else {

		if ( req.url.startsWith( "/users/" ) ) {

			const username = req.url.substr( 7 )

			if ( !( username in users ) ) {

				res.writeHead( 404, { "Content-Type": "application/json" } )
				res.end( JSON.stringify( { error: `${ username } is not exists.` } ) )

				return
			}

			res.end( JSON.stringify( users[ username ] ) )
		}
		else {

			res.writeHead( 404 )
		}
	}

	res.end()
}

server.listen( PORT, "127.0.0.1", () => console.info( `:${ PORT }` ) )

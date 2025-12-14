import * as http from "node:http"

const PORT = 3_000

const users = {}

function generateID() {

	return Object.keys( users ).length + 1
}

const server = http.createServer( ( req, res ) => {

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

			let body = ""

			req.on( "data", data => body += data )

			req.on( "end", () => {

				try {

					const { username, gender, birthYear } = JSON.parse( body )

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
				}
				catch( error ) {

					res.writeHead( 400, { "Content-Type": "application/json" } )
					res.end( JSON.stringify( { error: error.message } ) )
				}
			} )

			return
		}
		else if ( req.method === "PATCH" ) {}
		else if ( req.method === "DELETE" ) {

			let body = ""

			req.on( "data", data => body += data )

			req.on( "end", () => {

				try {

					const { username } = JSON.parse( body )

					if ( !( username in users ) ) {

						res.writeHead( 400, { "Content-Type": "application/json" } )
						res.end( JSON.stringify( { error: `${ username } is not exists.` } ) )

						return
					}

					delete users[ username ]

					res.writeHead( 200, { "Content-Type": "application/json" } ).end( JSON.stringify( { username } ) )
				}
				catch( error ) {

					res.writeHead( 400, { "Content-Type": "application/json" } )
					res.end( JSON.stringify( { error: error.message } ) )
				}
			} )

			return
		}
		else  {

			res.writeHead( 405 )
		}
	}

	res.end()
} )

server.listen( PORT, "127.0.0.1", () => console.info( `:${ PORT }` ) )

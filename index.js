import * as http from "node:http"

const PORT = 3_000

const server = http.createServer( ( req, res ) => {

	res.writeHead( 200, { "Content-Type": "application/json" } )
	res.end( JSON.stringify( { message: "OK" } ) )
} )

server.listen( PORT, "127.0.0.1", () => console.info( `:${ PORT }` ) )

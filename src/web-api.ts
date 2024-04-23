import http from 'http';
import { roomInfo } from './client.js';
import z from 'zod';

// Web API for modifying the room status
// Intended for use by non-discord controls, e.g physical controls in the room

/**
 * Validation schema for data coming from the post request
 */
const postRequestDataSchema = z.object({
    setRoomOpen: z.boolean().nullable()
});

function handlePostRequest(request: http.IncomingMessage, response: http.ServerResponse) {
    // Parse body and update room info state
    try {
        request.on('data', function (data) {
            // Parse request
            var jsonData = JSON.parse(data.toString());
            var body = postRequestDataSchema.safeParse(jsonData);

            if (!body.success) {
                console.error(body.error.errors);
                response.end('Invalid request body');
                return;
            }

            // Update room info state
            var setRoomOpen: boolean = body.data.setRoomOpen ?? roomInfo.getIsRoomOpen();
            roomInfo.setIsRoomOpen(setRoomOpen);

            // Success response
            response.writeHead(200, { 'Content-Type': 'textplain' });
            response.end('Set room status to ' + setRoomOpen);
        });
    } catch (e) {
        response.writeHead(400, { 'Content-Type': 'textplain' });
        response.end('Invalid request body');
    }
}

function handleGetRequest(request: http.IncomingMessage, response: http.ServerResponse) {
    response.writeHead(200, { 'Content-Type': 'json' });

    // respond with room info state
    response.end(JSON.stringify(roomInfo.toJSON()));
}

//Create HTTP server and listen on port 3000 for requests
const server = http.createServer(
    (request: http.IncomingMessage, response: http.ServerResponse) => {
        // log the request
        console.log(request.method + ' ' + request.url);

        if (request.method == 'GET') {
            handleGetRequest(request, response);
        } else if (request.method == 'POST') {
            handlePostRequest(request, response);
        } else {
            response.end('Undefined request .');
        }
    }
);

function startWebServer(port: number) {
    //listen for request on port 3000, and as a callback function have the port listened on logged
    server.listen(port, '0.0.0.0');
    console.log('web-api server listening on port ' + port + ' with ip ');
}

export { startWebServer };

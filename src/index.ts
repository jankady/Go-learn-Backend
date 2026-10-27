import express, { type Express, type Request, type Response } from 'express';
import { config } from './config.js';
import { Error400, Error404 } from './customeErrors.js';

const app: Express = express();
const port = 8080;

app.use(express.json());
app.use("/app",middlewareMetricsInc ,express.static("./src/app"));


function middlewareLogResponses(req: Request, res: Response, next: () => void) {
    res.on("finish", () => {
        const status: number = res.statusCode
        if ( status >= 300 || status < 200) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${res.statusCode}`)
        }
    })
    next()
}

function middlewareMetricsInc(req: Request, res: Response, next: () => void) {

    res.on("finish", () => {
        config.fileserverHits += 1
    })
    next()
}

function handlerMetrics(req: Request, res: Response) {
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('charset', 'utf-8');
    res.send(`<html>
    <body>
        <h1>Welcome, Chirpy Admin</h1>
        <p>Chirpy has been visited ${config.fileserverHits} times!</p>
    </body>
    </html>
    `);
}

function handlerReadiness(req: Request, res: Response) {
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('charset', 'utf-8');
    res.send(`OK`);
}

function handlerResetMetrics(req: Request, res: Response) {
    config.fileserverHits = 0
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('charset', 'utf-8');
    res.send(`OK`);
}

function handlerValidateChirp(req: Request, res: Response) {
    
    if (req.body.body.length <= 140) {
        
        const cleanedBody = req.body.body.replaceAll(/kerfuffle|sharbert|fornax/gi, "****");


        res.status(200).send(JSON.stringify({cleanedBody}));
    }
    else if (req.body.body.length > 140) { 
        throw new Error400("Chirp is too long. Max length is 140");
    }
 
}

function middlewareErrorHandler(err: Error, req: Request, res: Response, next: Function) {
    console.log(err.message);
    res.header("Content-Type", "application/json");

    if (err instanceof Error400) {
        res.status(400).send(JSON.stringify({error: err.message}));
    }
    else if (err instanceof Error404) { 
        res.status(400).send(JSON.stringify({error: err.message}));
    }
    else {

    res.status(500).send(JSON.stringify({error:'Something went wrong on our end'}));
    }
}

app.get("/api/healthz", (req, res, next) => {
  Promise.resolve(handlerReadiness(req, res)).catch(next);
});
app.get("/admin/metrics", (req, res, next) => {
  Promise.resolve(handlerMetrics(req, res)).catch(next);
});
app.post("/admin/reset", (req, res, next) => {
  Promise.resolve(handlerResetMetrics(req, res)).catch(next);
});

app.post("/api/validate_chirp", (req, res, next) => {
  Promise.resolve(handlerValidateChirp(req, res)).catch(next);
});

app.use(middlewareErrorHandler)


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
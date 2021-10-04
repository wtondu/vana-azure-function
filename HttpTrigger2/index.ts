import { AzureFunction, Context, HttpRequest } from "@azure/functions"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request for golf score handicap.');
    const name = (req.query.name || (req.body && req.body.name));
    const scores = (req.query.scores || (req.body && req.body.scores));
    var handicap = 0;

    if (!name || !scores) {
        context.log("Name and Scores are required");
        context.res = {
            status: 400,
            body: "Name and Scores are required"
        }
        return;
    }

    // split scores and convert to Numbers
    var splitScores = scores.split(',').map(Number);

    // remove all but the last 10 scores
    splitScores = splitScores.slice(-10);

    if (splitScores.length >= 6) { // remove highest and lowest scores if # of scores >= 6
        const smallest = Math.min.apply(null, splitScores);
        let pos = splitScores.indexOf(smallest);
        splitScores.splice(pos, 1);

        const biggest = Math.max.apply(null, splitScores);
        pos = splitScores.indexOf(biggest);
        splitScores.splice(pos, 1);
    }
    // calculate average
    const average = splitScores.reduce((a, b) => a + b, 0) / splitScores.length;

    // handicap requires at least 3 scores
    if (splitScores.length >= 3) {
        handicap = (average - 72) * .9;
        if (handicap > 36) { handicap = 36; }
        if (handicap < 1) { handicap = 0; }
    }

    const responseMessage = {
        'name': name,
        'average': average.toFixed(2),
        'handicap': Math.round(handicap)
    }
    context.log(responseMessage);

    context.res = {
        status: 200,
        body: responseMessage
    };
};

export default httpTrigger;
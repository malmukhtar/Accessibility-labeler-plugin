//INITIALIZATIONS
const fetch = require('node-fetch');
const express = require('express');
const bodyParser = require('body-parser');
const { type } = require('os');
const { Console } = require('console');
const { response } = require('express');
const app = express();
app.use(bodyParser.json());
var json = require('../atlassian-connect.json');

let allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Headers', "*");
    next();
}
app.use(allowCrossDomain);



//SERVE ATLASSIAN-CONNECT.JSON
app.get('/install', (req, res) => {
    res.json(json);
});

//SERVE PLUGIN HTML
app.get("/Existing_IssueV3", (req, res) => {
    res.sendFile(__dirname + "/existing_issue_FE.htm");
})

//SERVE PLUGIN JS
app.get("/js", (req, res) => {
    res.sendFile(__dirname + "/existing_issue_FE.mjs");
})

//SERVE WARNING ICON
app.get("/warning", (req, res) => {
    res.sendFile(__dirname + "/icons/warning.png");
})

//SERVE CORRECT ICON
app.get("/correct", (req, res) => {
    res.sendFile(__dirname + "/icons/correct.png");
})

//SERVE APP ICON
app.get("/app_icon", (req, res) => {
    res.sendFile(__dirname + "/icons/app-icon.svg");
})



//SEND ISSUE DATA TO MODEL AND RECEIVE PREDICTIONS - THEN SEND PREDICTIONS TO FRONT-END
app.post('/predict', (req, res) => {
    var issue_type = req.body.issue_type;
    var title = req.body.title;
    var desc = req.body.desc; 

    var total_issue_text = title + " " + desc;
    var parsed_issue_text = total_issue_text.replaceAll(/\s/g,'%20');
    var parsed_issue_text1 = parsed_issue_text.replaceAll('"', '');

    fetch(`https://malmukhtar-accessibility-labeler.hf.space?issue=${parsed_issue_text1}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
            }
    })
    .then(response => {
        return response.text();
    })
    .then(text => {
        var prediction = JSON.parse(text);
        var label = "";
        var confidence;
        var accessibility = parseFloat(prediction["Accessibility"]);
        var naccessibility = parseFloat(prediction["Non-accessibility"]);
        if(accessibility > naccessibility){
            label = "Accessibility";
            confidence = accessibility;
        }else{
            label = "Non-accessibility";
            confidence = naccessibility;
        }
        var results = JSON.parse(JSON.stringify({"label":label, "confidence":confidence, "current_issue_type":issue_type, "accessibility": accessibility, "naccessibility": naccessibility}));
        console.log(results);
        res.json(results);
        })
    .catch(error => {
        console.log("PREDICT API ERROR: "+error);
    });
})



/*PORT LISTENING*/
const port = process.env.PORT || 8083;

app.listen(port, () => {
    console.log(`Server running on port${port}`);
});
'use strict';

// imports
var express = require('express')
var app = express()
var axios = require('axios')
var bodyParser = require('body-parser')

//configuration
app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({extended : true}));     // to support URL-encoded bodies

app.get('/', function(request, response) {
  response.send('Hello World!')
})

app.post('/', function(request, response) {
  var actionTypeArr = validateAction(request.body);

  var isBranch = actionTypeArr[0];
  var isNewIssue = actionTypeArr[1];

  if (isBranch) {
    var issueName = request.body.ref || "";
    var issueNumber = parseInt(issueName.match(/[0-9 , \.]+/g), 10);

    console.log("request issueNumber", issueNumber);
    // move issue to 'in progress' pipeline
    // moveIssue(issueNumber, "In Progress");
  }

  console.log("isBranch", isBranch);
  console.log("isNewIssue", isNewIssue);

  response.send("SUCCESS")
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})

/**
 * move issue between pipelines
 * 
 * // uri params
 * @param {int} issue_number
 * @param {int} pipelineName
 * @param {int} repo_id
 * @param {string} position (i.e. 'tp[')
 **/
function moveIssue(issue_number, pipelineName, repo_id, position) {
  // overload arguments 
  repo_id = repo_id || "130392688"
  position = position || "top"
  var access_token = "8055b53733419dd4147b42f6f9389764003173fbb7d53e469738a1abaed7335928ec6648e36579a3"

  // first get board
  var endpoint = `https://api.zenhub.io/p1/repositories/${repo_id}/board?access_token=${access_token}`
  console.log("GET " + endpoint)
  return axios.get(endpoint).then(res => {
    if (res.data && res.data.pipelines) {
      // check to see if pipeline name is in board
      var pipline_id = ""
      res.data.pipelines.forEach(p => {
        if (p.name === pipelineName) {
          pipline_id = p.id
        }
      })
      console.log(JSON.stringify(res.data.pipelines))
      // return error if pipeline not found
      if (pipline_id === "")
        return Promise.resolve({success : false, error : "could not find pipeline " + pipelineName})
      // make request to move issue
      endpoint = `https://api.zenhub.io/p1/repositories/${repo_id}/issues/${issue_number}/moves?access_token=${access_token}`
      var body = {
        pipeline_id : pipline_id,
        position : position
      }
      console.log("POST " + JSON.stringify(body, null, 2) + endpoint)
      return axios.post(endpoint, body)
      .then(res => Promise.resolve({success : true}))
      .catch(err => Promise.resolve({success : false, error : err}))
    }
    return Promise.resolve({success : false, error : "Could not get board information"})
  }).catch(res => Promise.resolve({success : false, err : res}))
}

/////////////////////////////////
// validate github action type //
/////////////////////////////////

function validateAction(data) {
  return [isNewBranch(data), isNewIssue(data)];
}
function isNewBranch(data) {
  return _isObject(data) && data.ref_type === "branch";
}

function isNewIssue(data) {
  return _isObject(data) && data.action === "opened";
}

function _isObject(obj) {
  return obj === Object(obj);
}

var express = require("express");
var app = express();

app.set("port", process.env.PORT || 5000);
app.use(express.static(__dirname + "/public"));

var bodyParser = require("body-parser");

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true
  })
);

app.get("/", function(request, response) {
  response.send("Hello World!!!");
});

var something = {
  action: "opened",
  issue: {
    id: 316368290
  }
};

app.post("/", function(request, response) {
  console.log(JSON.stringify(request.body, null, 2));
  response.send("SUCCESS");

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
});

app.listen(app.get("port"), function() {
  console.log("Node app is running at localhost:" + app.get("port"));
});

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

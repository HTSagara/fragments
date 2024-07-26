# tests/integration/lab-9-s3.hurl
# Authenticated POST to /v1/fragments with a Content-Type including a charset
POST http://localhost:8080/v1/fragments
# We're sending a plain text fragment with a charset
Content-Type: text/plain; charset=utf-8
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1
# Body of the request goes in ```...``` when it's a string
`Test S3`

HTTP/1.1 201
[Asserts]
header "Location" matches "http://localhost:8080\/v1\/fragments\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
jsonpath "$.status" == "ok"
[Captures]
url: header "Location"

# Get the fragment
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/plain; charset=utf-8
[Asserts]
body == "Test S3"

# Delete the fragment
DELETE {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.message" matches "Fragment [0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12} was deleted"

# Confirm the fragment is deleted
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 404
[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 404
jsonpath "$.error.message" == "Fragment not found"

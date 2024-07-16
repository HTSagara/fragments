# tests/integration/post-fragments-unsupported-type.hurl
# Authenticated POST to /v1/fragments with an unsupported Content-Type
POST http://localhost:8080/v1/fragments
# We're sending a plain text fragment with an unsupported Content-Type
Content-Type: application/xml
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1
# Body of the request goes in ```...``` when it's a string
`This is a fragment!`

# 1. We expect to get back an HTTP 415
HTTP/1.1 415
# Assert that the error message contains "Unsupported Media Type"
[Asserts]
jsonpath "$.error" == "Unsupported Media Type"

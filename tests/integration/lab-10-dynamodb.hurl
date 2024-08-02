# POST a new JSON fragment as an authorized user
POST http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1
Content-Type: application/json

{
  "service": "DynamoDB"
}

HTTP/1.1 201
[Asserts]
header "Location" exists
jsonpath "$.status" equals "ok"
capture fragment1_url regex "Location: (.+)\r\n"
capture fragment1_id jsonpath "$.fragment.id"

# GET the fragment info (metadata) using the Location URL
GET {{fragment1_url}}/info
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.status" equals "ok"
jsonpath "$.fragment.id" equals "{{fragment1_id}}"
jsonpath "$.fragment.type" equals "application/json"
jsonpath "$.fragment.size" equals 23


# POST a second Markdown fragment as an authorized user
POST http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1
Content-Type: text/markdown

DynamoDB is **great**.

HTTP/1.1 201
[Asserts]
header "Location" exists
jsonpath "$.status" equals "ok"
capture fragment2_url regex "Location: (.+)\r\n"
capture fragment2_id jsonpath "$.fragment.id"

# GET the fragment info (metadata) for the second fragment
GET {{fragment2_url}}/info
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.status" equals "ok"
jsonpath "$.fragment.id" equals "{{fragment2_id}}"
jsonpath "$.fragment.type" equals "text/markdown"
jsonpath "$.fragment.size" equals 20

# GET all fragments without expanding (just IDs)
GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.status" equals "ok"
jsonpath "$.fragments" contains "{{fragment1_id}}"
jsonpath "$.fragments" contains "{{fragment2_id}}"

# DELETE the first fragment
DELETE {{fragment1_url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.status" equals "ok"

# Try to GET the first fragment again (should return 404)
GET {{fragment1_url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 404
[Asserts]
jsonpath "$.status" equals "error"

# GET all fragments without expanding (check first fragment is deleted)
GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.status" equals "ok"
jsonpath "$.fragments" not contains "{{fragment1_id}}"
jsonpath "$.fragments" contains "{{fragment2_id}}"

# *********** 1. POST a new JSON fragment  ***********
POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
user1@email.com:password1
`{"service": "DynamoDB"}`

# *********** 2. Confirm that the server returns a 201  ***********
HTTP/1.1 201
[Asserts]
header "Location" matches "http://localhost:8080\/v1\/fragments\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
jsonpath "$.status" == "ok"
[Captures]
fragment1_url: header "Location"
fragment1_id: jsonpath "$.fragment.id"

# *********** 3. GET the fragment info (metadata) for the first fragment ***********
GET {{fragment1_url}}/info
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == "{{fragment1_id}}"
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString

# *********** 4. POST a second Markdown fragment ***********
POST http://localhost:8080/v1/fragments
Content-Type: text/markdown
[BasicAuth]
user1@email.com:password1
`DynamoDB is **great**.`

# *********** 5. Confirm that the server returns a 201 ***********
HTTP/1.1 201
[Asserts]
header "Location" matches "http://localhost:8080\/v1\/fragments\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
jsonpath "$.status" == "ok"
# capture the Location header value and the second id in variables named fragment2_url and fragment2_id
[Captures]
fragment2_url: header "Location"
fragment2_id: jsonpath "$.fragment.id"

# *********** 6. GET the fragment info (metadata) for the second fragment ***********
GET {{fragment2_url}}/info
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == "{{fragment2_id}}"
jsonpath "$.fragment.type" == "text/markdown"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString

# *********** 7. GET all fragments ***********
GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragments[*]" includes "{{fragment1_id}}"
jsonpath "$.fragments[*]" includes "{{fragment2_id}}"

# *********** 8. DELETE the first fragment ***********
DELETE {{fragment1_url}}
[BasicAuth]
user1@email.com:password1

# *********** 9. Confirm that the server returns a 200 ***********
HTTP/1.1 200

# *********** 10. Try to GET the first fragment again using the url you captured ***********
GET {{fragment1_url}}
[BasicAuth]
user1@email.com:password1


# ***********11. Confirm that the server returns a 404 ***********
HTTP/1.1 404

# *********** 12. GET all fragments again ***********
GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragments[*]" not includes "{{fragment1_id}}"
jsonpath "$.fragments[*]" includes "{{fragment2_id}}"

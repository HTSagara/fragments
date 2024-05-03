# Lab 1

- Initial setup of the back-end microservice project.

## Software required:

- Node.js
- VSCode
- ESLint
- git
- curl
- Prettier - Code Formatter (opptional)
- Code Spell Checker (optional)

## Initializing the system

- Run `eslint` to check for errors to be fixed:

```
npm run lint
```

- Start the server by using the commands below:

```
npm start
npm run dev
```

- The debug script allows you to connect a debugger

```
npm run debug
```

Reference to the links below:

https://code.visualstudio.com/docs/editor/debugging

https://code.visualstudio.com/docs/nodejs/nodejs-debugging

- Open in the browser the http://localhost:8080 or use `curl http://localhost:8080` and check for the json below:

```
{
"status": "ok",
"author": "Henrique Toshio Sagara",
"githubUrl": "https://github.com/HTSagara/fragments",
"version": "0.0.1"
}
```

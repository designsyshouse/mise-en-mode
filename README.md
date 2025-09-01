# Mise en Mode

Infrastructure code support for Mise en Mode

Meant to be used with the book Mise en Mode by [Donnie D'Amato](https://donnie.damato.design).

## Components

This doesn't hold components, but represents where you might consider holding them. This is where the interoperable token file `_tokens.module.scss` is held. This allows the authorship of tokens to be identical between SCSS and JS ecosystems.

```scss
@use '../tokens.module';

button:where([data-priority="primary"]) {
    background-color: tokens.$action_primary_backgroundColor;
}
```

```jsx
import tokens from './_tokens.module.scss';

function PrimaryButton(props) {
  return (
    <button
        {...props}
        style={{ 
            backgroundColor: tokens.$action_primary_backgroundColor
        }}/>
  );
}
```

## Infrastructure

Holds the files responsible for generating resources for the system.

- `bootstrap-mode.js` writes a `newmode.yml` template to be filled in with values.
- `get-interop.js` creates the `_tokens.module.scss` data.
- `get-inventory.js` creates the inventory of modes for later lifecycle management.
- `get-schema.js` creates the mode YAML schema data.
- `intents.yml` the list of intents expected in the system.
- `paths.js` the collection of paths to important directories/files.
- `to-list.js` a shared utility to stringify a collection of data.
- `to-var.js` a shared utility to convert intents into CSS Custom Properties.
- `write-files.js` writes all of the resulting files.

## Modes

This directory holds all the modes represented as YAML, most likely created by executing the `bootstrap-mode.js` file. It also holds the `_schema.json` which validates the mode YAML schema.

## Public

The represents the public directory for your project, as all files here should be hosted and available to a webpage. This will include the `.css` files generated from the mode YAML, and the `_inventory.json` used to look up `href` paths and other metadata.

## `mode-manager.js`

This resource is meant to manage how modes are introduced onto the page. It has the ability to render the mode CSS on the server (if used in SSR) and on the client. This is important as modes may be introduced throughout the lifecycle of the page through dynamic means.

While located within the `/public` folder and is being executed on the client, this code is written to be [isomorphic](https://en.wikipedia.org/wiki/Isomorphic_JavaScript). This means that if your project is server-side rendered in a JavaScript ecosystem, you could instead execute this function to produce the necessary HTML resources for insertion into the `<head/>` of the page.

```js
// server.js
import express from "express";
import { modeManager } from '.'; // your org infra

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <title>Minimal HTML Example</title>
        ${modeManager()}
      </head>
      <body>
        <h1>Hello world</h1>
      </body>
    </html>
  `;

  res.send(html);
});

// Serve static files like style.css and script.js
app.use(express.static("public"));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

```
This will immediately write the HTML resources that would otherwise be appended to the `<head/>` on the client. Otherwise, place the `mode-manager.js` in a `/public`-like directory and use as a module. Resources will be added dynamically on page load.

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8"/>
        <title>Minimal HTML Example</title>
        <script type="module" src="mode-manager.js"></script>
    </head>
    <body>
        <h1>Hello world</h1>
    </body>
</html>
```

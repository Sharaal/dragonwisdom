Homepage: https://dragonwisdom.sharaal.de

# DragonWisdom

Create HTML documentation files that are AI-agent friendly, semantically optimized, and token-efficient, while also providing a clear, visually structured presentation designed to communicate information effectively to human readers.

## The Idea Behind It

Anthropic proposed moving away from Markdown files toward HTML files in order to provide more structured information in repositories.

However, this is not a simple or self-evident decision. Compared to Markdown, HTML has both advantages and disadvantages.

### Pros

* Semantic HTML improves how AI agents understand and process information.
* More information can be presented in a visually structured, human-friendly way.
* HTML enables many more presentation features. For example, GitHub supports Mermaid natively in Markdown, which is useful. With HTML, however, you can provide exactly the features you need to present your information in the best possible way.

### Cons

* Token usage can increase significantly, especially when using tools such as Tailwind CSS, which can make HTML very verbose.
* Writing HTML manually is not as easy as writing Markdown.

## The Implementation: DragonWisdom

To address these drawbacks, I researched an AI-first solution: documentation that is optimized for AI agents without compromising the reading experience for humans.

* The HTML uses only the minimum elements needed for clear semantics and reduced token usage.
* Tailwind CSS is used as the foundation for styling, but it is abstracted into custom CSS.
* Powerful human-focused features, such as sortable tables, Save button and Mermaid support, are available as opt-in features.
* JavaScript is entirely optional.

## How to Use It

### Store the File

Visit https://dragonwisdom.sharaal.de, press Ctrl+S, or click `Save`, then save and use the file.

### Skill

Soon, there will be a skill that makes it easy to write and update pages with AI agents.

### Use It Manually

1. Reference the CSS: `<link rel="stylesheet" href="https://releases.dragonwisdom.sharaal.de/{version}/dragonwisdom.css">` 
2. Reference the JavaScript (optional): `<script src="https://releases.dragonwisdom.sharaal.de/{version}/dragonwisdom.js"></script>`
3. Write the HTML as described in the documentation at https://dragonwisdom.sharaal.de/

## Build Locally

1. Clone the repository.
2. Install dependencies via `npm i`.
3. Start the server via `npm run dev` and open the page in the browser.
4. Build the static artifacts via `npm run build`, they will be available in `dist/public`.

## Questions or Feedback?

Contact me at [dragonwisdom@sharaal.de](mailto:dragonwisdom@sharaal.de) or Discord `sharaal`.


# MongoScraper
    MongoScraper is a full stack application that allows a person to scrape from NPR's news website, add to the saved section, and then add notes to the saved articles. 

## How it Works
    * User can click scrape button, it will show results with buttons to view article on original page. 
    * If the click save button for a specific article, it will move into the saved section. 
    * If the user clicks new note, it will pop open a box to add a note about the article. 
    * The user may add more than one note, or delete it. When adding a note, the note saves to the database and links to that article. 

## Installation
    npm install
    npm install express morgan mongoose axios cheerio

## Bugs
    * Was unable to get the form to clear when user adds new note
    * Attempted to add a saved boolean to the article object, but when saving the article, the boolean would not update from true to false. If I was able to get this working, I would have the page already display any scraped or saved articles on load. 

## Future Improvements
    * Add a remove button from saved articles.
    * Add a clear button from the scraped articles.
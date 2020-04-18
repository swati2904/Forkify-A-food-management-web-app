/* -----------starter--------
// export default 'I am an exported string.';
*/

// building the search model...
import axios from 'axios';


export default class Search {
    constructor(query) {
        this.query = query;
    }
    // every async function is automatically return a promise.
    async getResults() {
        try {
            const res = await axios(`https://forkify-api.herokuapp.com/api/search?q=${this.query}`);
            this.result = res.data.recipes;
        } catch (error) {
            alert(error);
        }
    }
}
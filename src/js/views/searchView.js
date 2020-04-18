/*-----------starter--------
// export const add = (a, b) => a + b;
// export const mul = (a, b) => a * b;
// export const ID = 23;
*/

import { elements, renderLoader } from './base';

// have access of typing address
export const getInput = () => {
    return elements.searchInput.value;
};

export const clearInput = () => {
    elements.searchInput.value = '';
};

export const clearResults = () => {
    elements.searchResList.innerHTML = '';
    elements.searchResPages.innerHTML = '';
};

export const highlightSelected = id => {
    const resultsArr = Array.from(document.querySelectorAll('.results__link'));
    resultsArr.forEach(el => {
        el.classList.remove('results__link--active');
    });
    document.querySelector(`.results__link[href="#${id}"]`).classList.add('results__link--active');
};



// whenever the content is more than one line then adjust it into 3 dots..

export const limitRecipeTitle = (title, limit = 17) => {
    const newTitle = [];
    if (title.length > limit) {
        title.split(' ').reduce((acc, curr) => {
            if (acc + curr.length <= limit) {
                newTitle.push(curr);
            }
            return acc + curr.length;
        }, 0);   //initial value of accum. 
        return `${newTitle.join(' ')}...)`
    }
    return title;
}


const renderRecipe = recipe => {
    const markup = `
    <li>
    <a class="results__link" href="#${recipe.recipe_id}">
        <figure class="results__fig">
            <img src="${recipe.image_url}" alt="${recipe.title}">
        </figure>
        <div class="results__data">
            <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
            <p class="results__author">${recipe.publisher}</p>
        </div>
    </a>
</li>
`;
    elements.searchResList.insertAdjacentHTML('beforeend', markup);
};

// prev or next........
const createButton = (page, type) => `
<button class="btn-inline results__btn--${type}"  data-name=${"Saurav"} data-goto = ${type === 'prev' ? page-1 : page+1} data-">
<span>Page ${type === 'prev' ? page-1 : page+1}</span>
    <svg class="search__icon">
        <use href="img/icons.svg#icon-triangle-${type === 'prev'? 'left':'right'}"></use>
    </svg>
   
</button>
`;
            

const renderButtons = (page, numResults, resPerPage) => {


    const pages = Math.ceil(numResults / resPerPage);

    let button;
    if (page === 1 && pages > 1) {
        //button go to next page 
        button = createButton(page, 'next');
        
    }
    else if (page < pages) {
        //Both buttons
        button = `
        ${createButton(page, 'prev')}
        ${createButton(page, 'next')}
        `;
    }
    else if (page === pages && pages > 1) {
        // only to go to prev page
        button = createButton(page, 'prev');

    }
    
    elements.searchResPages.insertAdjacentHTML('afterbegin', button);
};

export const renderResults = (recipes, page = 2, resPerPage = 10) => {
    //render results of current page
    const start = (page - 1) * resPerPage;
    const end = page * resPerPage;


    recipes.slice(start, end).forEach(renderRecipe);

    //render pagination
    renderButtons(page, recipes.length, resPerPage);
}
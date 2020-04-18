/*-----------starter--------
// import str from './models/Search';
// //import {add as a, mul as m , ID} from './views/searchView';
// import * as searchView from './views/searchView';
// //console.log(`Using imported function  ${a(ID, 2)} and ${m(3, 5)}. ${str}`);
// console.log(`Using imported function  ${searchView.add(searchView.ID, 2)} and ${searchView.mul(3, 5)}. ${str}`);
*/

import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';

/* Global state 
- search object
- current recipe object
- shopping list object
- liked recipe
*/

/* -------------------------------------------------------------------------------------------*/
/* ------------------------------------* SEARCH CONTROLLER *----------------------------------*/
/* ------------------------------------------------------------------------------------------*/


const state = {};
window.state = state;

const controlSearch = async () => {
    //1. get query from view

    /*
        // DOM(search input value) acecss.
        const query = document.querySelector('.search__field').value ;
    */
    const query = searchView.getInput();

    // query = document.querySelector('.search__field').value

    if (query) {
        //2. new serach object and added to the state
        state.search = new Search(query);

        // 3. prepare UL for result
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {

            // 4. search for recipes
            await state.search.getResults();

            //5. render result on UI.

            clearLoader();

            searchView.renderResults(state.search.result);
        } catch (err) {
            alert('Something wrong with search');

        }
    }
}
document.querySelector('.search').addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

//testing
// window.addEventListener('load', e => {
//     e.preventDefault();
//     controlSearch();
// });

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');

    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }


});

const search = new Search('pizza');
search.getResults();


/* -------------------------------------------------------------------------------------------*/
/* ------------------------------------* RECIPE CONTROLLER *----------------------------------*/
/* ------------------------------------------------------------------------------------------*/

// const r = new Recipe(46892);
// r.getRecipe();  

const controlRecipe = async () => {
    // get id from URL
    const id = window.location.hash.replace('#', '');

    if (id) {
        //prepare UI for changes
        
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // highlight selected earch item
        if(state.search) searchView.highlightSelected(id);

        //create new recipe object
        state.recipe = new Recipe(id);

        // testing
        // window.r = state.recipe;

        try {
            // get recipe data and parse ingredient
            await state.recipe.getRecipe();
            
            state.recipe.parseIngredients();

            //calculate serving and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            //Render recipe
            
            clearLoader();
            
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
                );
        } catch (err) {
            alert('error processing recipe !')
        }


    }
};


// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));


/* -------------------------------------------------------------------------------------------*/
/* ------------------------------------* LIST CONTROLLER *----------------------------------*/
/* ------------------------------------------------------------------------------------------*/

const controlList = () => {
    // Create a new list IF there in none yet
    if (!state.list) state.list = new List();

    //Add each ingredient to the list and UI
    let ingRev = state.recipe.ingredients;
    // let l=0;
    // let r=ingRev.length-1;

    // // Reverse the list
    // while(l<r){
    //     let tmp = ingRev[l];
    //     ingRev[l]=ingRev[r];
    //     ingRev[r]=tmp;
    //     l++;
    //     r--;
    // }

    ingRev.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

// Handle delete and update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;
    
    // Handle the delete button
    // return the true false value
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // Delete from state

        state.list.deleteItem(id);
       
        // Delete from UI
        listView.deleteItem(id);

    // Handle the count update
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});

/* -------------------------------------------------------------------------------------------*/
/* ------------------------------------* LIKES CONTROLLER *----------------------------------*/
/* ------------------------------------------------------------------------------------------*/

const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    // User has NOT yet liked current recipe
    if (!state.likes.isLiked(currentID)) {
        // Add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        // Toggle the like button
        likesView.toggleLikeBtn(true);

        // Add like to UI list
        likesView.renderLike(newLike);

    // User HAS liked current recipe
    } else {
        // Remove like from the state
        state.likes.deleteLike(currentID);

        // Toggle the like button
        likesView.toggleLikeBtn(false);

        // Remove like from UI list
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};

// Restore liked recipes on page load
window.addEventListener('load', () => {
    state.likes = new Likes();
    
    // Restore likes
    state.likes.readStorage();

    // Toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    // Render the existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});

// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        // Decrease button is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        // Increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        // Add ingredients to shopping list
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        // Like controller
        controlLike();
    }
});




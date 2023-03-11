/** API Request functions **/

async function apiFetch(path, options = { headers : { accept: 'application/json' }}) {
    const req = await fetch(`http://localhost:5678/api/${path}`, options);
    const data = await req.json();

    return data;
}

/** Filter function */

function filterCategory(categoryId) {
    const galleryFigures = Array.from(document.querySelectorAll('.gallery figure'));
    const categoriesFilter = Array.from(document.querySelectorAll('.gallery-filter ul li button'));

    for(let galleryFigure of galleryFigures) {
        const galleryCategory = galleryFigure.getAttribute('category-id');
        galleryFigure.style.display = galleryCategory == categoryId || categoryId == -1 ? 'block' : 'none';
    }
    
    for(let categoryFilter of categoriesFilter) {
        const filterCategoryId = categoryFilter.getAttribute('category-id');
        if (filterCategoryId == categoryId) {
            categoryFilter.classList.add('active');
        } else {
            categoryFilter.classList.remove('active');
        }
    }
}

/** Main App Function */
async function initializeProject() {
    const gallery = document.querySelector('.gallery');
    const galleryFilter = document.querySelector('.gallery-filter ul');

    const worksData = await apiFetch('works');
    const backendCategoriesData = await apiFetch('categories');

    const categoriesData = [
        {
            "id" : -1,
            "name": "Tous"
        },
        ...backendCategoriesData,
    ];
    let activeFilterId = -1;

    for (let work of worksData) {
        const workFigure = document.createElement('figure');
        workFigure.setAttribute('category-id', work.categoryId);
        const workImage = document.createElement('img');
        workImage.src = work.imageUrl;
        workImage.alt = work.title;

        
        const workFigCaption = document.createElement('figcaption');
        workFigCaption.innerText = work.title;

        workFigure.appendChild(workImage);
        workFigure.appendChild(workFigCaption);

        gallery.appendChild(workFigure);
    }

    for (let category of categoriesData) {
        const categoryLi = document.createElement('li');
        const categoryButton = document.createElement('button');

        categoryButton.innerText = category.name;
        categoryButton.setAttribute('category-id', category.id);

        if (activeFilterId === category.id) {
            categoryButton.classList.add('active');
        }

        categoryButton.onclick = () => {
            filterCategory(category.id);
        }

        categoryLi.appendChild(categoryButton);
        galleryFilter.appendChild(categoryLi);
    }
}


window.onload = () => {
    initializeProject();
}
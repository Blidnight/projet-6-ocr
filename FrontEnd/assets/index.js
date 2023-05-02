/** API Request functions **/

let modalOpen = '';


async function apiFetch(path, options = { headers : { accept: 'application/json' }}) {
    const req = await fetch(`http://localhost:5678/api/${path}`, { 
        ...options,
        headers: {
            accept: 'application/json',
            authorization: `Bearer ${window.localStorage.getItem('usertoken')}`,
            ...(options.headers ?? {}),
        }
    });
    
    try {
        const data = await req.json();
        return data;
    } catch (e) {
        return { message : 'no response '};
    }
    
}

const MODAL_HTML_STRUCTURE = `
    <div class="modal">
        <div class="modal-actions">
            <div class="modal-back-button">
                <i class="fa-solid fa-arrow-left"></i>
            </div>
            <div class="modal-close-button"><i class="fa-solid fa-xmark"></i></div>
        </div>
        <div class="modal-body">
            <h2 class="modal-title">Modal Title</h2>
            <div class="modal-content">
                
            </div>
            <div class="modal-body-actions">
                
            </div>
        </div>
    </div>
`;


async function openModal(modalName) {
    const modalInPage = document.querySelector('.modal-backdrop');
    if (modalInPage !== null) {
        modalInPage.remove();
    }

    if (modalName === 'home') {
        const modal = document.createElement('div');
        modal.classList.add('modal-backdrop');
        modal.innerHTML = MODAL_HTML_STRUCTURE;
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        }

        const modalCloseButton = modal.querySelector('.modal-close-button');
        modalCloseButton.onclick = () => {
            modal.remove();
        }
        const modalBackButton = modal.querySelector('.modal-back-button');
        modalBackButton.style.visibility = 'hidden';

        const modalTitle = modal.querySelector('h2.modal-title');
        modalTitle.textContent = 'Galerie photo';

        document.body.appendChild(modal);

        const worksData = await apiFetch('works');
        const modalContent = modal.querySelector('.modal-content');
        const modalBodyActions = modal.querySelector('.modal-body-actions');

        modalBodyActions.innerHTML = `
            <button class="modal-button-primary" id="addPhotoBtn">Ajouter une photo</button>
            <button class="modal-button-secondary">Supprimer la galerie</button>
        `;

        const addPhotoBtn = modalBodyActions.querySelector('#addPhotoBtn');
        addPhotoBtn.onclick = () => {
            openModal('add-photo');
        }
        const galleryPhotos = document.createElement('div');
        galleryPhotos.classList.add('gallery-photos');
        modalContent.appendChild(galleryPhotos);

        const GALLERY_PHOTO_STRUCTURE = `
            <div class="gallery-photo-actions">
                <div class="move"><i class="fa-solid fa-up-down-left-right"></i></div>
                <div class="delete"><i class="fa-solid fa-trash"></i></div>
            </div>
            <div class="gallery-image">
                <img src="" alt="">
            </div>
            <div class="edit">éditer</div>
        `;

        for (let work of worksData) {
            const galleryPhoto = document.createElement('div');
            galleryPhoto.classList.add('gallery-photo');
            galleryPhoto.innerHTML = GALLERY_PHOTO_STRUCTURE;
            const deleteButton = galleryPhoto.querySelector('.gallery-photo-actions .delete');
            const galleryImage = galleryPhoto.querySelector('.gallery-image img');
            galleryImage.src = work.imageUrl;
            galleryImage.alt = work.title;

            deleteButton.onclick = async () => {
                await apiFetch('works/' + work.id, {
                    method: 'delete',
                });
                galleryPhoto.remove();
                await initializeProject();
            }
            galleryPhotos.appendChild(galleryPhoto);
        }
    } else if (modalName === 'add-photo') {
        const modal = document.createElement('div');
        modal.classList.add('modal-backdrop');
        modal.innerHTML = MODAL_HTML_STRUCTURE;
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        }

       

        const modalCloseButton = modal.querySelector('.modal-close-button');
        modalCloseButton.onclick = () => {
            modal.remove();
        }
        const modalBackButton = modal.querySelector('.modal-back-button');
        modalBackButton.onclick = () => {
            openModal('home');
        }

        const modalTitle = modal.querySelector('h2.modal-title');
        modalTitle.textContent = 'Ajout Photo';

        document.body.appendChild(modal);

        const backendCategoriesData = await apiFetch('categories');

        const modalContent = modal.querySelector('.modal-content');
        const modalBodyActions = modal.querySelector('.modal-body-actions');
        modalBodyActions.innerHTML = `
            <button id='submit-form-button' class="modal-button-primary disabled">Valider</button>
        `;

        const MODAL_FORM_STRUCTURE = `
            <form id="upload-form">
                <div class="file-upload">
                    <div class="file-upload-form">
                        <img src="./assets/icons/image-upload.svg" alt="image-upload">
                        <input type="file" id="file-input" accept="image/png, image/gif, image/jpeg" />
                        <button class="btn">+ Ajouter photo</button>
                        <p>jpg, png: 4mo max</p>
                    </div>
                    <div class="file-upload-preview">
                        <img src="./assets/icons/image-upload.svg" alt="image-upload">
                    </div>
                </div>
                <label for="email">Titre</label>
                <input type="text" name="titre" id="titre">
                <label for="email">Catégorie</label>
                <select id='categories-select'>

                </select>
            </form>
        `;

        modalContent.innerHTML = MODAL_FORM_STRUCTURE;
        const uploadForm = modal.querySelector('#upload-form');
        uploadForm.addEventListener('submit', (e) => {
            e.preventDefault();
        })

        const fileUploadForm = modalContent.querySelector('.file-upload-form');
        const fileUploadPreview = modalContent.querySelector('.file-upload-preview');
        
        const fileInputField = modalContent.querySelector('.file-upload input');
        const fileUploadButton = modalContent.querySelector('.file-upload button.btn');
        const fileImageElement = modalContent.querySelector('.file-upload-preview img');

        const categoriesSelect = modalContent.querySelector('#categories-select');
        const imageNameInput = modalContent.querySelector('input#titre');
        const formSubmitButton = modal.querySelector('button#submit-form-button');
        formSubmitButton.disabled = true;

        for(let i = 0; i < backendCategoriesData.length; i += 1) {
            let categoryData = backendCategoriesData[i];
            let option = document.createElement('option');
            option.value = categoryData.id;
            option.textContent = categoryData.name;
            categoriesSelect.appendChild(option);
        }
        categoriesSelect.value = backendCategoriesData[0].id;


        fileUploadButton.onclick = () => {
            fileInputField.dispatchEvent(new MouseEvent('click'));
        }

        let imageFile;
        let imageTitle = '';
        let imageCategory = categoriesSelect.value;

        const validateFormData = () => {
            if (
                (imageFile !== undefined && imageFile !== null) &&
                (imageTitle !== '') &&
                imageCategory !== undefined
            ) {
                formSubmitButton.classList.remove('disabled');
                formSubmitButton.disabled = false;
            } else {
                formSubmitButton.classList.add('disabled');
                formSubmitButton.disabled = true;
            }
        }

        fileInputField.onchange = (e) => {
            if (e.target.files.length > 0) {
                imageFile = e.target.files[0];
                fileImageElement.src = URL.createObjectURL(imageFile);
                fileUploadForm.style.display = 'none';
                fileUploadPreview.style.display = 'flex';
            }
            validateFormData();
        }

        categoriesSelect.onchange = (e) => {
            imageCategory = e.target.value;
            validateFormData();
        }

        imageNameInput.onkeydown = imageNameInput.onchange =  (e) => {
            imageTitle = e.target.value;
            validateFormData();
        }

        formSubmitButton.onclick = async () => {
            formSubmitButton.disabled = true;
            const formData = new FormData();
            formData.append('image', imageFile);
            formData.append('title', imageTitle);
            formData.append('category', parseInt(imageCategory));
            await apiFetch('works', {
                method: 'post',
                body: formData,
            });
            await initializeProject();
            modal.remove();

        }

        

        document.body.appendChild(modal);
    }
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

function setupAdminView() {
    if (window.localStorage.getItem('usertoken') !== null) {
        /** add edit-mode className to the header */
        const header = document.querySelector('header');
        header.classList.add('edit-mode');
        /** display the edit-actions top */
        const editActions = document.querySelector('#edit-mode-action');
        editActions.style.display = 'flex';
        /** setup logout button */
        const loginLink = document.querySelector('a#loginLink');
        loginLink.href='#';
        loginLink.innerText='logout';
        loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.localStorage.removeItem('usertoken');
            window.location.reload();
        })

        const editButtons = Array.from(document.querySelectorAll('span.edit-button'));
        for (let i = 0; i < editButtons.length; i += 1) {
            editButtons[i].onclick = () => {
                openModal('home');
            }
        }

        /** hide galery filter */
        const galleryFilter = document.querySelector('.gallery-filter ul');
        galleryFilter.style.display = 'none';

        const galleryTitle = document.querySelector('#portfolio h2');
        galleryTitle.style.marginTop = '100px';
        galleryTitle.style.marginBottom = '90px';
        
    } else {
         /** Hide edit option */
        const editButtons = Array.from(document.querySelectorAll('span.edit-button'));
        editButtons.forEach(editButton => {
            editButton.style.display = 'none';
        })
    }
}

/** Main App Function */
async function initializeProject() {
    setupAdminView();

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

    gallery.innerHTML = '';

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

    galleryFilter.innerHTML = '';
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
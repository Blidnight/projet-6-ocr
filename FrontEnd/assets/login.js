/** API Utils */
async function apiFetch(path, options = { headers : { accept: 'application/json' }}) {
    const req = await fetch(`http://localhost:5678/api/${path}`, options);
    if (!req.ok) throw new Error('Erreur dans la requête');
    const data = await req.json();

    return data;
}


async function login(e) {
    e.preventDefault();
    const email = document.querySelector('input#email').value;
    const password = document.querySelector('input#password').value;
    const feedback = document.querySelector('#login p.feed-back');

    if (email === '' || password === '') {
        feedback.innerText = 'Tous les champs du formulaire doivent être remplies.';
        return;
    }

    try {
        const data = await apiFetch('users/login', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'accept': 'application/json',
            },
            body: JSON.stringify({
                email,
                password
            })
        })

        if (data.userId !== undefined && data.token !== undefined) {
            window.localStorage.setItem('usertoken', data.token);
            window.location.href="./index.html";
        }

    } catch (e) {
        feedback.innerText = 'Erreur dans l’identifiant ou le mot de passe.'
    }
}

window.onload = () => {
    const loginForm = document.querySelector('#login form');
    loginForm.addEventListener('submit', login)
    if (window.localStorage.getItem('usertoken') !== null) {
        window.location.href="./index.html";
    }
}
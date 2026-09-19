// ============================================================
//  MurFood — скрипт сайта
//
//  Один файл работает сразу на всех страницах.
//  Поэтому перед каждым куском мы проверяем: есть ли на этой
//  странице нужная кнопка? Если её нет — кусок просто пропускается.
// ============================================================


// ============================================================
//  1. КНОПКА «НАЗАД» (есть на menu, shop, profile, about)
// ============================================================

let backButton = document.querySelector('.back-btn');

if (backButton) {
    backButton.addEventListener('click', function () {
        history.back();
    });
}


// ============================================================
//  2. СТРАНИЦА MENU: КНОПКА «USE» КЛАДЁТ ТОВАР В КОРЗИНУ
// ============================================================

let useButtons = document.querySelectorAll('.use-btn');

if (useButtons.length > 0) {
    useButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            // Находим карточку, внутри которой нажали кнопку
            let card = button.closest('.cart-menu');

            let title = card.querySelector('.p-menu1').textContent;
            let priceText = card.querySelector('.p-menu2').textContent;
            let imgSrc = card.querySelector('.first-part img').getAttribute('src');

            // В тексте цены написано «16$». Убираем знак $ и превращаем в число.
            let price = Number(priceText.replace('$', ''));

            // Собираем карточку товара — объект с подписями
            let product = {
                title: title,
                price: price,
                img: imgSrc,
                count: 1
            };

            let cart = readCart();

            // Ищем, не лежит ли такой товар в корзине уже
            let sameProduct = cart.find(function (item) {
                return item.title === product.title;
            });

            if (sameProduct) {
                sameProduct.count = sameProduct.count + 1;
            } else {
                cart.push(product);
            }

            saveCart(cart);
            let shopImage = document.querySelector(".imagee")
            if (shopImage) {
                shopImage.classList.add("shake");
                setTimeout(function () {
                   shopImage.classList.remove("shake");
                }, 1000);
            }


            // Страницу больше не перезагружаем, поэтому нужно показать,
            // что клик сработал: на секунду меняем надпись и цвет кнопки.
            // Так можно спокойно набрать сразу несколько товаров.
            button.textContent = 'ok!';
            button.classList.add("added");

            setTimeout(function () {
                button.textContent = 'use';
                button.classList.remove("added");
            }, 1000);
        });
    });
}


// ============================================================
//  3. ПАМЯТЬ КОРЗИНЫ
//
//  localStorage — это память браузера. Она умеет хранить
//  только текст, поэтому массив мы превращаем в текст и обратно.
// ============================================================

function readCart() {
    let saved = localStorage.getItem('cart');

    if (!saved) {
        return [];
    }

    return JSON.parse(saved);
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}


// ============================================================
//  4. СТРАНИЦА SHOP: ПОКАЗЫВАЕМ КОРЗИНУ И СЧИТАЕМ СУММУ
// ============================================================

let foodGrid = document.querySelector('.food-grid');
let buyAllButton = document.querySelector('.buy-all-btn');

if (foodGrid) {

    // Рисует корзину заново: и при загрузке страницы, и после удаления
    function showCart() {
        let cart = readCart();

        // Сначала стираем всё старое, чтобы товары не задвоились
        foodGrid.innerHTML = '';

        if (cart.length === 0) {
            foodGrid.innerHTML = '<p class="empty-cart-text">Your cart is empty</p>';
            buyAllButton.textContent = 'buy all (0$)';
            return;
        }

        let totalPrice = 0;

        for (let i = 0; i < cart.length; i++) {
            let product = cart[i];
            let itemPrice = product.price * product.count;

            totalPrice = totalPrice + itemPrice;

            foodGrid.insertAdjacentHTML('beforeend', `
                <div class="cart-menu" data-index="${i}">
                    <div class="first-part">
                        <p class="p-menu1">${product.title} (x${product.count})</p>
                        <div class="white-background-imgo">
                            <img src="${product.img}" alt="${product.title}">
                        </div>
                    </div>
                    <div class="second-part">
                        <button class="delete-btn">delete</button>
                        <p class="p-menu2">${itemPrice}$</p>
                    </div>
                </div>
            `);
        }

        buyAllButton.textContent = `buy all (${totalPrice}$)`;

        // Кнопки delete только что появились на странице,
        // поэтому обработчики вешаем на них именно сейчас.
        addDeleteButtons();
    }

    function addDeleteButtons() {
        let deleteButtons = document.querySelectorAll('.delete-btn');

        deleteButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                let card = button.closest('.cart-menu');

                // getAttribute всегда возвращает текст, поэтому нужен Number
                let index = Number(card.getAttribute('data-index'));

                let cart = readCart();

                // Убираем из массива один товар, начиная с номера index
                cart.splice(index, 1);

                saveCart(cart);
                showCart();
            });
        });
    }

    // Кнопка «buy all»: спасибо за заказ и очищаем корзину
    buyAllButton.addEventListener('click', function () {
        let cart = readCart();

        if (cart.length > 0) {
            alert('Thank you for your order!');
            localStorage.removeItem('cart');
            showCart();
        }
    });

    // Показываем корзину сразу при открытии страницы
    showCart();
}


// ============================================================
//  5. КАРТОЧКИ ЕДЫ ПОЯВЛЯЮТСЯ ПРИ ПРОКРУТКЕ
// ============================================================

let foodCards = document.querySelectorAll('.carts-menu-food .cart-menu');

if (foodCards.length > 0) {
    let watcher = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                watcher.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    foodCards.forEach(function (card) {
        watcher.observe(card);
    });
}


// ============================================================
//  6. СТРАНИЦА LOGIN: ФОРМЫ ВХОДА И РЕГИСТРАЦИИ
// ============================================================
let loginForm = document.querySelector('.login-form');

if (loginForm) {

    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();

        let login = document.querySelector('#login-login').value.trim();
        let password = document.querySelector('#login-password').value.trim();

        let message = loginForm.querySelector('.form-msg');
        message.textContent = 'логин: ' + login + ', пароль: ' + password;
        if (login === '' || password === '') {
            message.textContent = 'Заполни оба поля';
            return;
        }
    });
    
}


let registerForm = document.querySelector('.register-form');

if (registerForm) {

    registerForm.addEventListener('submit', function (event) {
        event.preventDefault();

        let login = document.querySelector('#reg-login').value.trim();
        let password = document.querySelector('#reg-password').value.trim();
        let name = document.querySelector('#reg-name').value.trim();

        let message = registerForm.querySelector('.form-msg');

        if (login === '' || password === '' || name === '') {
            message.textContent = 'Заполни все поля';
            return;
        }
        if (login.length < 3) {
            message.textContent = 'Логин слишком короткий';
            return;
        }

        if (password.length < 4) {
            message.textContent = 'Пароль слишком короткий';
            return;
        }

        let users = readUsers();

        let taken = users.some(function (u) {
            return u.login === login;
        });

        if (taken) {
            message.textContent = 'Такой логин уже есть, придумай другой';
            return;
        }

        users.push({
            login: login,
            password: password,
            name: name,
            about: '',
            avatar: 'src/profileP.png',
            money: 100,
            cart: [],
            orders: []
        });

        saveUsers(users);

        message.textContent = 'Профиль создан! Теперь войди';
        registerForm.reset();
    });

}




// ============================================================
//  7. ПАМЯТЬ ПОЛЬЗОВАТЕЛЕЙ
// ============================================================


function readUsers() {
    let saved = localStorage.getItem('murfood:users');

    if (!saved) {
        return [];
    }

    return JSON.parse(saved);
}

function saveUsers(users) {
    localStorage.setItem('murfood:users', JSON.stringify(users));
}
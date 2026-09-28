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

            // Страницу больше не перезагружаем, поэтому нужно показать,
            // что клик сработал. Как выглядит нажатая кнопка, описано в CSS,
            // а класс added просто включает этот вид.
            button.textContent = 'ok!';
            button.classList.add('added');

            // иконка корзины в шапке вздрагивает: товар улетел туда
            let cartIcon = document.querySelector('.imagee');

            if (cartIcon) {
                cartIcon.classList.add('shake');

                setTimeout(function () {
                    cartIcon.classList.remove('shake');
                }, 500);
            }

            setTimeout(function () {
                button.textContent = 'use';
                button.classList.remove('added');
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

    // наблюдатель сам скажет нам, когда карточка появилась в окне
    let watcher = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                watcher.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    foodCards.forEach(function (card, i) {
        // каждая следующая карточка чуть позже — получается лесенка
        card.style.transitionDelay = (i * 0.08) + 's';
        watcher.observe(card);
    });
}


// ============================================================
//  6. СТРАНИЦА LOGIN: ФОРМЫ ВХОДА И РЕГИСТРАЦИИ
// ============================================================

let loginForm = document.querySelector('.login-form');
let registerForm = document.querySelector('.register-form');

if (loginForm) {

    loginForm.addEventListener('submit', function (event) {
        // без этой строчки браузер перезагрузит страницу и всё сотрёт
        event.preventDefault();

        let login = document.querySelector('#login-login').value.trim();
        let password = document.querySelector('#login-password').value.trim();

        let message = loginForm.querySelector('.form-msg');

        if (login === '' || password === '') {
            message.textContent = 'Заполни оба поля';
            return;
        }

        let users = readUsers();

        let user = users.find(function (u) {
            return u.login === login;
        });

        // одно сообщение на обе ошибки: иначе можно перебором узнать,
        // какие логины на сайте существуют
        if (!user || user.password !== password) {
            message.textContent = 'Неверный логин или пароль';
            return;
        }

        localStorage.setItem('murfood:current', user.login);
        location.href = 'profile.html';
    });

}

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
//
//  Две двери в память — такие же, как readCart и saveCart
//  в блоке 3, только коробка называется по-другому.
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

// Кто сейчас вошёл. Если никто — возвращает null.
function getCurrentUser() {
    let login = localStorage.getItem('murfood:current');

    if (!login) {
        return null;
    }

    let users = readUsers();

    return users.find(function (u) {
        return u.login === login;
    });
}


// ============================================================
//  8. СТРАНИЦА PROFILE
// ============================================================

let profileBlock = document.querySelector('.profile-block');
let guestBlock = document.querySelector('.guest-block');

if (profileBlock) {

    let user = getCurrentUser();

    if (!user) {
        // никто не вошёл — прячем профиль, остаётся приглашение войти
        profileBlock.classList.add('hidden');
    } else {
        guestBlock.classList.add('hidden');

        document.querySelector('#profile-name').textContent = user.name;
        document.querySelector('#profile-login').textContent = '@' + user.login;
        document.querySelector('#profile-money').textContent = user.money + '$';
        document.querySelector('#profile-avatar').src = user.avatar;

        // пустое описание показываем бледной надписью
        let aboutField = document.querySelector('#profile-about');

        aboutField.textContent = user.about || 'нет описания';
        aboutField.classList.toggle('empty', user.about === '');

        // выход в два нажатия, чтобы не выйти случайно
        let logoutButton = document.querySelector('.logout-btn');
        let armed = false;

        logoutButton.addEventListener('click', function () {
            if (!armed) {
                armed = true;
                logoutButton.textContent = 'Точно выйти?';
                return;
            }

            localStorage.removeItem('murfood:current');
            location.href = 'index.html';
        });
    }

}

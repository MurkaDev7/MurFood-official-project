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
            if(!getCurrentUser()) {
                button.textContent = "log in!"
                setTimeout(function() {
                    button.textContent = "use"
                }, 1000)
                return
            }
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
    let user = getCurrentUser()
    if(!user) {
        return []
    }
    return user.cart
}

function saveCart(cart) {
    let user = getCurrentUser()

    if(!user) {
        return
    }

    user.cart = cart
    saveCurrentUser(user)
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

        let totalPrice = getTotal(cart);

        for (let i = 0; i < cart.length; i++) {
            let product = cart[i];
            let itemPrice = product.price * product.count;

            // totalPrice = totalPrice + itemPrice; //удалить позже 

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
        let user = getCurrentUser()
        let message = document.querySelector(".shop-msg")
        
        if(!user) {
            message.textContent = "Log in first"
            return
        }
        let cart = readCart();
        let total = getTotal(cart)
        if(cart.length === 0) {
            message.textContent = "the shop is empty"
            return
        }
        if(total > user.money) {
            message.textContent = "you are poor"
            return
        }
        user.money -= total
        user.orders.push({
            date: new Date().toLocaleDateString(),   // '07.09.2026'
            total: total,
            items: cart
        })
        user.cart = []
        saveCurrentUser(user)
        message.textContent = "thanks for your order"
        showCart()
        // if (cart.length > 0) {
        //     // alert('Thank you for your order!'); сделать в ОФИЦИАЛЬНОЙ ВЕРСИИ САЙТА
        //     // localStorage.removeItem('cart');
        //     // showCart();
        // }
    });

    
    // Показываем корзину сразу при открытии страницы
    showCart();
}

function getTotal(cart) {
    let total = 0;

    for (let i = 0; i < cart.length; i++) {
        total = total + cart[i].price * cart[i].count;
    }

    return total;
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
            message.textContent = 'Incorrect username or password';
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
            message.textContent = 'Please enter a username or password';
            return;
        }

        if (login.length < 3) {
            message.textContent = 'Usernames can be 3 to 20 characters long.';
            return;
        }

        if (password.length < 4) {
            message.textContent = 'Passwords must be between 8 and 200 characters long.';
            return;
        }

        let users = readUsers();

        let taken = users.some(function (u) {
            return u.login === login;
        });

        if (taken) {
            message.textContent = 'This username is already in use.';
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

        message.textContent = 'profile created, login';
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

function saveCurrentUser(user) {
    let users = readUsers()

    let index = users.findIndex(function (u) {
        return u.login === user.login;
    });
    if(index === -1){
        return
    }
    users[index] = user
    saveUsers(users)
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

        aboutField.textContent = user.about || 'no description';
        aboutField.classList.toggle('empty', user.about === '');

        // выход в два нажатия, чтобы не выйти случайно
        let logoutButton = document.querySelector('.logout-btn');
        let armed = false;

        logoutButton.addEventListener('click', function () {
            if (!armed) {
                armed = true;
                logoutButton.textContent = 'logout?';
                return;
            }

            localStorage.removeItem('murfood:current');
            location.href = 'index.html';
        });
    }

}

let grid = document.querySelector('.favorite-food-grid');

if (grid) {
    grid.innerHTML = '';

    if (user.orders.length === 0) {
        grid.innerHTML = '<p class="empty-cart-text">пока ничего не заказано</p>';
    } else {
        let last = user.orders[user.orders.length - 1];

        for (let i = 0; i < last.items.length; i++) {
            let product = last.items[i];

            grid.insertAdjacentHTML('beforeend', `
                <div class="cart-menu">
                    <div class="first-part">
                        <p class="p-menu1">${product.title}</p>
                        <div class="white-background-imgo">
                            <img src="${product.img}" alt="${product.title}">
                        </div>
                    </div>
                    <div class="second-part">
                        <p class="p-menu2">${product.price}$</p>
                    </div>
                </div>
            `);
        }
    }
}

// ============================================================
//   9 ШАПКА: КТО ВОШЁЛ
// ============================================================


let profileLink = document.querySelector(".profile-link")
let helloText = document.querySelector(".hello")

if(profileLink) {
    let headUser = getCurrentUser()
    if(headUser) {
        helloText.textContent = "hi, " + headUser.name + "!"
        profileLink.href = "profile.html"
        profileLink.querySelector("img").src = headUser.avatar
    }else{
        helloText.textContent = ""
        profileLink.href = "login.html"
        profileLink.querySelector("img").src = "src/Profile.png"
    }

    
}


let badge = document.querySelector(".cart-count")

if(badge){
    let count = readCart().length;
    badge.textContent = count;
    badge.classList.toggle('hidden', count === 0);
}



























// menu-btn

const buttons = document.querySelectorAll(".menu-btn");

buttons.forEach((button) => {
    let targetX = 50;
    let targetY = 50;

    let currentX = 50;
    let currentY = 50;

    // Получаем позицию мыши
    button.addEventListener("mousemove", (event) => {
        const rect = button.getBoundingClientRect();

        targetX = event.clientX - rect.left;
        targetY = event.clientY - rect.top;
    });

    // Плавно двигаем градиент к мыши
    function animate() {
        currentX += (targetX - currentX) * 0.01;
        currentY += (targetY - currentY) * 0.01;

        button.style.setProperty("--mouse-x", `${currentX}px`);
        button.style.setProperty("--mouse-y", `${currentY}px`);

        requestAnimationFrame(animate);
    }

    animate();
});
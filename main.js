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
            // Корзина теперь лежит внутри человека. Нет человека — нет корзины.
            if (!getCurrentUser()) {
                button.textContent = 'login!';

                setTimeout(function () {
                    button.textContent = 'use';
                }, 1000);

                return;
            }

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
//  Раньше корзина была одна на всех и лежала в коробке 'cart'.
//  Теперь она лежит внутри человека, и у каждого она своя.
//  Поменялись только эти две двери — весь остальной код
//  корзины остался точно таким же.
// ============================================================

function readCart() {
    let user = getCurrentUser();

    if (!user) {
        return [];
    }

    return user.cart;
}

function saveCart(cart) {
    let user = getCurrentUser();

    if (!user) {
        return;
    }

    user.cart = cart;
    saveCurrentUser(user);
}


// ============================================================
//  4. СТРАНИЦА SHOP: ПОКАЗЫВАЕМ КОРЗИНУ И СЧИТАЕМ СУММУ
// ============================================================

let foodGrid = document.querySelector('.food-grid');
let buyAllButton = document.querySelector('.buy-all-btn');

// Сумма корзины нужна в двух местах: на кнопке и при покупке.
// Одно действие — одна функция.
function getTotal(cart) {
    let total = 0;

    for (let i = 0; i < cart.length; i++) {
        total = total + cart[i].price * cart[i].count;
    }

    return total;
}

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

    // Кнопка «buy all»: считаем, проверяем, списываем
    buyAllButton.addEventListener('click', function () {
        let user = getCurrentUser();
        let message = document.querySelector('.shop-msg');

        if (!user) {
            message.textContent = 'Login';
            return;
        }

        let cart = readCart();
        let total = getTotal(cart);

        if (cart.length === 0) {
            message.textContent = 'The shop is empty';
            return;
        }

        if (total > user.money) {
            message.textContent = 'You are poor ):';
            return;
        }

        // Меняем всё, что надо, и только потом сохраняем — один раз
        user.money = user.money - total;

        user.orders.push({
            date: new Date().toLocaleDateString(),
            total: total,
            items: cart
        });

        user.cart = [];

        saveCurrentUser(user);

        message.textContent = 'ok';
        showCart();
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
            message.textContent = 'no password, no username';
            return;
        }

        let users = readUsers();

        let user = users.find(function (u) {
            return u.login === login;
        });

        // одно сообщение на обе ошибки: иначе можно перебором узнать,
        // какие логины на сайте существуют
        if (!user || user.password !== password) {
            message.textContent = 'invalid login or password';
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
            message.textContent = 'Username and password required';
            return;
        }

        if (login.length < 3) {
            message.textContent = 'Login is too short';
            return;
        }

        if (password.length < 4) {
            message.textContent = 'Password is too short';
            return;
        }

        let users = readUsers();

        let taken = users.some(function (u) {
            return u.login === login;
        });

        if (taken) {
            message.textContent = 'This username is already in use';
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

        message.textContent = 'Profile created, login';
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

// getCurrentUser отдаёт копию. Чтобы изменения не пропали,
// копию надо положить обратно в список и сохранить его целиком.
function saveCurrentUser(user) {
    let users = readUsers();

    let index = users.findIndex(function (u) {
        return u.login === user.login;
    });

    if (index === -1) {
        return;
    }

    users[index] = user;
    saveUsers(users);
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

    // Рисование профиля нужно в двух местах: при загрузке страницы
    // и после сохранения изменений. Значит — функция.
    function drawProfile() {
        document.querySelector('#profile-name').textContent = user.name;
        document.querySelector('#profile-login').textContent = '@' + user.login;
        document.querySelector('#profile-money').textContent = user.money + '$';
        document.querySelector('#profile-avatar').src = user.avatar;

        // пустое описание показываем бледной надписью
        let aboutField = document.querySelector('#profile-about');

        aboutField.textContent = user.about || 'no description';
        aboutField.classList.toggle('empty', user.about === '');
    }

    // Вместо трёх намертво вписанных пицц — то, что человек
    // заказал в последний раз. Ради этого мы и сохраняли items.
    function drawLastOrder() {
        let grid = document.querySelector('.favorite-food-grid');

        if (!grid) {
            return;
        }

        grid.innerHTML = '';

        if (user.orders.length === 0) {
            grid.innerHTML = '<p class="empty-cart-text">пока ничего не заказано</p>';
            return;
        }

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

    if (!user) {
        // никто не вошёл — прячем профиль, остаётся приглашение войти
        profileBlock.classList.add('hidden');
    } else {
        guestBlock.classList.add('hidden');

        drawProfile();
        drawLastOrder();

        // ---------- выход ----------

        // в два нажатия, чтобы не выйти случайно
        let logoutButton = document.querySelector('.logout-btn');
        let armed = false;

        logoutButton.addEventListener('click', function () {
            if (!armed) {
                armed = true;
                logoutButton.textContent = 'logout???';
                return;
            }

            localStorage.removeItem('murfood:current');
            location.href = 'index.html';
        });

        // ---------- редактирование ----------

        let editButton = document.querySelector('.edit-btn');
        let editForm = document.querySelector('.edit-form');
        let avatars = document.querySelectorAll('.avatars img');

        // что выбрано прямо сейчас
        let chosen = user.avatar;

        editButton.addEventListener('click', function () {
            // профиль и форма меняются местами
            profileBlock.classList.add('hidden');
            editForm.classList.remove('hidden');

            // в полях сразу то, что есть сейчас — а не пустота
            document.querySelector('#edit-name').value = user.name;
            document.querySelector('#edit-about').value = user.about;

            chosen = user.avatar;

            avatars.forEach(function (img) {
                img.classList.remove('selected');

                if (img.getAttribute('src') === user.avatar) {
                    img.classList.add('selected');
                }
            });
        });

        avatars.forEach(function (img) {
            img.addEventListener('click', function () {
                avatars.forEach(function (other) {
                    other.classList.remove('selected');
                });

                img.classList.add('selected');

                // getAttribute отдаёт путь так, как он написан в HTML
                chosen = img.getAttribute('src');
            });
        });

        // своя картинка с компьютера
        let fileInput = document.querySelector('#edit-file');

        if (fileInput) {
            fileInput.addEventListener('change', function (event) {
                let file = event.target.files[0];

                if (!file) {
                    return;
                }

                // в памяти браузера живёт только текст, поэтому
                // FileReader превращает картинку в очень длинную строку
                let reader = new FileReader();

                reader.addEventListener('load', function () {
                    chosen = reader.result;

                    avatars.forEach(function (other) {
                        other.classList.remove('selected');
                    });
                });

                reader.readAsDataURL(file);
            });
        }

        editForm.addEventListener('submit', function (event) {
            event.preventDefault();

            // логин не меняем: по нему человек и находится в списке
            user.name = document.querySelector('#edit-name').value.trim();
            user.about = document.querySelector('#edit-about').value.trim();
            user.avatar = chosen;

            saveCurrentUser(user);

            editForm.classList.add('hidden');
            profileBlock.classList.remove('hidden');

            drawProfile();
        });
    }

}


// ============================================================
//  9. ШАПКА: КТО ВОШЁЛ
// ============================================================

let profileLink = document.querySelector('.profile-link');
let helloText = document.querySelector('.hello');

if (profileLink) {

    let headUser = getCurrentUser();

    if (headUser) {
        helloText.textContent = 'hi, ' + headUser.name + '!';
        profileLink.href = 'profile.html';
        profileLink.querySelector('img').src = headUser.avatar;
    } else {
        // гостю незачем идти в профиль — ведём сразу на вход
        helloText.textContent = '';
        profileLink.href = 'login.html';
        profileLink.querySelector('img').src = 'src/Profile.png';
    }

    // кружок с числом товаров на корзине
    let badge = document.querySelector('.cart-count');
    
    if (badge) {
        let count = readCart().length;
        
        badge.textContent = count;
        badge.classList.toggle('hidden', count === 0);
    }    
    
}    



// ============================================================
//  10. ВЫЕЗЖАЮЩЕЕ МЕНЮ
// ============================================================

let menuOverlay = document.querySelector('.menu-overlay')
let burger = document.querySelector('.burger');
let sideMenu = document.querySelector('.side-menu');
let menuClose = document.querySelector('.menu-close');
let body = document.body


if (burger) {
    function openMenu() {
        sideMenu.classList.add("open");
        menuOverlay.classList.add("open");
        body.classList.add('fixed')
        burger.classList.add('open')
    }

    function closeMenu() {
        sideMenu.classList.remove("open")
        menuOverlay.classList.remove('open')
        body.classList.remove('fixed')
        burger.classList.remove('open')
    }

    burger.addEventListener('click', function() {
        if(sideMenu.classList.contains(open)) {
            closeMenu()
        }else{
            openMenu()
        }
    })

    


    menuClose.addEventListener('click', closeMenu);
    menuOverlay.addEventListener('click', closeMenu);

    document.addEventListener("keydown", function(e) {
        if(e.key === 'Escape') {
            sideMenu.classList.remove('open');
            menuOverlay.classList.remove('open')
            body.classList.remove('fixed')
            burger.classList.remove('open')
        }
    })

}


// 
// ДОПОЛНИТЕЛЬНО
// 
// menu-btn анимация градиента 

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
        currentX += (targetX - currentX) * 0.02;
        currentY += (targetY - currentY) * 0.02;

        button.style.setProperty("--mouse-x", `${currentX}px`);
        button.style.setProperty("--mouse-y", `${currentY}px`);

        requestAnimationFrame(animate);
    }    

    animate();
});    






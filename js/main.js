$(document).ready(function() {

    // ===== Mobile Menu Toggle =====
    $('#mobileMenuBtn').click(function() {
        $('#navMenu').toggleClass('active');
        $(this).toggleClass('active');
    });

    // Close mobile menu when clicking on a link
    $('.nav-menu a').click(function() {
        $('#navMenu').removeClass('active');
        $('#mobileMenuBtn').removeClass('active');
    });

    // ===== API Configuration =====
    const API_BASE_URL = '../data/fruits.json';

    // ===== Products Data =====
    let allProducts = [];
    let filteredProducts = [];
    let currentView = 'grid';

    // ===== Load Products from API =====
    function loadProducts() {
        $.ajax({
            url: API_BASE_URL,
            method: 'GET',
            success: function(data) {
                allProducts = data;
                filteredProducts = data;

                if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
                    displayFeaturedProducts(data.slice(0, 6)); // Show first 6 products on homepage
                } else if (window.location.pathname.includes('products.html')) {
                    displayProducts(data);
                    updateResultsCount();
                }

                $('#loading').hide();
            },
            error: function() {
                $('#loading').html('<p>Không thể tải sản phẩm. Vui lòng thử lại sau.</p>');
            }
        });
    }

    // ===== Display Featured Products (Homepage) =====
    function displayFeaturedProducts(products) {
        const productsHtml = products.map(product => `
            <div class="product-card">
                <img src="${product.image}" alt="${product.title}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                <div class="product-card-content">
                    <h3>${product.title.length > 50 ? product.title.substring(0, 50) + '...' : product.title}</h3>
                    <div class="rating">
                        <span class="stars">${generateStars(product.rating.rate)}</span>
                        <span>${product.rating.rate} (${product.rating.count})</span>
                    </div>
                    <div class="price">${formatPrice(product.price)}</div>
                    <a href="/other-pages/product-detail.html?id=${product.id}" class="btn btn-primary">Xem chi tiết</a>
                </div>
            </div>
        `).join('');

        $('#productsSlider').html(productsHtml);

        // Initialize Slick Slider
        $('#productsSlider').slick({
            slidesToShow: 3,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 3000,
            responsive: [
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 2
                    }
                },
                {
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 1
                    }
                }
            ]
        });
    }

    // ===== Display Products (Products Page) =====
    function displayProducts(products) {
        if (products.length === 0) {
            $('#productsGrid').hide();
            $('#noResults').show();
            return;
        }

        $('#noResults').hide();
        $('#productsGrid').show();

        const productsHtml = products.map(product => `
            <div class="product-card">
                <img src="${product.image}" alt="${product.title}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                <div class="product-card-content">
                    <h3>${product.title.length > 60 ? product.title.substring(0, 60) + '...' : product.title}</h3>
                    <div class="rating">
                        <span class="stars">${generateStars(product.rating.rate)}</span>
                        <span>${product.rating.rate} (${product.rating.count})</span>
                    </div>
                    <div class="price">${formatPrice(product.price)}</div>
                    <p>${product.description.length > 100 ? product.description.substring(0, 100) + '...' : product.description}</p>
                    <a href="product-detail.html?id=${product.id}" class="btn btn-primary">Xem chi tiết</a>
                </div>
            </div>
        `).join('');

        $('#productsGrid').html(productsHtml);

        // Apply view mode
        updateViewMode();
    }

    // ===== Generate Stars Rating =====
    function generateStars(rating) {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStar;

        return '★'.repeat(fullStars) + (halfStar ? '☆' : '') + '☆'.repeat(emptyStars);
    }

    // ===== Format Price =====
    function formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    }

    // ===== Update Results Count =====
    function updateResultsCount() {
        const count = filteredProducts.length;
        const category = $('#categoryFilter').val();
        const search = $('#searchInput').val();

        let text = `Hiển thị ${count} sản phẩm`;

        if (category && category !== 'all') {
            const categoryNames = {
                "trái cây": "Trái cây",
                "rau củ": "Rau củ"
            };
            text += ` trong danh mục "${categoryNames[category] || category}"`;
        }

        if (search) {
            text += ` cho "${search}"`;
        }

        $('#resultsCount').text(text);
    }

    // ===== Filter Products =====
    function filterProducts() {
        let filtered = [...allProducts];

        // Search filter
        const searchQuery = $('#searchInput').val().toLowerCase().trim();
        if (searchQuery) {
            filtered = filtered.filter(product =>
                product.title.toLowerCase().includes(searchQuery) ||
                product.category.toLowerCase().includes(searchQuery) ||
                product.description.toLowerCase().includes(searchQuery)
            );
        }

        // Category filter
        const selectedCategory = $('#categoryFilter').val();
        if (selectedCategory && selectedCategory !== 'all') {
            filtered = filtered.filter(product => product.category === selectedCategory);
        }

        // Sort
        const sortBy = $('#sortFilter').val();
        switch (sortBy) {
            case 'price-low':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                filtered.sort((a, b) => b.rating.rate - a.rating.rate);
                break;
            case 'name':
                filtered.sort((a, b) => a.title.localeCompare(b.title));
                break;
        }

        filteredProducts = filtered;
        displayProducts(filtered);
        updateResultsCount();
    }

    // ===== View Mode Toggle =====
    function updateViewMode() {
        const grid = $('#productsGrid');
        if (currentView === 'list') {
            grid.addClass('list-view');
        } else {
            grid.removeClass('list-view');
        }
    }

    // ===== Product Detail Page =====
    function loadProductDetail() {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = parseInt(urlParams.get('id'));

        if (!productId) {
            $('#loading').html('<p>Không tìm thấy sản phẩm.</p>');
            return;
        }

        $.ajax({
            url: API_BASE_URL,
            method: 'GET',
            dataType: 'json',
            success: function(products) {
                const product = products.find(p => p.id === productId);
                if (!product) {
                    $('#loading').html('<p>Không tìm thấy sản phẩm.</p>');
                    return;
                }

                displayProductDetail(product);
                loadRelatedProducts(product.category, product.id);
                $('#loading').hide();
                $('#productDetail').show();
            },
            error: function() {
                $('#loading').html('<p>Không thể tải thông tin sản phẩm.</p>');
            }
        });
    }

    // ===== Display Product Detail =====
    function displayProductDetail(product) {
        $('#productBreadcrumb').text(product.title);
        $('#productImage').attr('src', product.image).attr('alt', product.title);
        $('#productTitle').text(product.title);
        $('#productStars').html(generateStars(product.rating.rate));
        $('#productRating').text(`${product.rating.rate} (${product.rating.count} đánh giá)`);
        $('#productPrice').text(formatPrice(product.price));
        $('#productDescription').text(product.description);

        // Category translation
        const categoryNames = {
            "trái cây": "Trái cây",
            "rau củ": "Rau củ"
        };
        $('#productCategory').text(categoryNames[product.category] || product.category);
    }

    // ===== Load Related Products =====
    function loadRelatedProducts(category, currentProductId) {
        $.ajax({
            url: API_BASE_URL,
            method: 'GET',
            dataType: 'json',
            success: function(products) {
                const relatedProducts = products
                    .filter(product => product.category === category && product.id != currentProductId)
                    .slice(0, 4);

                if (relatedProducts.length > 0) {
                    displayRelatedProducts(relatedProducts);
                    $('#relatedProducts').show();
                }
            }
        });
    }

    // ===== Display Related Products =====
    function displayRelatedProducts(products) {
        const productsHtml = products.map(product => `
            <div class="product-card">
                <img src="${product.image}" alt="${product.title}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                <div class="product-card-content">
                    <h3>${product.title.length > 50 ? product.title.substring(0, 50) + '...' : product.title}</h3>
                    <div class="rating">
                        <span class="stars">${generateStars(product.rating.rate)}</span>
                        <span>${product.rating.rate}</span>
                    </div>
                    <div class="price">${formatPrice(product.price)}</div>
                    <a href="product-detail.html?id=${product.id}" class="btn btn-primary">Xem chi tiết</a>
                </div>
            </div>
        `).join('');

        $('#relatedProductsGrid').html(productsHtml);
    }

    // ===== Event Listeners =====

    // Products page filters
    $('#searchInput').on('input', debounce(filterProducts, 300));
    $('#categoryFilter').on('change', filterProducts);
    $('#sortFilter').on('change', filterProducts);

    // View toggle
    $('.view-btn').click(function() {
        $('.view-btn').removeClass('active');
        $(this).addClass('active');
        currentView = $(this).data('view');
        updateViewMode();
    });

    // Product detail quantity controls
    $('#increaseQty').click(function() {
        const qty = parseInt($('#quantity').val());
        $('#quantity').val(qty + 1);
    });

    $('#decreaseQty').click(function() {
        const qty = parseInt($('#quantity').val());
        if (qty > 1) {
            $('#quantity').val(qty - 1);
        }
    });

    // Add to cart (placeholder)
    $('#addToCart').click(function() {
        const productTitle = $('#productTitle').text();
        const quantity = $('#quantity').val();
        alert(`Đã thêm ${quantity} sản phẩm "${productTitle}" vào giỏ hàng!`);
    });

    // ===== Form Validation =====

    // Newsletter form
    $('#newsletterForm').submit(function(e) {
        e.preventDefault();
        const email = $(this).find('input[type="email"]').val();
        if (validateEmail(email)) {
            alert('Cảm ơn bạn đã đăng ký nhận tin!');
            $(this)[0].reset();
        } else {
            alert('Vui lòng nhập email hợp lệ.');
        }
    });

    // Contact form validation
    $('#contactForm').submit(function(e) {
        e.preventDefault();

        let isValid = true;

        // Clear previous errors
        $('.error-message').text('');

        // Validate name
        const name = $('#name').val().trim();
        if (!name) {
            $('#nameError').text('Vui lòng nhập họ và tên');
            isValid = false;
        }

        // Validate email
        const email = $('#email').val().trim();
        if (!email) {
            $('#emailError').text('Vui lòng nhập email');
            isValid = false;
        } else if (!validateEmail(email)) {
            $('#emailError').text('Email không hợp lệ');
            isValid = false;
        }

        // Validate phone (optional but if provided, must be valid)
        const phone = $('#phone').val().trim();
        if (phone && !validatePhone(phone)) {
            $('#phoneError').text('Số điện thoại không hợp lệ');
            isValid = false;
        }

        // Validate subject
        const subject = $('#subject').val();
        if (!subject) {
            $('#subjectError').text('Vui lòng chọn chủ đề');
            isValid = false;
        }

        // Validate message
        const message = $('#message').val().trim();
        if (!message) {
            $('#messageError').text('Vui lòng nhập tin nhắn');
            isValid = false;
        } else if (message.length < 10) {
            $('#messageError').text('Tin nhắn phải có ít nhất 10 ký tự');
            isValid = false;
        }

        if (isValid) {
            alert('Cảm ơn bạn đã gửi tin nhắn! Chúng tôi sẽ phản hồi sớm nhất có thể.');
            $(this)[0].reset();
        }
    });

    // ===== FAQ Toggle =====
    $('.faq-question').click(function() {
        const faqItem = $(this).parent();
        const faqAnswer = faqItem.find('.faq-answer');

        // Close other FAQ items
        $('.faq-item').not(faqItem).removeClass('active');
        $('.faq-answer').not(faqAnswer).removeClass('active');

        // Toggle current FAQ item
        faqItem.toggleClass('active');
        faqAnswer.toggleClass('active');
    });

    // ===== Helper Functions =====

    // Email validation
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Phone validation (Vietnamese phone numbers)
    function validatePhone(phone) {
        const phoneRegex = /^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/;
        return phoneRegex.test(phone.replace(/\s+/g, ''));
    }

    // Debounce function for search
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // ===== Smooth Scrolling =====
    $('a[href^="#"]').click(function(e) {
        e.preventDefault();
        const target = $(this.getAttribute('href'));
        if (target.length) {
            $('html, body').animate({
                scrollTop: target.offset().top - 80
            }, 800);
        }
    });

    // ===== Scroll Effects =====
    $(window).scroll(function() {
        const scrollTop = $(this).scrollTop();

        // Add background to header when scrolling
        if (scrollTop > 50) {
            $('.header').addClass('scrolled');
        } else {
            $('.header').removeClass('scrolled');
        }

        // Fade in elements when they come into view
        $('.fade-in').each(function() {
            const elementTop = $(this).offset().top;
            const windowBottom = $(window).scrollTop() + $(window).height();

            if (elementTop < windowBottom - 100) {
                $(this).addClass('visible');
            }
        });
    });

    // ===== Initialize Page =====

    // Load products on homepage and products page
    if (window.location.pathname.includes('index.html') ||
        window.location.pathname === '/' ||
        window.location.pathname.includes('products.html')) {
        loadProducts();
    }

    // Load product detail
    if (window.location.pathname.includes('product-detail.html')) {
        loadProductDetail();
    }

    // Add fade-in class to benefit cards for animation
    $('.benefit-card').addClass('fade-in');

    console.log('GreenCart website initialized successfully!');
});

// ===== Additional CSS for scrolled header =====
const additionalStyles = `
<style>
.header.scrolled {
    background: rgba(5, 150, 105, 0.95);
    backdrop-filter: blur(10px);
}

.fade-in {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.6s ease-out;
}

.fade-in.visible {
    opacity: 1;
    transform: translateY(0);
}
</style>
`;

$('head').append(additionalStyles);

// ========== FILTER FUNCTIONALITY ==========
const filterCheckboxes = document.querySelectorAll('.filter-checkbox');
const clearFiltersBtn = document.querySelector('.clear-filters');
const productCards = document.querySelectorAll('.product-card');

// Filter function
function applyFilters() {
    const selectedCategories = Array.from(document.querySelectorAll('.filter-checkbox[data-filter="category"]:checked')).map(cb => cb.value);
    const selectedBrands = Array.from(document.querySelectorAll('.filter-checkbox[data-filter="brand"]:checked')).map(cb => cb.value);
    const selectedPrices = Array.from(document.querySelectorAll('.filter-checkbox[data-filter="price"]:checked')).map(cb => cb.value);
    
    productCards.forEach(card => {
        const category = card.dataset.category;
        const brand = card.dataset.brand;
        const price = parseFloat(card.dataset.price);
        
        let showCard = true;
        
        if (selectedCategories.length > 0 && !selectedCategories.includes(category)) {
            showCard = false;
        }
        
        if (selectedBrands.length > 0 && !selectedBrands.includes(brand)) {
            showCard = false;
        }
        
        if (selectedPrices.length > 0) {
            let matchesPrice = false;
            selectedPrices.forEach(range => {
                const [min, max] = range.split('-').map(Number);
                if (price >= min && price < max) {
                    matchesPrice = true;
                }
            });
            if (!matchesPrice) {
                showCard = false;
            }
        }
        
        if (showCard) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

// Add event listeners to all checkboxes
filterCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', applyFilters);
});

// Clear all filters
if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
        filterCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        productCards.forEach(card => {
            card.style.display = 'flex';
        });
    });
}
// ========== FILTER DROPDOWN FUNCTIONALITY ==========
const filterDropdownBtn = document.getElementById('filterDropdownBtn');
const filterDropdown = document.getElementById('filterDropdown');
const page = document.querySelector('.page');

if (filterDropdownBtn) {
    filterDropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        filterDropdown.classList.toggle('open');
        page.classList.toggle('filters-open');
    });
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (filterDropdown && !filterDropdown.contains(e.target) && filterDropdownBtn && !filterDropdownBtn.contains(e.target)) {
        filterDropdown.classList.remove('open');
        page.classList.remove('filters-open');
    }
});

// Prevent dropdown from closing when clicking inside it
if (filterDropdown) {
    filterDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

// ========== SHOPPING CART FUNCTIONALITY ==========
let cart = [];

// Cart UI Elements
const cartIcon = document.querySelector('.cart');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartClose = document.getElementById('cartClose');
const cartBody = document.getElementById('cartBody');
const cartEmpty = document.getElementById('cartEmpty');
const cartFooter = document.getElementById('cartFooter');
const cartTotal = document.getElementById('cartTotal');
const cartCountElement = document.querySelector('.cart-count');

// Open/Close Cart
if (cartIcon) {
    cartIcon.addEventListener('click', () => {
        cartSidebar.classList.add('open');
        cartOverlay.classList.add('active');
    });
}

if (cartClose) {
    cartClose.addEventListener('click', closeCart);
}

if (cartOverlay) {
    cartOverlay.addEventListener('click', closeCart);
}

function closeCart() {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('active');
}

// Add to Cart - Listen to ALL product buttons
document.addEventListener('click', (e) => {
    // Check if clicked element is or contains a product-cta button
    const ctaButton = e.target.closest('.product-cta');
    if (ctaButton) {
        const card = ctaButton.closest('.product-card');
        if (card) {
            const product = {
                id: card.dataset.brand + '-' + card.dataset.category + '-' + Math.random().toString(36).substr(2, 5),
                name: card.querySelector('.product-name').textContent.trim(),
                brand: card.querySelector('.product-brand').textContent.trim(),
                price: parseFloat(card.querySelector('.product-price').textContent.replace('$', '')),
                image: card.querySelector('.product-img').src,
                quantity: 1
            };
            
            addToCart(product);
        }
    }
});

function addToCart(product) {
    // Check if product already exists in cart (by brand and name)
    const existingProduct = cart.find(item => 
        item.name === product.name && item.brand === product.brand
    );
    
    if (existingProduct) {
        existingProduct.quantity++;
    } else {
        cart.push(product);
    }
    
    updateCart();
    
    // Open cart automatically
    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.add('open');
        cartOverlay.classList.add('active');
    }
    
    // Show notification (optional)
    console.log('Added to cart:', product.name);
}

function updateCart() {
    if (!cartCountElement) return;
    
    // Update cart count badge
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElement.textContent = totalItems;
    
    // Show/hide empty state
    if (cart.length === 0) {
        if (cartEmpty) cartEmpty.style.display = 'block';
        if (cartFooter) cartFooter.style.display = 'none';
        if (cartBody) {
            cartBody.innerHTML = '<div class="cart-empty"><i class="bi bi-cart-x"></i><p>Your cart is empty</p></div>';
        }
        return;
    }
    
    if (cartEmpty) cartEmpty.style.display = 'none';
    if (cartFooter) cartFooter.style.display = 'block';
    
    // Render cart items
    if (cartBody) {
        cartBody.innerHTML = cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <div class="cart-item-brand">${item.brand}</div>
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)} each</div>
                    <div class="cart-item-actions">
                        <div class="quantity-control">
                            <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                            <span class="quantity-display">${item.quantity}</span>
                            <button class="quantity-btn increase" data-id="${item.id}">+</button>
                        </div>
                        <button class="remove-btn" data-id="${item.id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                    <div style="margin-top: 8px; font-weight: 600;">
                        Subtotal: $${(item.price * item.quantity).toFixed(2)}
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // Calculate and update total price
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (cartTotal) {
        cartTotal.textContent = `$${total.toFixed(2)}`;
    }
    
    // Add event listeners to quantity buttons
    document.querySelectorAll('.quantity-btn.increase').forEach(btn => {
        btn.addEventListener('click', () => increaseQuantity(btn.dataset.id));
    });
    
    document.querySelectorAll('.quantity-btn.decrease').forEach(btn => {
        btn.addEventListener('click', () => decreaseQuantity(btn.dataset.id));
    });
    
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
    });
}

function increaseQuantity(id) {
    const product = cart.find(item => item.id === id);
    if (product) {
        product.quantity++;
        updateCart();
    }
}

function decreaseQuantity(id) {
    const product = cart.find(item => item.id === id);
    if (product && product.quantity > 1) {
        product.quantity--;
        updateCart();
    }
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCart();
}

// ========== WISHLIST FUNCTIONALITY ==========
document.addEventListener('click', (e) => {
    const wishlistBtn = e.target.closest('.product-wishlist');
    if (wishlistBtn) {
        const icon = wishlistBtn.querySelector('i');
        if (icon.classList.contains('bi-heart')) {
            icon.classList.remove('bi-heart');
            icon.classList.add('bi-heart-fill');
            wishlistBtn.style.color = '#d32f2f';
        } else {
            icon.classList.add('bi-heart');
            icon.classList.remove('bi-heart-fill');
            wishlistBtn.style.color = '#6b4f3f';
        }
    }
});

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCart();
    console.log('Shopping cart and filters initialized');
});


// ========== PRODUCT GRID SCROLL ARROWS ==========
document.querySelectorAll('.scroll-arrow').forEach(arrow => {
    arrow.addEventListener('click', (e) => {
        const section = e.target.closest('.scroll-arrow').dataset.section;
        const grid = document.querySelector(`[data-grid="${section}"]`);
        const scrollAmount = 250; // Scroll by ~1 card width
        
        if (e.target.closest('.scroll-arrow').classList.contains('left')) {
            grid.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else {
            grid.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    });
});

// ========== PREMIUM CAROUSEL FUNCTIONALITY (One Card at a Time) ==========
document.addEventListener('DOMContentLoaded', () => {
    const premiumCarousel = document.getElementById('premiumCarousel');
    const premiumLeft = document.getElementById('premiumLeft');
    const premiumRight = document.getElementById('premiumRight');
    const premiumIndicators = document.getElementById('premiumIndicators');

    if (premiumCarousel && premiumLeft && premiumRight) {
        let currentIndex = 0;
        const cards = premiumCarousel.querySelectorAll('.premium-card');
        const totalCards = cards.length;
        const dots = premiumIndicators ? premiumIndicators.querySelectorAll('.premium-dot') : [];

        console.log('Premium carousel initialized', totalCards, 'cards found');

        function updateCarousel() {
            premiumCarousel.style.transform = `translateX(-${currentIndex * 100}%)`;
            
            // Update dots
            dots.forEach((dot, index) => {
                if (index === currentIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
            
            // Disable/enable arrows
            if (currentIndex === 0) {
                premiumLeft.disabled = true;
                premiumLeft.style.opacity = '0.3';
            } else {
                premiumLeft.disabled = false;
                premiumLeft.style.opacity = '1';
            }
            
            if (currentIndex === totalCards - 1) {
                premiumRight.disabled = true;
                premiumRight.style.opacity = '0.3';
            } else {
                premiumRight.disabled = false;
                premiumRight.style.opacity = '1';
            }
        }

        premiumLeft.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Left arrow clicked, current index:', currentIndex);
            if (currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            }
        });

        premiumRight.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Right arrow clicked, current index:', currentIndex);
            if (currentIndex < totalCards - 1) {
                currentIndex++;
                updateCarousel();
            }
        });

        // Dot click navigation
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentIndex = index;
                updateCarousel();
            });
        });

        // Initialize
        updateCarousel();
    } else {
        console.error('Premium carousel elements not found:', {
            carousel: !!premiumCarousel,
            left: !!premiumLeft,
            right: !!premiumRight
        });
    }
});

// ========== NEWSLETTER SUBSCRIPTION ==========
const newsletterBtn = document.getElementById('newsletterSubmit');
const newsletterInput = document.getElementById('newsletterEmail');

if (newsletterBtn && newsletterInput) {
    newsletterBtn.addEventListener('click', () => {
        const email = newsletterInput.value.trim();
        
        if (email === '') {
            alert('Please enter your email address');
            return;
        }
        
        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address');
            return;
        }
        
        // Success message
        alert(`Thank you for subscribing! We'll send updates to ${email}`);
        newsletterInput.value = '';
        
        // Here you would normally send the email to your backend
        // Example: fetch('/api/subscribe', { method: 'POST', body: JSON.stringify({ email }) })
    });
    
    // Allow Enter key to submit
    newsletterInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            newsletterBtn.click();
        }
    });
}

// ========== FOOTER ACTION BUTTONS ==========
// Scroll to top functionality
const scrollToTopBtn = document.getElementById('scrollToTop');

if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// WhatsApp button functionality
const whatsappBtn = document.querySelector('.footer-whatsapp');
if (whatsappBtn) {
    whatsappBtn.addEventListener('click', () => {
        const phoneNumber = '1234567890'; // Replace with your number
        const message = 'Hello! I am interested in your products.';
        window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
    });
}

// Chat button functionality
const chatBtn = document.querySelector('.footer-chat');
if (chatBtn) {
    chatBtn.addEventListener('click', () => {
        alert('Live chat feature coming soon!');
    });
}

// Email button functionality
const emailBtn = document.querySelector('.footer-email');
if (emailBtn) {
    emailBtn.addEventListener('click', () => {
        window.location.href = 'mailto:support@tumeves.com?subject=Product Inquiry';
    });
}


// ========== SEARCH FUNCTIONALITY ==========
const searchInput = document.querySelector('.search-input');
const allProductCards = document.querySelectorAll('.product-card');
const allProductSections = document.querySelectorAll('.products');

// Search function
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    // If search is empty, show all products
    if (searchTerm === '') {
        allProductCards.forEach(card => {
            card.style.display = 'flex';
        });
        allProductSections.forEach(section => {
            section.style.display = 'block';
        });
        return;
    }
    
    let hasResults = false;
    
    // Loop through all product sections
    allProductSections.forEach(section => {
        const cardsInSection = section.querySelectorAll('.product-card');
        let sectionHasVisibleCards = false;
        
        cardsInSection.forEach(card => {
            const productName = card.querySelector('.product-name')?.textContent.toLowerCase() || '';
            const productBrand = card.querySelector('.product-brand')?.textContent.toLowerCase() || '';
            const productPrice = card.querySelector('.product-price')?.textContent.toLowerCase() || '';
            
            // Check if search term matches name, brand, or price
            if (productName.includes(searchTerm) || 
                productBrand.includes(searchTerm) || 
                productPrice.includes(searchTerm)) {
                card.style.display = 'flex';
                sectionHasVisibleCards = true;
                hasResults = true;
            } else {
                card.style.display = 'none';
            }
        });
        
        // Show/hide entire section based on if it has visible cards
        if (sectionHasVisibleCards) {
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    });
    
    // Show "no results" message if needed
    showNoResultsMessage(!hasResults, searchTerm);
});

// Function to show/hide no results message
function showNoResultsMessage(show, searchTerm) {
    // Remove existing message if any
    const existingMessage = document.querySelector('.no-results-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    if (show) {
        const contentWrapper = document.querySelector('.content-wrapper');
        const noResultsDiv = document.createElement('div');
        noResultsDiv.className = 'no-results-message';
        noResultsDiv.innerHTML = `
            <div class="no-results-content">
                <i class="bi bi-search"></i>
                <h3>No products found</h3>
                <p>We couldn't find any products matching "<strong>${searchTerm}</strong>"</p>
                <p class="suggestion">Try searching for different keywords like "lipstick", "Dior", or "eyeshadow"</p>
            </div>
        `;
        contentWrapper.insertBefore(noResultsDiv, contentWrapper.firstChild);
    }
}

// Clear search when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.navbar-center')) {
        // Don't clear, just unfocus
    }
});

// Add enter key functionality
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchInput.blur(); // Remove focus to show results better
    }
});


// Show/hide clear button
const searchClear = document.querySelector('.search-clear');

searchInput.addEventListener('input', (e) => {
    // Show clear button if there's text
    if (e.target.value.length > 0) {
        searchClear.style.display = 'block';
    } else {
        searchClear.style.display = 'none';
    }
    
    // ... rest of search code above
});

// Clear search functionality
searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchClear.style.display = 'none';
    
    // Show all products again
    allProductCards.forEach(card => {
        card.style.display = 'flex';
    });
    allProductSections.forEach(section => {
        section.style.display = 'block';
    });
    
    // Remove no results message
    const existingMessage = document.querySelector('.no-results-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    searchInput.focus();
});


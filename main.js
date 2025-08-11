document.addEventListener("DOMContentLoaded", function() {
    const loadComponent = (path, placeholderId) => {
        return fetch(path)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load ${path}: ${response.statusText}`);
                }
                return response.text();
            })
            .then(data => {
                const placeholder = document.getElementById(placeholderId);
                if (placeholder) {
                    placeholder.innerHTML = data;
                }
            });
    };

    // Create a custom event to signal when the header is loaded
    const headerLoadedEvent = new Event('headerLoaded');

    // Load header and then apply active link styles and other functionalities
    loadComponent('header.html', 'header-placeholder').then(() => {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-link');

        navLinks.forEach(link => {
            const linkPage = (link.getAttribute('href') || '').split('/').pop();
            if (linkPage === currentPage) {
                // For dark theme, a different active style might be better
                link.classList.add('text-white', 'font-bold');
                link.classList.remove('text-gray-300');
            }
        });

        // Re-initialize event listeners for elements inside the loaded header
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }
        
        // Dispatch the custom event so page-specific scripts can run
        document.dispatchEvent(headerLoadedEvent);
    }).catch(error => console.error('Error loading the header:', error));

    // Load footer
    loadComponent('footer.html', 'footer-placeholder').catch(error => console.error('Error loading the footer:', error));
});

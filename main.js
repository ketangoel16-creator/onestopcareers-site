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

    const headerLoadedEvent = new Event('headerLoaded');

    loadComponent('header.html', 'header-placeholder').then(() => {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-link');

        navLinks.forEach(link => {
            const linkPage = (link.getAttribute('href') || '').split('/').pop();
            if (linkPage === currentPage) {
                link.classList.add('text-white', 'font-bold');
                link.classList.remove('text-gray-300');
            }
        });

        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }
        
        document.dispatchEvent(headerLoadedEvent);
    }).catch(error => console.error('Error loading the header:', error));

    loadComponent('footer.html', 'footer-placeholder').catch(error => console.error('Error loading the footer:', error));
});

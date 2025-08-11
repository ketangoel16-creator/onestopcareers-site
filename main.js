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

        // Handle active state for non-dropdown links
        navLinks.forEach(link => {
            if (!link.classList.contains('dropdown-toggle')) {
                const linkPage = (link.getAttribute('href') || '').split('/').pop();
                if (linkPage === currentPage) {
                    link.classList.add('text-white');
                    link.classList.remove('text-gray-300');
                }
            }
        });
        
        // Handle dropdowns
        const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
        dropdownToggles.forEach(toggle => {
            const menu = toggle.nextElementSibling;
            
            // Highlight parent dropdown if a child link is active
            const dropdownLinks = menu.querySelectorAll('a');
            dropdownLinks.forEach(link => {
                const linkPage = (link.getAttribute('href') || '').split('/').pop().split('#')[0];
                if (linkPage === currentPage) {
                     toggle.classList.add('text-white');
                     toggle.classList.remove('text-gray-300');
                }
            });

            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                // Close other open dropdowns
                document.querySelectorAll('.dropdown-menu').forEach(m => {
                    if (m !== menu) {
                        m.classList.add('hidden');
                    }
                });
                menu.classList.toggle('hidden');
            });
        });

        // Close dropdowns when clicking outside
        window.addEventListener('click', () => {
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.classList.add('hidden');
            });
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
